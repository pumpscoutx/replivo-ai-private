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
    const systemPrompt = `You are a browser automation expert. Convert natural language requests into step-by-step browser automation plans.

IMPORTANT RULES:
- Break down complex tasks into simple browser actions
- Each step should be a basic browser operation (click, fill, navigate, wait)
- Be specific about element targets using descriptive names
- Include wait conditions between steps when needed
- Estimate realistic timeouts for each step

Available actions:
- navigate: Go to a URL or page
- click: Click on buttons, links, or elements  
- fill: Fill form fields or text inputs
- wait: Wait for elements to appear or conditions to be met
- extract: Get text or data from page elements

Context: ${JSON.stringify(context)}

Return a JSON object with this structure:
{
  "steps": [
    {
      "action": "navigate|click|fill|wait|extract",
      "target": "descriptive element name or URL",
      "value": "text to fill or condition to wait for",
      "description": "human readable description",
      "timeout": 5000
    }
  ],
  "estimatedDuration": 30000,
  "confidence": 0.85,
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
    
    // Email tasks
    if (naturalLanguage.toLowerCase().includes('email')) {
      steps.push(
        { action: 'navigate', target: 'gmail', description: 'Open Gmail', timeout: 5000 },
        { action: 'wait', target: 'page_load', description: 'Wait for Gmail to load', timeout: 10000 },
        { action: 'click', target: 'compose button', description: 'Click compose', timeout: 3000 }
      );
      
      // Extract email if present
      const emailMatch = naturalLanguage.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      if (emailMatch) {
        steps.push({
          action: 'fill',
          target: 'recipient field',
          value: emailMatch[0],
          description: `Fill recipient: ${emailMatch[0]}`,
          timeout: 2000
        });
      }
    }
    
    // LinkedIn tasks
    else if (naturalLanguage.toLowerCase().includes('linkedin')) {
      steps.push(
        { action: 'navigate', target: 'linkedin', description: 'Open LinkedIn', timeout: 5000 },
        { action: 'wait', target: 'page_load', description: 'Wait for LinkedIn to load', timeout: 10000 }
      );
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
      estimatedDuration: steps.length * 3000,
      confidence: 0.6,
      requiresApproval: naturalLanguage.toLowerCase().includes('send') || 
                       naturalLanguage.toLowerCase().includes('submit')
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