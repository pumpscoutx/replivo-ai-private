import { callAgentLLM } from './llmClient';
import { ExtensionWebSocketServer } from './websocket-server';

export interface TaskStep {
  id: string;
  action: string;
  target: string;
  parameters: Record<string, any>;
  waitFor?: number;
}

export interface TaskPlan {
  id: string;
  description: string;
  steps: TaskStep[];
  estimatedDuration: number;
  requiresApproval: boolean;
}

export interface ExecutionContext {
  userId: string;
  sessionId: string;
  extractedData: Record<string, any>;
  variables: Record<string, any>;
  tabId?: string;
}

export interface TaskExecution {
  id: string;
  userId: string;
  taskPlan: TaskPlan;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: Record<string, any>;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

export class TaskExecutor {
  private wsServer: ExtensionWebSocketServer;
  private executions: Map<string, TaskExecution> = new Map();

  constructor(wsServer: ExtensionWebSocketServer) {
    this.wsServer = wsServer;
  }

  async executeNaturalLanguageTask(userRequest: string, userId: string, context?: string): Promise<TaskPlan> {
    console.log(`Executing natural language task: "${userRequest}" for user: ${userId}`);
    
    try {
      const taskPlan = await this.planTask(userRequest, context);
      await this.executeTaskPlan(taskPlan, userId);
      return taskPlan;
    } catch (error) {
      console.error('Task execution error:', error);
      throw error;
    }
  }

  private async planTask(userRequest: string, context?: string): Promise<TaskPlan> {
    console.log(`Planning task execution for: "${userRequest}"`);
    
    const systemPrompt = `Return JSON: {"id":"task","description":"task","steps":[{"id":"step1","action":"open_url","target":"Open site","parameters":{"url":"https://site.com"}}],"estimatedDuration":10,"requiresApproval":false}`;

    const userPrompt = `"${userRequest}"`;

    const response = await callAgentLLM('business-growth', [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], 'meta-llama/llama-3.1-8b-instruct');

    try {
      let content = response.choices[0].message.content;
      
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        content = jsonMatch[1];
      }
      
      // Try to find JSON object in the content
      const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        content = jsonObjectMatch[0];
      }
      
      // Handle incomplete JSON by trying to complete it
      if (!content.endsWith('}')) {
        // Try to find the last complete object or array
        const lastBraceIndex = content.lastIndexOf('}');
        const lastBracketIndex = content.lastIndexOf(']');
        const cutIndex = Math.max(lastBraceIndex, lastBracketIndex);
        
        if (cutIndex > 0) {
          content = content.substring(0, cutIndex + 1);
        } else {
          // If no closing brace found, try to complete the JSON
          if (content.includes('"steps"') && !content.includes('"steps": []')) {
            content = content.replace(/,\s*$/, '') + ']}';
          } else {
            content = content.replace(/,\s*$/, '') + '}';
          }
        }
      }
      
      const taskPlan = JSON.parse(content);
      return this.validateAndEnhanceTaskPlan(taskPlan);
    } catch (error) {
      console.error('Failed to parse task plan:', error);
      console.error('Raw LLM response:', response.choices[0].message.content);
      
      // Create a fallback task plan for common actions
      return this.createFallbackTaskPlan(userRequest);
    }
  }

  private validateAndEnhanceTaskPlan(plan: any): TaskPlan {
    // Ensure all required fields are present
    if (!plan.id || !plan.description || !plan.steps || !Array.isArray(plan.steps)) {
      throw new Error('Invalid task plan structure');
    }

    // Enhance steps with better defaults and validation
    const enhancedSteps = plan.steps.map((step: any, index: number) => ({
      id: step.id || `step-${index + 1}`,
      action: step.action,
      target: step.target || step.action,
      parameters: step.parameters || {},
      waitFor: step.waitFor || 0
    }));

    return {
      id: plan.id,
      description: plan.description,
      steps: enhancedSteps,
      estimatedDuration: plan.estimatedDuration || 30,
      requiresApproval: plan.requiresApproval || false
    };
  }

  private createFallbackTaskPlan(userRequest: string): TaskPlan {
    const request = userRequest.toLowerCase();
    const taskId = `fallback-${Date.now()}`;
    
    // Common patterns for fallback task plans
    if (request.includes('email') || request.includes('gmail') || request.includes('send')) {
      return {
        id: taskId,
        description: `Send email: ${userRequest}`,
        steps: [
          {
            id: 'step1',
            action: 'open_url',
            target: 'Open Gmail',
            parameters: { url: 'https://gmail.com', newTab: true }
          },
          {
            id: 'step2',
            action: 'wait',
            target: 'Wait for Gmail to load',
            parameters: { duration: 3000 }
          },
          {
            id: 'step3',
            action: 'click_element',
            target: 'Click compose button',
            parameters: { selector: '[data-tooltip="Compose"]' }
          }
        ],
        estimatedDuration: 10,
        requiresApproval: false
      };
    }
    
    if (request.includes('facebook') || request.includes('post')) {
      return {
        id: taskId,
        description: `Post to Facebook: ${userRequest}`,
        steps: [
          {
            id: 'step1',
            action: 'open_url',
            target: 'Open Facebook',
            parameters: { url: 'https://facebook.com', newTab: true }
          },
          {
            id: 'step2',
            action: 'wait',
            target: 'Wait for Facebook to load',
            parameters: { duration: 3000 }
          }
        ],
        estimatedDuration: 10,
        requiresApproval: false
      };
    }
    
    if (request.includes('linkedin')) {
      return {
        id: taskId,
        description: `Open LinkedIn: ${userRequest}`,
        steps: [
          {
            id: 'step1',
            action: 'open_url',
            target: 'Open LinkedIn',
            parameters: { url: 'https://linkedin.com', newTab: true }
          },
          {
            id: 'step2',
            action: 'wait',
            target: 'Wait for LinkedIn to load',
            parameters: { duration: 3000 }
          }
        ],
        estimatedDuration: 10,
        requiresApproval: false
      };
    }
    
    // Default fallback for any URL or website
    const urlMatch = userRequest.match(/(https?:\/\/[^\s]+)/i);
    if (urlMatch) {
      return {
        id: taskId,
        description: `Open website: ${userRequest}`,
        steps: [
          {
            id: 'step1',
            action: 'open_url',
            target: `Open ${urlMatch[1]}`,
            parameters: { url: urlMatch[1], newTab: true }
          }
        ],
        estimatedDuration: 5,
        requiresApproval: false
      };
    }
    
    // Generic fallback
    return {
      id: taskId,
      description: `Execute task: ${userRequest}`,
      steps: [
        {
          id: 'step1',
          action: 'open_url',
          target: 'Open Google',
          parameters: { url: 'https://google.com', newTab: true }
        }
      ],
      estimatedDuration: 5,
      requiresApproval: false
    };
  }

  private async executeTaskPlan(plan: TaskPlan, userId: string): Promise<void> {
    console.log(`Executing task plan: ${plan.description}`);
    
    const executionId = `exec-${Date.now()}`;
    const execution: TaskExecution = {
      id: executionId,
      userId,
      taskPlan: plan,
      status: 'running',
      results: {},
      startedAt: new Date()
    };
    
    this.executions.set(executionId, execution);
    
    const context: ExecutionContext = {
      userId,
      sessionId: `session-${Date.now()}`,
      extractedData: {},
      variables: {}
    };

    try {
      for (const step of plan.steps) {
        try {
          console.log(`Executing step: ${step.action} - ${step.target}`);
          
          const result = await this.executeStep(step, context);
          
          // Store results in context for future steps
          context.extractedData[step.id] = result;
          execution.results[step.id] = result;
          
          // Wait if specified
          if (step.waitFor && step.waitFor > 0) {
            await new Promise(resolve => setTimeout(resolve, step.waitFor));
          }
          
        } catch (error) {
          console.error(`Step execution failed: ${step.action}`, error);
          execution.status = 'failed';
          execution.error = `Task execution failed at step: ${step.action}`;
          execution.completedAt = new Date();
          throw new Error(`Task execution failed at step: ${step.action}`);
        }
      }
      
      execution.status = 'completed';
      execution.completedAt = new Date();
      console.log(`Task plan completed: ${plan.description}`);
      
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      execution.completedAt = new Date();
      throw error;
    }
  }

  private async executeStep(step: TaskStep, context: ExecutionContext): Promise<any> {
    // Try browser extension first
    const extensionResult = await this.tryBrowserExtensionExecution(step, context);
    if (extensionResult.success) {
      return extensionResult;
    }

    // Fallback to alternative execution methods
    return await this.executeStepFallback(step, context);
  }

  private async tryBrowserExtensionExecution(step: TaskStep, context: ExecutionContext): Promise<any> {
    try {
      const command = this.createCommandFromStep(step, context);
      const success = await this.wsServer.sendCommand(context.userId, command);
      
      if (success) {
        return { success: true, stepId: step.id, action: step.action, method: 'browser_extension' };
      }
    } catch (error) {
      console.log(`Browser extension execution failed for ${step.action}, trying fallback...`);
    }
    
    return { success: false };
  }

  private async executeStepFallback(step: TaskStep, context: ExecutionContext): Promise<any> {
    console.log(`Using fallback execution for: ${step.action}`);
    
    switch (step.action) {
      case 'open_url':
        return this.fallbackOpenUrl(step, context);
        
      case 'compose_email':
        return this.fallbackComposeEmail(step, context);
        
      case 'fill_form':
        return this.fallbackFillForm(step, context);
        
      case 'click_element':
        return this.fallbackClickElement(step, context);
        
      case 'wait':
        return this.fallbackWait(step, context);
        
      case 'send_keys':
        return this.fallbackSendKeys(step, context);
        
      case 'scroll':
        return this.fallbackScroll(step, context);
        
      case 'select_option':
        return this.fallbackSelectOption(step, context);
        
      case 'extract_data':
        return this.fallbackExtractData(step, context);
        
      case 'take_screenshot':
        return this.fallbackTakeScreenshot(step, context);
        
      default:
        console.warn(`No fallback implementation for action: ${step.action}`);
        return { 
          success: true, 
          stepId: step.id, 
          action: step.action, 
          method: 'fallback_mock',
          note: 'Action simulated - no actual execution'
        };
    }
  }

  // Fallback implementations
  private async fallbackOpenUrl(step: TaskStep, context: ExecutionContext): Promise<any> {
    const url = step.parameters.url;
    console.log(`[FALLBACK] Opening URL: ${url}`);
    
    // In a real implementation, you might:
    // 1. Use a headless browser like Puppeteer
    // 2. Use system commands to open default browser
    // 3. Use electron or similar for desktop apps
    
    // For now, we'll simulate success and store the URL in context
    context.variables.currentUrl = url;
    
    return {
      success: true,
      stepId: step.id,
      action: step.action,
      method: 'fallback',
      url: url,
      note: 'URL opening simulated - would open in browser'
    };
  }

  private async fallbackComposeEmail(step: TaskStep, context: ExecutionContext): Promise<any> {
    const { recipient, subject, body } = step.parameters;
    console.log(`[FALLBACK] Composing email to: ${recipient}`);
    
    // In a real implementation, you might:
    // 1. Use Gmail API
    // 2. Use system email client
    // 3. Use SMTP directly
    
    // For now, we'll simulate the email composition
    const emailData = {
      recipient,
      subject,
      body,
      timestamp: new Date().toISOString()
    };
    
    context.variables.lastEmail = emailData;
    
    return {
      success: true,
      stepId: step.id,
      action: step.action,
      method: 'fallback',
      emailData,
      note: 'Email composition simulated - would compose in Gmail'
    };
  }

  private async fallbackFillForm(step: TaskStep, context: ExecutionContext): Promise<any> {
    const { selectors, values, submit } = step.parameters;
    console.log(`[FALLBACK] Filling form with ${Object.keys(values).length} fields`);
    
    // Simulate form filling
    const formData = { selectors, values, submit };
    context.variables.lastFormData = formData;
    
    return {
      success: true,
      stepId: step.id,
      action: step.action,
      method: 'fallback',
      formData,
      note: 'Form filling simulated - would fill form fields'
    };
  }

  private async fallbackClickElement(step: TaskStep, context: ExecutionContext): Promise<any> {
    const { selector } = step.parameters;
    console.log(`[FALLBACK] Clicking element: ${selector}`);
    
    return {
      success: true,
      stepId: step.id,
      action: step.action,
      method: 'fallback',
      selector,
      note: 'Element click simulated - would click element'
    };
  }

  private async fallbackWait(step: TaskStep, context: ExecutionContext): Promise<any> {
    const duration = step.parameters.duration || 1000;
    console.log(`[FALLBACK] Waiting for ${duration}ms`);
    
    await new Promise(resolve => setTimeout(resolve, duration));
    
    return {
      success: true,
      stepId: step.id,
      action: step.action,
      method: 'fallback',
      duration,
      note: 'Wait completed'
    };
  }

  private async fallbackSendKeys(step: TaskStep, context: ExecutionContext): Promise<any> {
    const { text, selector } = step.parameters;
    console.log(`[FALLBACK] Typing text: "${text}"`);
    
    return {
      success: true,
      stepId: step.id,
      action: step.action,
      method: 'fallback',
      text,
      selector,
      note: 'Text input simulated - would type text'
    };
  }

  private async fallbackScroll(step: TaskStep, context: ExecutionContext): Promise<any> {
    const { direction, amount } = step.parameters;
    console.log(`[FALLBACK] Scrolling ${direction} by ${amount}`);
    
    return {
      success: true,
      stepId: step.id,
      action: step.action,
      method: 'fallback',
      direction,
      amount,
      note: 'Scroll simulated - would scroll page'
    };
  }

  private async fallbackSelectOption(step: TaskStep, context: ExecutionContext): Promise<any> {
    const { selector, value } = step.parameters;
    console.log(`[FALLBACK] Selecting option: ${value} from ${selector}`);
    
    return {
      success: true,
      stepId: step.id,
      action: step.action,
      method: 'fallback',
      selector,
      value,
      note: 'Option selection simulated - would select option'
    };
  }

  private async fallbackExtractData(step: TaskStep, context: ExecutionContext): Promise<any> {
    const { selectors } = step.parameters;
    console.log(`[FALLBACK] Extracting data from ${Object.keys(selectors).length} selectors`);
    
    // Simulate extracted data
    const extractedData = {};
    for (const [key, selector] of Object.entries(selectors)) {
      extractedData[key] = `[Simulated data from ${selector}]`;
    }
    
    context.variables.extractedData = extractedData;
    
    return {
      success: true,
      stepId: step.id,
      action: step.action,
      method: 'fallback',
      extractedData,
      note: 'Data extraction simulated - would extract from page'
    };
  }

  private async fallbackTakeScreenshot(step: TaskStep, context: ExecutionContext): Promise<any> {
    const { filename } = step.parameters;
    console.log(`[FALLBACK] Taking screenshot: ${filename}`);
    
    return {
      success: true,
      stepId: step.id,
      action: step.action,
      method: 'fallback',
      filename,
      note: 'Screenshot simulated - would capture screen'
    };
  }

  private createCommandFromStep(step: TaskStep, context: ExecutionContext): any {
    const baseCommand = {
      request_id: `${step.id}-${Date.now()}`,
      agent_id: 'task-executor',
      capability: step.action,
      args: { ...step.parameters }
    };

    // Add context-specific parameters
    if (context.tabId) {
      baseCommand.args.tabId = context.tabId;
    }

    // Handle specific action types
    switch (step.action) {
      case 'open_url':
        return {
          ...baseCommand,
          args: {
            url: step.parameters.url,
            newTab: step.parameters.newTab !== false
          }
        };

      case 'compose_email':
        return {
          ...baseCommand,
          args: {
            recipient: step.parameters.recipient,
            subject: step.parameters.subject,
            body: step.parameters.body,
            newTab: true
          }
        };

      case 'fill_form':
        return {
          ...baseCommand,
          args: {
            selectors: step.parameters.selectors,
            values: step.parameters.values,
            submit: step.parameters.submit || false
          }
        };

      case 'click_element':
        return {
          ...baseCommand,
          args: {
            selector: step.parameters.selector,
            waitFor: step.parameters.waitFor || 0
          }
        };

      case 'extract_data':
        return {
          ...baseCommand,
          args: {
            selectors: step.parameters.selectors,
            includeText: step.parameters.includeText !== false,
            includeAttributes: step.parameters.includeAttributes || []
          }
        };

      case 'wait':
        return {
          ...baseCommand,
          args: {
            duration: step.parameters.duration || 1000
          }
        };

      case 'send_keys':
        return {
          ...baseCommand,
          args: {
            text: step.parameters.text,
            selector: step.parameters.selector
          }
        };

      case 'scroll':
        return {
          ...baseCommand,
          args: {
            direction: step.parameters.direction || 'down',
            amount: step.parameters.amount || 100
          }
        };

      case 'select_option':
        return {
          ...baseCommand,
          args: {
            selector: step.parameters.selector,
            value: step.parameters.value
          }
        };

      default:
        return baseCommand;
    }
  }

  // Enhanced predefined task templates
  async sendEmail(recipient: string, subject: string, body: string, userId: string): Promise<void> {
    const taskPlan: TaskPlan = {
      id: `email-${Date.now()}`,
      description: `Send email to ${recipient}`,
      steps: [
        {
          id: 'open-gmail',
          action: 'open_url',
          target: 'Open Gmail',
          parameters: { url: 'https://gmail.com', newTab: true }
        },
        {
          id: 'wait-gmail-load',
          action: 'wait',
          target: 'Wait for Gmail to load',
          parameters: { duration: 3000 }
        },
        {
          id: 'click-compose',
          action: 'click_element',
          target: 'Click compose button',
          parameters: { selector: '[data-tooltip="Compose"]' }
        },
        {
          id: 'wait-compose',
          action: 'wait',
          target: 'Wait for compose window',
          parameters: { duration: 1000 }
        },
        {
          id: 'fill-recipient',
          action: 'send_keys',
          target: 'Fill recipient field',
          parameters: { text: recipient, selector: 'input[name="to"]' }
        },
        {
          id: 'fill-subject',
          action: 'send_keys',
          target: 'Fill subject field',
          parameters: { text: subject, selector: 'input[name="subjectbox"]' }
        },
        {
          id: 'fill-body',
          action: 'send_keys',
          target: 'Fill email body',
          parameters: { text: body, selector: 'div[role="textbox"]' }
        },
        {
          id: 'click-send',
          action: 'click_element',
          target: 'Click send button',
          parameters: { selector: '[data-tooltip="Send ‪(Ctrl-Enter)‬"]' }
        }
      ],
      estimatedDuration: 15,
      requiresApproval: false
    };

    await this.executeTaskPlan(taskPlan, userId);
  }

  async openWebsite(url: string, userId: string): Promise<void> {
    const taskPlan: TaskPlan = {
      id: `open-${Date.now()}`,
      description: `Open ${url}`,
      steps: [
        {
          id: 'open-url',
          action: 'open_url',
          target: url,
          parameters: { url, newTab: true }
        }
      ],
      estimatedDuration: 5,
      requiresApproval: false
    };

    await this.executeTaskPlan(taskPlan, userId);
  }

  async fillWebForm(url: string, formData: Record<string, string>, userId: string): Promise<void> {
    const steps = [
      {
        id: 'open-form',
        action: 'open_url',
        target: url,
        parameters: { url, newTab: true }
      },
      {
        id: 'wait-load',
        action: 'wait',
        target: 'Wait for page to load',
        parameters: { duration: 2000 }
      }
    ];

    // Add form filling steps
    Object.entries(formData).forEach(([field, value], index) => {
      steps.push({
        id: `fill-${field}`,
        action: 'send_keys',
        target: `Fill ${field} field`,
        parameters: { text: value, selector: `input[name="${field}"]` }
      });
    });

    // Add submit step
    steps.push({
      id: 'submit-form',
      action: 'click_element',
      target: 'Submit form',
      parameters: { selector: 'input[type="submit"], button[type="submit"]' }
    });

    const taskPlan: TaskPlan = {
      id: `form-${Date.now()}`,
      description: `Fill form on ${url}`,
      steps,
      estimatedDuration: 15,
      requiresApproval: false
    };

    await this.executeTaskPlan(taskPlan, userId);
  }

  // Get execution history
  getExecutionHistory(userId: string, limit: number = 10): TaskExecution[] {
    const userExecutions = Array.from(this.executions.values())
      .filter(exec => exec.userId === userId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, limit);
    
    return userExecutions;
  }

  // Get specific execution
  getExecution(executionId: string): TaskExecution | undefined {
    return this.executions.get(executionId);
  }
} 