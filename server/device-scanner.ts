// Device tool detection system for real-time scanning of user's applications and services
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export interface DetectedTool {
  name: string;
  category: string;
  executable: string;
  version?: string;
  installed: boolean;
  permissions: string[];
  icon?: string;
}

export interface BrowserTool {
  name: string;
  category: string;
  url: string;
  isLoggedIn: boolean;
  permissions: string[];
}

export class DeviceScanner {
  private static instance: DeviceScanner;
  private detectedTools: DetectedTool[] = [];
  private browserTools: BrowserTool[] = [];

  public static getInstance(): DeviceScanner {
    if (!DeviceScanner.instance) {
      DeviceScanner.instance = new DeviceScanner();
    }
    return DeviceScanner.instance;
  }

  // Scan system for installed applications
  public async scanInstalledApplications(): Promise<DetectedTool[]> {
    const tools: DetectedTool[] = [];
    
    try {
      // Windows applications
      if (process.platform === 'win32') {
        tools.push(...await this.scanWindowsApps());
      }
      // macOS applications  
      else if (process.platform === 'darwin') {
        tools.push(...await this.scanMacApps());
      }
      // Linux applications
      else if (process.platform === 'linux') {
        tools.push(...await this.scanLinuxApps());
      }

      // Cross-platform browser-based tools
      tools.push(...await this.scanBrowserTools());
      
    } catch (error) {
      console.error('Error scanning applications:', error);
    }

    this.detectedTools = tools;
    return tools;
  }

  private async scanWindowsApps(): Promise<DetectedTool[]> {
    const tools: DetectedTool[] = [];
    
    try {
      // Check for common business applications
      const commonApps = [
        { name: 'Microsoft Excel', path: 'excel.exe', category: 'productivity' },
        { name: 'Microsoft Word', path: 'winword.exe', category: 'productivity' },
        { name: 'Microsoft PowerPoint', path: 'powerpnt.exe', category: 'productivity' },
        { name: 'Microsoft Outlook', path: 'outlook.exe', category: 'email' },
        { name: 'Google Chrome', path: 'chrome.exe', category: 'browser' },
        { name: 'Mozilla Firefox', path: 'firefox.exe', category: 'browser' },
        { name: 'Slack', path: 'Slack.exe', category: 'communication' },
        { name: 'Zoom', path: 'Zoom.exe', category: 'communication' },
        { name: 'Adobe Acrobat', path: 'Acrobat.exe', category: 'productivity' },
        { name: 'Notepad++', path: 'notepad++.exe', category: 'development' }
      ];

      for (const app of commonApps) {
        try {
          const { stdout } = await execAsync(`where ${app.path}`);
          if (stdout.trim()) {
            tools.push({
              name: app.name,
              category: app.category,
              executable: app.path,
              installed: true,
              permissions: this.getAppPermissions(app.category)
            });
          }
        } catch (error) {
          // App not found, continue
        }
      }
    } catch (error) {
      console.error('Error scanning Windows apps:', error);
    }

    return tools;
  }

  private async scanMacApps(): Promise<DetectedTool[]> {
    const tools: DetectedTool[] = [];
    
    try {
      const commonApps = [
        { name: 'Microsoft Excel', bundle: 'com.microsoft.Excel', category: 'productivity' },
        { name: 'Microsoft Word', bundle: 'com.microsoft.Word', category: 'productivity' },
        { name: 'Microsoft PowerPoint', bundle: 'com.microsoft.PowerPoint', category: 'productivity' },
        { name: 'Microsoft Outlook', bundle: 'com.microsoft.Outlook', category: 'email' },
        { name: 'Google Chrome', bundle: 'com.google.Chrome', category: 'browser' },
        { name: 'Safari', bundle: 'com.apple.Safari', category: 'browser' },
        { name: 'Slack', bundle: 'com.tinyspeck.slackmacgap', category: 'communication' },
        { name: 'Zoom', bundle: 'us.zoom.xos', category: 'communication' },
        { name: 'Adobe Acrobat DC', bundle: 'com.adobe.Acrobat.Pro', category: 'productivity' }
      ];

      for (const app of commonApps) {
        try {
          const { stdout } = await execAsync(`mdfind "kMDItemCFBundleIdentifier == '${app.bundle}'"`);
          if (stdout.trim()) {
            tools.push({
              name: app.name,
              category: app.category,
              executable: app.bundle,
              installed: true,
              permissions: this.getAppPermissions(app.category)
            });
          }
        } catch (error) {
          // App not found, continue
        }
      }
    } catch (error) {
      console.error('Error scanning macOS apps:', error);
    }

    return tools;
  }

  private async scanLinuxApps(): Promise<DetectedTool[]> {
    const tools: DetectedTool[] = [];
    
    try {
      const commonApps = [
        { name: 'LibreOffice Calc', cmd: 'libreoffice', category: 'productivity' },
        { name: 'LibreOffice Writer', cmd: 'libreoffice', category: 'productivity' },
        { name: 'Google Chrome', cmd: 'google-chrome', category: 'browser' },
        { name: 'Mozilla Firefox', cmd: 'firefox', category: 'browser' },
        { name: 'Slack', cmd: 'slack', category: 'communication' },
        { name: 'Visual Studio Code', cmd: 'code', category: 'development' },
        { name: 'Git', cmd: 'git', category: 'development' }
      ];

      for (const app of commonApps) {
        try {
          const { stdout } = await execAsync(`which ${app.cmd}`);
          if (stdout.trim()) {
            tools.push({
              name: app.name,
              category: app.category,
              executable: app.cmd,
              installed: true,
              permissions: this.getAppPermissions(app.category)
            });
          }
        } catch (error) {
          // App not found, continue
        }
      }
    } catch (error) {
      console.error('Error scanning Linux apps:', error);
    }

    return tools;
  }

  private async scanBrowserTools(): Promise<DetectedTool[]> {
    const tools: DetectedTool[] = [];
    
    // These will be detected via browser extension
    const browserServices = [
      { name: 'Gmail', category: 'email', permissions: ['email:send', 'email:read'] },
      { name: 'Google Calendar', category: 'productivity', permissions: ['calendar:create', 'calendar:read'] },
      { name: 'Google Drive', category: 'storage', permissions: ['file:read', 'file:write'] },
      { name: 'Microsoft 365', category: 'productivity', permissions: ['office:edit', 'email:send'] },
      { name: 'Slack Web', category: 'communication', permissions: ['message:send', 'channel:read'] },
      { name: 'Trello', category: 'productivity', permissions: ['board:edit', 'card:create'] },
      { name: 'Asana', category: 'productivity', permissions: ['task:create', 'project:edit'] },
      { name: 'Salesforce', category: 'crm', permissions: ['contact:edit', 'lead:create'] },
      { name: 'HubSpot', category: 'crm', permissions: ['contact:edit', 'deal:create'] },
      { name: 'WordPress', category: 'cms', permissions: ['post:create', 'page:edit'] },
      { name: 'Shopify', category: 'ecommerce', permissions: ['product:edit', 'order:read'] }
    ];

    // Mark as available but not verified (browser extension will verify)
    for (const service of browserServices) {
      tools.push({
        name: service.name,
        category: service.category,
        executable: 'browser',
        installed: true,
        permissions: service.permissions
      });
    }

    return tools;
  }

  private getAppPermissions(category: string): string[] {
    const permissionMap: Record<string, string[]> = {
      'productivity': ['file:read', 'file:write', 'document:edit'],
      'email': ['email:send', 'email:read', 'contact:read'],
      'browser': ['web:navigate', 'web:click', 'web:form'],
      'communication': ['message:send', 'call:start', 'meeting:join'],
      'development': ['code:edit', 'git:commit', 'deploy:execute'],
      'crm': ['contact:edit', 'lead:create', 'deal:update'],
      'cms': ['post:create', 'page:edit', 'media:upload'],
      'ecommerce': ['product:edit', 'order:process', 'inventory:update']
    };
    
    return permissionMap[category] || ['basic:access'];
  }

  // Get tools detected by browser extension
  public async getBrowserDetectedTools(userId: string): Promise<BrowserTool[]> {
    // This would typically query the browser extension via WebSocket
    // For now, return cached browser tools
    return this.browserTools;
  }

  // Update browser tools from extension
  public updateBrowserTools(tools: BrowserTool[]): void {
    this.browserTools = tools;
  }

  // Get all detected tools for a user
  public async getDetectedTools(userId: string): Promise<{
    installed: DetectedTool[],
    browser: BrowserTool[]
  }> {
    const installed = await this.scanInstalledApplications();
    const browser = await this.getBrowserDetectedTools(userId);
    
    return {
      installed,
      browser
    };
  }

  // Get tools by category
  public getToolsByCategory(category: string): DetectedTool[] {
    return this.detectedTools.filter(tool => tool.category === category);
  }
}