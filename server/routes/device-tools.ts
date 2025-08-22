// API routes for device tool detection and configuration
import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { DeviceScanner } from '../device-scanner';

export const deviceToolsRouter = Router();

// Scan user device for available tools
deviceToolsRouter.post('/scan/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const scanner = DeviceScanner.getInstance();
    
    // Scan device for installed applications
    const detectedTools = await scanner.getDetectedTools(userId);
    
    // Save detected tools to storage
    const toolsToSave = detectedTools.installed.map(tool => ({
      userId,
      toolName: tool.name,
      category: tool.category,
      executable: tool.executable,
      version: tool.version,
      installed: tool.installed,
      permissions: tool.permissions
    }));

    await storage.saveDetectedTools(userId, toolsToSave);
    
    res.json({
      success: true,
      installed: detectedTools.installed,
      browser: detectedTools.browser,
      totalFound: detectedTools.installed.length + detectedTools.browser.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Device scan error:', error);
    res.status(500).json({ error: 'Failed to scan device tools' });
  }
});

// Get detected tools for a user
deviceToolsRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const tools = await storage.getDetectedTools(userId);
    
    res.json({
      success: true,
      tools,
      count: tools.length
    });

  } catch (error) {
    console.error('Error fetching detected tools:', error);
    res.status(500).json({ error: 'Failed to fetch detected tools' });
  }
});

// Update tool login status (from browser extension)
const updateToolSchema = z.object({
  toolName: z.string(),
  isLoggedIn: z.boolean().optional(),
  version: z.string().optional(),
  permissions: z.array(z.string()).optional()
});

deviceToolsRouter.patch('/:userId/:toolId', async (req, res) => {
  try {
    const { userId, toolId } = req.params;
    const validatedData = updateToolSchema.parse(req.body);
    
    await storage.updateDetectedTool(toolId, validatedData);
    
    res.json({ success: true });

  } catch (error) {
    console.error('Error updating tool:', error);
    res.status(500).json({ error: 'Failed to update tool' });
  }
});

// Browser extension reports available tools
const browserToolsSchema = z.object({
  tools: z.array(z.object({
    name: z.string(),
    category: z.string(),
    url: z.string(),
    isLoggedIn: z.boolean(),
    permissions: z.array(z.string())
  }))
});

deviceToolsRouter.post('/:userId/browser-tools', async (req, res) => {
  try {
    const { userId } = req.params;
    const validatedData = browserToolsSchema.parse(req.body);
    
    const scanner = DeviceScanner.getInstance();
    scanner.updateBrowserTools(validatedData.tools);
    
    // Save browser tools to storage as well
    const browserToolsToSave = validatedData.tools.map(tool => ({
      userId,
      toolName: tool.name,
      category: tool.category,
      executable: 'browser',
      installed: true,
      isLoggedIn: tool.isLoggedIn,
      permissions: tool.permissions
    }));

    // Update existing browser tools or create new ones
    for (const toolData of browserToolsToSave) {
      const existing = await storage.getDetectedTools(userId);
      const existingTool = existing.find(t => t.toolName === toolData.toolName && t.executable === 'browser');
      
      if (existingTool) {
        await storage.updateDetectedTool(existingTool.id, {
          isLoggedIn: toolData.isLoggedIn,
          permissions: toolData.permissions
        });
      } else {
        await storage.saveDetectedTools(userId, [toolData]);
      }
    }
    
    res.json({ success: true });

  } catch (error) {
    console.error('Error updating browser tools:', error);
    res.status(500).json({ error: 'Failed to update browser tools' });
  }
});

// Get tools by category for agent configuration
deviceToolsRouter.get('/:userId/category/:category', async (req, res) => {
  try {
    const { userId, category } = req.params;
    const allTools = await storage.getDetectedTools(userId);
    const categoryTools = allTools.filter(tool => tool.category === category);
    
    res.json({
      success: true,
      tools: categoryTools,
      count: categoryTools.length
    });

  } catch (error) {
    console.error('Error fetching tools by category:', error);
    res.status(500).json({ error: 'Failed to fetch tools by category' });
  }
});