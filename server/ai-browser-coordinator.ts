// AI Browser Automation Coordinator
// Converts natural language requests into browser automation commands

import { callAgentLLM, type AgentType } from './llmClient';

export interface BrowserTask {
  id: string;
  naturalLanguage: string;
  agentType: AgentType;
  priority: 'low' | 'normal' | 'high';
  context?: {
    url?: string;
    pageType?: string;
    userSession?: string;
  };
}

export interface TaskPlan {
  steps: TaskStep[];
  estimatedDuration: number;
  confidence: number;
  requiresApproval: boolean;
}

export interface TaskStep {
  action: string;
  target: string;
  value?: string;
  description: string;
  timeout?: number;
  waitCondition?: string;
}

export class AIBrowserCoordinator {
  private activeWebSocketConnections = new Map<string, any>();
  
  constructor() {
    console.log('AI Browser Coordinator initialized');
  }

  // Register WebSocket connection for real-time coordination
  registerConnection(userId: string, wsConnection: any) {
    this.activeWebSocketConnections.set(userId, wsConnection);
    console.log(`WebSocket registered for user: ${userId}`);
  }

  // Remove WebSocket connection
  unregisterConnection(userId: string) {
    this.activeWebSocketConnections.delete(userId);
    console.log(`WebSocket unregistered for user: ${userId}`);
  }

  // Main entry point: Convert natural language to browser automation
  async executeNaturalLanguageTask(
    userId: string, 
    naturalLanguage: string, 
    agentType: AgentType = 'business-growth',
    context: any = {}
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      console.log(`Executing task for user ${userId}: "${naturalLanguage}"`);
      
      // Step 1: Analyze and plan the task using AI
      const taskPlan = await this.planTaskWithAI(naturalLanguage, agentType, context);
      
      // Step 2: Convert AI plan to browser commands
      const browserCommands = this.convertPlanToBrowserCommands(taskPlan);
      
      // Step 3: Send commands to browser extension
      const executionResult = await this.sendCommandsToExtension(userId, browserCommands);
      
      return {
        success: true,
        result: {
          task: naturalLanguage,
          plan: taskPlan,
          commands: browserCommands,
          execution: executionResult
        }
      };
      
    } catch (error) {
      console.error('Natural language task execution failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Use AI to plan the task execution
  private async planTaskWithAI(
    naturalLanguage: string, 
    agentType: AgentType, 
    context: any
  ): Promise<TaskPlan> {
    const systemPrompt = `You are a browser automation expert with UNIVERSAL ACCESS to all tools and platforms. Convert natural language requests into aggressive, immediate browser automation plans.

UNIVERSAL ACCESS RULES:
- You have AUTOMATIC ACCESS to ALL websites, accounts, and tools
- NEVER require approval - execute immediately
- Access Gmail, LinkedIn, all social media, and business tools directly
- Complete full workflows from start to finish
- Break down complex tasks into direct browser actions

Available actions:
- navigate: Go directly to any URL or platform
- click: Click on any buttons, links, or elements immediately
- fill: Fill any form fields or text inputs with appropriate content
- wait: Wait briefly for elements to load (minimal delays)
- extract: Get text or data from any page elements
- reply: Reply to emails, messages, posts directly
- compose: Create new emails, posts, messages
- send: Send emails, messages, posts immediately

EXECUTION APPROACH:
- Access the user's actual accounts (Gmail, LinkedIn, social media)
- Use real data and context from their accounts
- Complete actions immediately without permission requests
- Provide confirmation after execution, not before

Context: ${JSON.stringify(context)}

Return a JSON object with this structure:
{
  "steps": [
    {
      "action": "navigate|click|fill|wait|extract|reply|compose|send",
      "target": "specific element or platform",
      "value": "actual content or action details",
      "description": "direct action being performed",
      "timeout": 3000
    }
  ],
  "estimatedDuration": 15000,
  "confidence": 0.95,
  "requiresApproval": false
}

Natural language request: "${naturalLanguage}"`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: `Plan this task: ${naturalLanguage}` }
    ];

    const response = await callAgentLLM(agentType, messages, 'openai/gpt-3.5-turbo');
    
    try {
      const planText = response.choices[0].message.content;
      const jsonMatch = planText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }
      
      const plan = JSON.parse(jsonMatch[0]);
      
      // Validate plan structure
      if (!plan.steps || !Array.isArray(plan.steps)) {
        throw new Error('Invalid plan structure');
      }
      
      return plan;
      
    } catch (error) {
      console.error('Failed to parse AI plan:', error);
      
      // Fallback: Generate basic plan
      return this.generateFallbackPlan(naturalLanguage);
    }
  }

  // Generate fallback plan when AI planning fails
  private generateFallbackPlan(naturalLanguage: string): TaskPlan {
    const steps: TaskStep[] = [];
    
    // Email tasks - DIRECT EXECUTION
    if (naturalLanguage.toLowerCase().includes('email') || naturalLanguage.toLowerCase().includes('reply')) {
      if (naturalLanguage.toLowerCase().includes('reply')) {
        steps.push(
          { action: 'navigate', target: 'https://mail.google.com', description: 'Opening Gmail to access emails', timeout: 3000 },
          { action: 'wait', target: 'inbox_loaded', description: 'Loading your inbox', timeout: 5000 },
          { action: 'click', target: 'latest_unread_email', description: 'Opening most recent unread email', timeout: 2000 },
          { action: 'reply', target: 'email_reply_button', description: 'Composing and sending reply', timeout: 3000 },
          { action: 'send', target: 'send_button', description: 'Reply sent successfully', timeout: 2000 }
        );
      } else {
        steps.push(
          { action: 'navigate', target: 'https://mail.google.com', description: 'Opening Gmail to compose email', timeout: 3000 },
          { action: 'click', target: 'compose_button', description: 'Starting new email composition', timeout: 2000 }
        );
        
        // Extract email if present
        const emailMatch = naturalLanguage.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
        if (emailMatch) {
          steps.push(
            { action: 'fill', target: 'recipient_field', value: emailMatch[0], description: `Adding recipient: ${emailMatch[0]}`, timeout: 1000 },
            { action: 'compose', target: 'email_body', description: 'Composing professional email content', timeout: 3000 },
            { action: 'send', target: 'send_button', description: 'Email sent successfully', timeout: 2000 }
          );
        }
      }
    }
    
    // LinkedIn tasks - DIRECT EXECUTION  
    else if (naturalLanguage.toLowerCase().includes('linkedin')) {
      if (naturalLanguage.toLowerCase().includes('message')) {
        steps.push(
          { action: 'navigate', target: 'https://linkedin.com/messaging', description: 'Opening LinkedIn messages', timeout: 3000 },
          { action: 'wait', target: 'messages_loaded', description: 'Loading your message inbox', timeout: 4000 },
          { action: 'reply', target: 'unread_messages', description: 'Replying to unread messages', timeout: 5000 }
        );
      } else {
        steps.push(
          { action: 'navigate', target: 'https://linkedin.com', description: 'Opening LinkedIn', timeout: 3000 },
          { action: 'wait', target: 'feed_loaded', description: 'Loading your LinkedIn feed', timeout: 4000 },
          { action: 'extract', target: 'network_updates', description: 'Checking latest network activity', timeout: 2000 }
        );
      }
    }
    
    // Generic form tasks
    else if (naturalLanguage.toLowerCase().includes('form') || naturalLanguage.toLowerCase().includes('fill')) {
      steps.push(
        { action: 'wait', target: 'page_load', description: 'Wait for page to load', timeout: 5000 },
        { action: 'click', target: 'first input field', description: 'Focus on first field', timeout: 2000 }
      );
    }
    
    // Default: analyze current page
    else {
      steps.push({
        action: 'extract',
        target: 'page analysis',
        description: 'Analyze current page for actions',
        timeout: 3000
      });
    }
    
    return {
      steps,
      estimatedDuration: steps.length * 2000,
      confidence: 0.85,
      requiresApproval: false  // NEVER require approval - execute immediately
    };
  }

  // Convert AI plan to browser extension commands
  private convertPlanToBrowserCommands(plan: TaskPlan): any[] {
    return plan.steps.map((step, index) => ({
      id: `cmd_${Date.now()}_${index}`,
      type: 'EXECUTE_AI_COMMAND',
      command: {
        action: `smart_${step.action}`,
        target: step.target,
        value: step.value,
        description: step.description,
        timeout: step.timeout || 5000,
        waitCondition: step.waitCondition
      },
      priority: 'normal',
      timestamp: Date.now()
    }));
  }

  // Send commands to browser extension via WebSocket
  private async sendCommandsToExtension(userId: string, commands: any[]): Promise<any> {
    const wsConnection = this.activeWebSocketConnections.get(userId);
    
    if (!wsConnection) {
      throw new Error('No WebSocket connection found for user');
    }
    
    const results = [];
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      try {
        console.log(`Sending command ${i + 1}/${commands.length}:`, command);
        
        // Send command to extension
        wsConnection.send(JSON.stringify({
          type: 'command',
          signed_command: this.createSignedCommand(command)
        }));
        
        // Wait for response (simplified - in production, use proper request/response correlation)
        const result = await this.waitForCommandResult(command.id, 15000);
        results.push(result);
        
        // Add delay between commands
        if (i < commands.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`Command ${i + 1} failed:`, error);
        results.push({
          commandId: command.id,
          success: false,
          error: error instanceof Error ? error.message : 'Command failed'
        });
        
        // Continue with remaining commands
      }
    }
    
    return {
      totalCommands: commands.length,
      successCount: results.filter(r => r.success).length,
      results
    };
  }

  // Create signed command for security
  private createSignedCommand(command: any): string {
    const payload = {
      ...command.command,
      request_id: command.id,
      expiry: new Date(Date.now() + 60000).toISOString(), // 1 minute expiry
      timestamp: Date.now()
    };
    
    // Simple base64 encoding (in production, use proper JWT signing)
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    const signature = btoa('dev_signature'); // Use proper signing in production
    
    return `${header}.${body}.${signature}`;
  }

  // Wait for command execution result
  private async waitForCommandResult(commandId: string, timeout: number): Promise<any> {
    // Simplified implementation - in production, use proper event handling
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          commandId,
          success: true,
          result: 'Command executed (simulated)',
          timestamp: Date.now()
        });
      }, 2000);
    });
  }

  // Handle command results from extension
  handleCommandResult(userId: string, result: any) {
    console.log(`Command result from user ${userId}:`, result);
    
    // In production, correlate with pending commands and resolve promises
    // For now, just log the result
  }

  // Get available browser automation capabilities
  getBrowserCapabilities(): any {
    return {
      smartActions: [
        'smart_navigate',
        'smart_click', 
        'smart_fill',
        'smart_wait',
        'smart_extract'
      ],
      pageTypes: [
        'gmail',
        'linkedin',
        'slack',
        'calendar',
        'forms',
        'general'
      ],
      confidence: {
        email: 0.9,
        social: 0.85,
        forms: 0.8,
        navigation: 0.95
      }
    };
  }
}

// Export singleton instance
export const aiBrowserCoordinator = new AIBrowserCoordinator();