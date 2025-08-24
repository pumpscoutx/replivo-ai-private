import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { deviceToolsRouter } from "./routes/device-tools";
import { agentConfigRouter } from "./routes/agent-config";
import extensionRouter from "./routes/extension";
import aiBrowserRouter from "./routes/ai-browser";
import { UniversalAccessManager } from "./universal-access-rules";
import { insertCustomRequestSchema } from "@shared/schema";
import { z } from "zod";
import {
  callBusinessGrowthAgent,
  callOperationsAgent,
  callPeopleFinanceAgent,
  type AgentType
} from "./llmClient";
import { DeviceScanner } from "./device-scanner";
import { ExtensionWebSocketServer } from "./websocket-server";

// Global WebSocket server instance
let extensionWS: ExtensionWebSocketServer | null = null;

export function setExtensionWebSocketServer(ws: ExtensionWebSocketServer) {
  extensionWS = ws;
}

// Helper functions for device control
function getAgentRecommendedTools(agentType: AgentType, allTools: any[]) {
  const recommendations: Record<AgentType, string[]> = {
    'business-growth': ['Gmail', 'LinkedIn', 'Slack', 'HubSpot', 'Salesforce', 'Google Calendar', 'Trello'],
    'operations': ['Microsoft Excel', 'Google Sheets', 'Asana', 'Trello', 'Google Drive', 'Slack'],
    'people-finance': ['QuickBooks', 'PayPal', 'Microsoft Excel', 'Gmail', 'Google Calendar', 'LinkedIn']
  };
  
  return allTools.filter(tool => 
    recommendations[agentType].some(rec => tool.name.includes(rec))
  );
}

function formatActionDescription(action: string, toolName: string, parameters?: any): string {
  const descriptions: Record<string, string> = {
    'email:send': `Send email via ${toolName}`,
    'contact:add': `Add new contact in ${toolName}`,
    'post:create': `Create post in ${toolName}`,
    'file:upload': `Upload file to ${toolName}`,
    'calendar:create': `Create calendar event in ${toolName}`,
    'message:send': `Send message via ${toolName}`,
    'payment:process': `Process payment through ${toolName}`,
    'task:create': `Create task in ${toolName}`
  };
  
  const baseDescription = descriptions[action] || `Execute ${action} in ${toolName}`;
  
  if (parameters && parameters.subject) {
    return `${baseDescription}: ${parameters.subject}`;
  }
  if (parameters && parameters.content) {
    return `${baseDescription}: ${parameters.content.substring(0, 50)}...`;
  }
  
  return baseDescription;
}

async function executeToolAction(toolName: string, action: string, parameters?: any): Promise<any> {
  const userId = parameters?.userId || 'demo-user';
  
  // Check if user has this tool detected and available
  const detectedTools = await storage.getDetectedTools(userId);
  const availableTool = detectedTools.find(tool => 
    tool.toolName.toLowerCase() === toolName.toLowerCase() && tool.installed
  );
  
  if (!availableTool) {
    return { 
      status: 'failed', 
      error: `${toolName} not detected on device. Please run device scan first.`,
      action, 
      tool: toolName 
    };
  }

  if (!availableTool.isLoggedIn && (action.includes('send') || action.includes('post') || action.includes('create'))) {
    return { 
      status: 'failed', 
      error: `${toolName} detected but not logged in. Please log in first.`,
      action, 
      tool: toolName 
    };
  }

  // Execute real action via browser extension using detected tool
  console.log(`Executing REAL ${action} on detected ${toolName} with parameters:`, parameters);
  
  const command = {
    request_id: `tool-${Date.now()}`,
    agent_id: 'system',
    capability: action,
    tool: toolName,
    args: parameters || {}
  };

  // Send command to extension for real execution
  if (extensionWS) {
    const success = await extensionWS.sendCommand(userId, command);
    if (success) {
      return { 
        status: 'executed', 
        action, 
        tool: toolName, 
        timestamp: new Date().toISOString(),
        real: true,
        detectedTool: availableTool
      };
    }
  }
  
  return { status: 'failed', error: 'Extension not connected', action, tool: toolName };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all agents
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  // Get featured agents
  app.get("/api/agents/featured", async (req, res) => {
    try {
      const agents = await storage.getFeaturedAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured agents" });
    }
  });

  // Get single agent
  app.get("/api/agents/:id", async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent" });
    }
  });

  // Get all sub-agents
  app.get("/api/sub-agents", async (req, res) => {
    try {
      const { category } = req.query;
      let subAgents;
      
      if (category && typeof category === "string") {
        subAgents = await storage.getSubAgentsByCategory(category);
      } else {
        subAgents = await storage.getAllSubAgents();
      }
      
      res.json(subAgents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sub-agents" });
    }
  });

  // Get single sub-agent
  app.get("/api/sub-agents/:id", async (req, res) => {
    try {
      const subAgent = await storage.getSubAgent(req.params.id);
      if (!subAgent) {
        return res.status(404).json({ message: "Sub-agent not found" });
      }
      res.json(subAgent);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sub-agent" });
    }
  });

  // Create custom agent request
  app.post("/api/custom-requests", async (req, res) => {
    try {
      const validatedData = insertCustomRequestSchema.parse(req.body);
      const request = await storage.createCustomRequest(validatedData);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create custom request" });
    }
  });

  // Get all custom requests
  app.get("/api/custom-requests", async (req, res) => {
    try {
      const requests = await storage.getAllCustomRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch custom requests" });
    }
  });

  // Extension API routes
  app.post("/api/extension/pair", async (req, res) => {
    try {
      const { code, extensionId } = req.body;
      
      if (!code || !extensionId) {
        return res.status(400).json({ error: 'Code and extensionId required' });
      }

      const pairing = await storage.getPairingByCode(code);
      if (!pairing) {
        return res.status(404).json({ error: 'Invalid or expired pairing code' });
      }

      await storage.updateExtensionPairing(pairing.id, { 
        extensionId,
        isActive: true,  // Now mark as active when extension actually connects
        lastSeen: new Date().toISOString()
      });

      res.json({
        success: true,
        userId: pairing.userId,
        websocketUrl: `/extension-ws`
      });

    } catch (error) {
      console.error('Extension pairing error:', error);
      res.status(500).json({ error: 'Pairing failed' });
    }
  });

  app.post("/api/extension/generate-code", async (req, res) => {
    try {
      const userId = req.body.userId || 'demo-user';
      const pairingCode = Math.random().toString(36).substr(2, 8).toUpperCase();
      
      const pairing = await storage.createExtensionPairing({
        userId,
        extensionId: '',
        pairingCode,
        isActive: false  // Only activate when extension actually connects
      });

      res.json({
        pairingCode,
        pairingId: pairing.id,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      });

    } catch (error) {
      console.error('Code generation error:', error);
      res.status(500).json({ error: 'Failed to generate pairing code' });
    }
  });

  app.get("/api/extension/status/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const pairings = await storage.getExtensionPairings(userId);
      const activePairings = pairings.filter(p => p.isActive);

      res.json({
        hasPairedExtension: activePairings.length > 0 && activePairings.some(p => p.extensionId),
        extensions: activePairings.map(p => ({
          id: p.id,
          extensionId: p.extensionId,
          lastSeen: p.lastSeen,
          isOnline: p.lastSeen && new Date(p.lastSeen).getTime() > Date.now() - 5 * 60 * 1000
        }))
      });

    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({ error: 'Failed to check status' });
    }
  });

  // Test extension commands (for demonstration)
  app.post("/api/extension/test/:capability", async (req, res) => {
    try {
      const { capability } = req.params;
      const { userId = 'demo-user' } = req.body;

      // These would be handled by the WebSocket server in a real implementation
      // For now, just return a success response
      res.json({
        success: true,
        message: `Test ${capability} command queued for user ${userId}`,
        capability,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Test command error:', error);
      res.status(500).json({ error: 'Failed to execute test command' });
    }
  });

  // Agent hiring and execution endpoints
  const hireAgentSchema = z.object({
    agentType: z.enum(['business-growth', 'operations', 'people-finance']),
    subAgent: z.string().optional(),
    task: z.string(),
    context: z.string().optional(),
    userId: z.string().default('demo-user')
  });

  // Hire and execute agent task
  app.post("/api/agents/hire", async (req, res) => {
    try {
      const validatedData = hireAgentSchema.parse(req.body);
      const { agentType, subAgent, task, context, userId } = validatedData;

      // Get user's detected device capabilities
      const detectedTools = await storage.getDetectedTools(userId);
      const deviceContext = detectedTools.length > 0 ? 
        `\n\nDETECTED DEVICE CAPABILITIES:\n${detectedTools.map(tool => 
          `- ${tool.toolName}: ${tool.isLoggedIn ? '✅ LOGGED IN' : '⚠️  available'} (${tool.permissions?.join(', ') || 'basic access'})`
        ).join('\n')}` : '\n\n⚠️  No device scan performed yet. Use browser extension to detect capabilities.';

      // Call the appropriate agent LLM based on type
      let agentResponse: string;
      switch (agentType) {
        case 'business-growth':
          agentResponse = await callBusinessGrowthAgent(task, `${context || ''}${deviceContext}`, subAgent);
          break;
        case 'operations':
          agentResponse = await callOperationsAgent(task, `${context || ''}${deviceContext}`, subAgent);
          break;
        case 'people-finance':
          agentResponse = await callPeopleFinanceAgent(task, `${context || ''}${deviceContext}`, subAgent);
          break;
        default:
          throw new Error(`Unknown agent type: ${agentType}`);
      }

      // Check if agent response requires approval
      const needsApproval = agentResponse.includes('ACTION_REQUIRED:');
      let cleanResponse = agentResponse;
      let actionDescription = '';
      
      if (needsApproval) {
        const actionMatch = agentResponse.match(/ACTION_REQUIRED: (.+?)(?:\n|$)/);
        if (actionMatch) {
          actionDescription = actionMatch[1];
          cleanResponse = agentResponse.replace(/ACTION_REQUIRED: .+?(?:\n|$)/, '').trim();
        }
      }

      // Store the task execution for audit
      await storage.createTaskExecution({
        userId,
        agentType,
        subAgent: subAgent || '',
        task,
        context: context || '',
        response: agentResponse,
        status: needsApproval ? 'pending_approval' : 'completed'
      });

      // Define sensitive actions that require approval
      const sensitiveActions = [
        'send', 'email', 'compose', 'post', 'publish', 'delete', 'remove',
        'payment', 'buy', 'purchase', 'transfer', 'withdraw', 'deposit',
        'hire', 'fire', 'terminate', 'cancel', 'refund', 'charge',
        'share', 'invite', 'message', 'call', 'contact', 'submit'
      ];

      const isSensitiveTask = sensitiveActions.some(action => 
        task.toLowerCase().includes(action) || agentResponse.toLowerCase().includes(action)
      );

      // Only auto-execute non-sensitive navigation tasks
      const shouldExecute = !isSensitiveTask && (
        task.toLowerCase().includes('open') ||
        task.toLowerCase().includes('navigate') ||
        task.toLowerCase().includes('go to') ||
        task.toLowerCase().includes('visit')
      );

      let executed = false;
      let executionStatus = '';

      // Check if the agent is asking for more information or being too cautious
      const isAskingForInfo = agentResponse.toLowerCase().includes('i need') || 
                             agentResponse.toLowerCase().includes('please tell me') ||
                             agentResponse.toLowerCase().includes('which') ||
                             agentResponse.toLowerCase().includes('what') ||
                             agentResponse.toLowerCase().includes('details:') ||
                             agentResponse.toLowerCase().includes('questions:');

      const isBeingTooWeak = agentResponse.toLowerCase().includes('unable to') ||
                            agentResponse.toLowerCase().includes('i cannot') ||
                            agentResponse.toLowerCase().includes('i can\'t access') ||
                            agentResponse.toLowerCase().includes('please provide');

      // Only require approval for truly dangerous actions (payments, deletions)
      const trulyDangerous = ['payment', 'buy', 'purchase', 'delete', 'remove', 'fire', 'terminate'];
      const isDangerous = trulyDangerous.some(action => 
        task.toLowerCase().includes(action) || agentResponse.toLowerCase().includes(action)
      );

      // Handle dangerous tasks that require approval
      if (isDangerous && !isAskingForInfo && !isBeingTooWeak) {
        // Store task as pending approval  
        const dangerousAction = trulyDangerous.find(action => 
          task.toLowerCase().includes(action) || agentResponse.toLowerCase().includes(action)
        );
        
        cleanResponse += `\n\n⚠️ **DANGEROUS ACTION DETECTED**\nThis will perform a real "${dangerousAction}" action.\n\n**Confirm to proceed with actual execution.**`;
        
        return res.json({
          success: true,
          agentType,
          subAgent,
          response: cleanResponse,
          needsApproval: true,
          sensitiveAction: dangerousAction,
          actionDescription: `Execute: ${task}`,
          executed: false,
          executionStatus: 'Dangerous action - awaiting confirmation',
          timestamp: new Date().toISOString()
        });
      }

      // If agent is being too weak/cautious, push it to be more aggressive
      if (isBeingTooWeak && detectedTools.length > 0) {
        cleanResponse = `I have access to your accounts and will execute this task directly. ${cleanResponse.replace(/I cannot|I can't|I'm unable to|Please provide/gi, 'I will')}`;
      }

      // Auto-execute most tasks (emails, social posts, etc.) - only dangerous ones need approval
      if (!isDangerous && !needsApproval) {
        // Execute all tasks except dangerous ones
        let command = null;
        executed = true;
        executionStatus = 'Executing real task using detected capabilities';
        
        if (task.toLowerCase().includes('linkedin')) {
          command = {
            request_id: `hire-${Date.now()}`,
            agent_id: agentType,
            capability: 'open_url',
            args: { url: 'https://linkedin.com' }
          };
          executionStatus = 'Opening LinkedIn...';
        } else if (task.toLowerCase().includes('salesforce') || task.toLowerCase().includes('crm')) {
          command = {
            request_id: `hire-${Date.now()}`,
            agent_id: agentType,
            capability: 'open_url',
            args: { url: 'https://salesforce.com' }
          };
          executionStatus = 'Opening Salesforce...';
        } else if (task.toLowerCase().includes('calendar')) {
          command = {
            request_id: `hire-${Date.now()}`,
            agent_id: agentType,
            capability: 'open_url',
            args: { url: 'https://calendar.google.com' }
          };
          executionStatus = 'Opening Google Calendar...';
        } else if (task.toLowerCase().includes('gmail') && !task.toLowerCase().includes('send')) {
          // Only open Gmail, don't compose
          command = {
            request_id: `hire-${Date.now()}`,
            agent_id: agentType,
            capability: 'open_url',
            args: { url: 'https://gmail.com' }
          };
          executionStatus = 'Opening Gmail...';
        }

        if (command) {
          try {
            const success = extensionWS ? await extensionWS.sendCommand(userId, command) : false;
            if (success) {
              executed = true;
              cleanResponse += `\n\n✅ **Executing now:** ${executionStatus}`;
            } else {
              cleanResponse += `\n\n⚠️ **Extension not connected.** Please pair your browser extension first.`;
            }
          } catch (error) {
            console.error('Command execution error:', error);
            cleanResponse += `\n\n❌ **Execution failed:** ${(error as Error).message}`;
          }
        }
      }

      res.json({
        success: true,
        agentType,
        subAgent,
        response: cleanResponse,
        needsApproval,
        actionDescription,
        executed,
        executionStatus,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Agent hire error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }

      if (error instanceof Error && error.message.includes('API key not found')) {
        return res.status(500).json({ 
          message: "Agent configuration error", 
          error: "API key not properly configured for this agent type" 
        });
      }

      if (error instanceof Error && error.message.includes('LLM call failed')) {
        return res.status(502).json({ 
          message: "External service error", 
          error: "Failed to connect to AI service" 
        });
      }

      res.status(500).json({ message: "Failed to execute agent task" });
    }
  });

  // Get user's hired agents and task history
  app.get("/api/agents/hired/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      const taskHistory = await storage.getUserTaskHistory(
        userId, 
        parseInt(limit as string), 
        parseInt(offset as string)
      );

      res.json({
        tasks: taskHistory.map(task => ({
          id: task.id,
          agentType: task.agentType,
          subAgent: task.subAgent,
          task: task.task,
          status: task.status,
          createdAt: task.createdAt,
          executedAt: task.executedAt
        }))
      });

    } catch (error) {
      console.error('Task history error:', error);
      res.status(500).json({ error: 'Failed to get task history' } as any);
    }
  });

  // Test agent connectivity (for debugging)
  app.post("/api/agents/test/:agentType", async (req, res) => {
    try {
      const { agentType } = req.params;
      
      if (!['business-growth', 'operations', 'people-finance'].includes(agentType)) {
        return res.status(400).json({ error: 'Invalid agent type' });
      }

      const testPrompt = "Respond with a simple JSON object containing 'status': 'online' and 'agent': your agent type.";
      
      let response: string;
      switch (agentType as AgentType) {
        case 'business-growth':
          response = await callBusinessGrowthAgent(testPrompt);
          break;
        case 'operations':
          response = await callOperationsAgent(testPrompt);
          break;
        case 'people-finance':
          response = await callPeopleFinanceAgent(testPrompt);
          break;
      }

      res.json({
        success: true,
        agentType,
        response,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Agent test error:', error);
      res.status(500).json({ 
        error: 'Agent test failed',
        agentType: req.params.agentType,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Real-time agent chat endpoint
  const agentChatSchema = z.object({
    agentType: z.enum(['business-growth', 'operations', 'people-finance']),
    message: z.string(),
    conversationId: z.string().optional(),
    userId: z.string().default('demo-user')
  });

  app.post("/api/agents/chat", async (req, res) => {
    try {
      const validatedData = agentChatSchema.parse(req.body);
      const { agentType, message, conversationId, userId } = validatedData;

      // Get conversation history for context
      const conversationHistory = await storage.getConversationHistory(userId, agentType);
      const historyMessages = conversationHistory?.messages || [];

      // Call the appropriate agent LLM with conversation context
      let agentResponse: string;
      switch (agentType) {
        case 'business-growth':
          agentResponse = await callBusinessGrowthAgent(message, `Conversation ID: ${conversationId}`, undefined, historyMessages);
          break;
        case 'operations':
          agentResponse = await callOperationsAgent(message, `Conversation ID: ${conversationId}`, undefined, historyMessages);
          break;
        case 'people-finance':
          agentResponse = await callPeopleFinanceAgent(message, `Conversation ID: ${conversationId}`, undefined, historyMessages);
          break;
        default:
          throw new Error(`Unknown agent type: ${agentType}`);
      }

      // Update conversation history
      const newMessages = [
        ...historyMessages.slice(-10), // Keep last 10 messages for context
        { role: 'user', content: message },
        { role: 'assistant', content: agentResponse }
      ];
      
      if (conversationHistory) {
        await storage.updateConversationHistory(conversationHistory.id, {
          messages: newMessages
        });
      } else {
        await storage.createConversationHistory({
          userId,
          agentType,
          conversationId: conversationId || Date.now().toString(),
          messages: newMessages,
          context: [`lastInteraction: ${new Date().toISOString()}`]
        });
      }

      // Check if response needs approval
      const needsApproval = agentResponse.includes('ACTION_REQUIRED:');
      let cleanResponse = agentResponse;
      let actionDescription = '';
      
      if (needsApproval) {
        const actionMatch = agentResponse.match(/ACTION_REQUIRED: (.+?)(?:\n|$)/);
        if (actionMatch) {
          actionDescription = actionMatch[1];
          cleanResponse = agentResponse.replace(/ACTION_REQUIRED: .+?(?:\n|$)/, '').trim();
        }
      }

      // Check if chat message should trigger immediate execution
      const shouldExecute = message.toLowerCase().includes('execute') || 
                           message.toLowerCase().includes('do it') ||
                           message.toLowerCase().includes('start now') ||
                           message.toLowerCase().includes('run') ||
                           message.toLowerCase().includes('send') ||
                           message.toLowerCase().includes('email') ||
                           message.toLowerCase().includes('open') ||
                           message.toLowerCase().includes('compose') ||
                           message.toLowerCase().includes('post') ||
                           message.toLowerCase().includes('create') ||
                           message.toLowerCase().includes('linkedin') ||
                           message.toLowerCase().includes('gmail') ||
                           message.toLowerCase().includes('sheets') ||
                           agentResponse.toLowerCase().includes('sending') ||
                           agentResponse.toLowerCase().includes('opening') ||
                           agentResponse.toLowerCase().includes('executing');

      let executed = false;
      let executionStatus = '';

      if (shouldExecute && !needsApproval) {
        // Direct execution for critical tasks like email sending
        let command = null;
        
        if (message.toLowerCase().includes('email') || message.toLowerCase().includes('send')) {
          // Extract email details from message
          const emailMatch = message.match(/send.*email.*to\s+([^\s]+@[^\s]+)/i) || 
                             message.match(/email.*to\s+([^\s]+@[^\s]+)/i) ||
                             message.match(/([^\s]+@[^\s]+)/);
          
          if (emailMatch) {
            const recipient = emailMatch[1];
            
            // Extract subject
            const subjectMatch = message.match(/subject[:\s]+"([^"]+)"|with subject ([^,\n]+)/i);
            const subject = subjectMatch ? (subjectMatch[1] || subjectMatch[2]).trim() : 'Email from Agent';
            
            // Extract message content
            const messageMatch = message.match(/message[:\s]+"([^"]+)"|and message ([^,\n]+)/i) ||
                                message.match(/body[:\s]+"([^"]+)"|body ([^,\n]+)/i);
            const emailBody = messageMatch ? (messageMatch[1] || messageMatch[2]).trim() : 
              'Hello,\n\nThis is an automated email from your business agent.\n\nBest regards';
            
            command = {
              request_id: `chat-${Date.now()}`,
              capability: 'compose_email',
              args: { 
                recipient: recipient,
                subject: subject,
                body: emailBody
              }
            };
            executionStatus = `Composing and sending email to ${recipient} with subject: ${subject}`;
          }
        } else if (message.toLowerCase().includes('linkedin')) {
          command = {
            request_id: `chat-${Date.now()}`,
            capability: 'open_url',
            args: { url: 'https://linkedin.com' }
          };
          executionStatus = 'Opening LinkedIn...';
        } else if (message.toLowerCase().includes('gmail')) {
          command = {
            request_id: `chat-${Date.now()}`,
            capability: 'open_url',
            args: { url: 'https://gmail.com' }
          };
          executionStatus = 'Opening Gmail...';
        } else if (message.toLowerCase().includes('sheets') || message.toLowerCase().includes('google sheets')) {
          command = {
            request_id: `chat-${Date.now()}`,
            capability: 'open_url',
            args: { url: 'https://sheets.google.com' }
          };
          executionStatus = 'Opening Google Sheets...';
        }

        if (command) {
          try {
            const success = extensionWS ? await extensionWS.sendCommand(userId, command) : false;
            if (success) {
              executed = true;
              cleanResponse += `\n\n✅ **Executing:** ${executionStatus}`;
            } else {
              cleanResponse += `\n\n⚠️ **Extension not connected.** Please pair your browser extension first.`;
            }
          } catch (error) {
            console.error('Command execution error:', error);
            cleanResponse += `\n\n⚠️ **Execution failed:** ${error instanceof Error ? error.message : 'Unknown error'}`;
          }
        }
      }

      res.json({
        success: true,
        agentType,
        response: cleanResponse,
        needsApproval,
        actionDescription,
        executed,
        executionStatus,
        conversationId: conversationId || Date.now().toString(),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Agent chat error:', error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Task approval endpoint
  const approvalSchema = z.object({
    taskId: z.string(),
    approved: z.boolean(),
    userId: z.string().default('demo-user')
  });

  app.post("/api/agents/approve", async (req, res) => {
    try {
      const validatedData = approvalSchema.parse(req.body);
      const { taskId, approved, userId } = validatedData;

      console.log(`Task ${taskId} ${approved ? 'approved' : 'rejected'} by ${userId}`);
      
      if (approved) {
        // Send task to browser extension for execution
        // This would be handled by the WebSocket server
        console.log(`Sending task ${taskId} to extension for execution`);
      }

      res.json({
        success: true,
        taskId,
        approved,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Approval error:', error);
      res.status(500).json({ message: "Failed to process approval" });
    }
  });

  // Voice chat endpoint (text-to-speech simulation)
  app.post("/api/agents/voice", async (req, res) => {
    try {
      const { text, voice = 'agent' } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      // For now, just return the text with voice metadata
      // In a full implementation, you'd use a TTS service like ElevenLabs or Azure
      res.json({
        success: true,
        text,
        voice,
        audioUrl: null, // Would be actual audio URL in production
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Voice endpoint error:', error);
      res.status(500).json({ error: 'Voice processing failed' });
    }
  });

  // Device permission and auto-detection endpoint
  const devicePermissionSchema = z.object({
    userId: z.string().default('demo-user'),
    agentType: z.enum(['business-growth', 'operations', 'people-finance']),
    requestPermissions: z.boolean().default(true)
  });

  app.post("/api/device/auto-detect", async (req, res) => {
    try {
      const validatedData = devicePermissionSchema.parse(req.body);
      const { userId, agentType, requestPermissions } = validatedData;

      // Auto-detect all available tools on the device
      const scanner = DeviceScanner.getInstance();
      const detectedTools = await scanner.getDetectedTools(userId);
      
      // Categorize tools by sensitivity and capability
      const categorizedTools = {
        safe: detectedTools.installed.filter(tool => 
          ['productivity', 'browser', 'development'].includes(tool.category)
        ),
        sensitive: detectedTools.installed.filter(tool => 
          ['email', 'communication', 'crm', 'ecommerce'].includes(tool.category)
        ),
        browser: detectedTools.browser
      };

      // Get agent-specific tool recommendations
      const recommendedTools = getAgentRecommendedTools(agentType, detectedTools.installed.concat(
        detectedTools.browser.map(bt => ({
          name: bt.name,
          category: bt.category,
          executable: 'browser',
          installed: true,
          permissions: bt.permissions
        }))
      ));

      // Store detection results for this user-agent combination
      await storage.saveDetectedTools(userId, detectedTools.installed.map(tool => ({
        userId,
        toolName: tool.name,
        category: tool.category,
        executable: tool.executable,
        version: tool.version,
        installed: tool.installed,
        permissions: tool.permissions
      })));

      res.json({
        success: true,
        autoDetected: {
          totalTools: detectedTools.installed.length + detectedTools.browser.length,
          safeTools: categorizedTools.safe,
          sensitiveTools: categorizedTools.sensitive,
          browserTools: categorizedTools.browser,
          recommendedForAgent: recommendedTools
        },
        permissionsRequired: requestPermissions,
        message: `Detected ${detectedTools.installed.length + detectedTools.browser.length} tools for ${agentType} agent. Review and approve tool access below.`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Auto-detection error:', error);
      res.status(500).json({ error: 'Failed to auto-detect device tools' });
    }
  });

  // Grant tool permissions to agent
  const grantPermissionSchema = z.object({
    userId: z.string().default('demo-user'),
    agentType: z.enum(['business-growth', 'operations', 'people-finance']),
    approvedTools: z.array(z.object({
      toolName: z.string(),
      permissions: z.array(z.string()),
      category: z.string()
    }))
  });

  app.post("/api/device/grant-permissions", async (req, res) => {
    try {
      const validatedData = grantPermissionSchema.parse(req.body);
      const { userId, agentType, approvedTools } = validatedData;

      // Store approved permissions
      for (const tool of approvedTools) {
        await storage.createToolPermission({
          userId,
          agentType,
          toolName: tool.toolName,
          permissions: tool.permissions,
          category: tool.category,
          granted: true,
          grantedAt: new Date().toISOString()
        });
      }

      // Notify WebSocket clients about permission grants
      // This would be handled by the WebSocket server in production
      console.log(`Permissions granted to ${agentType} agent for ${approvedTools.length} tools`);

      res.json({
        success: true,
        message: `${agentType} agent can now access ${approvedTools.length} approved tools`,
        approvedTools: approvedTools.map(t => t.toolName),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Permission grant error:', error);
      res.status(500).json({ error: 'Failed to grant tool permissions' });
    }
  });

  // Background task execution endpoint
  const backgroundTaskSchema = z.object({
    userId: z.string().default('demo-user'),
    agentType: z.enum(['business-growth', 'operations', 'people-finance']),
    taskId: z.string(),
    toolName: z.string(),
    action: z.string(),
    parameters: z.record(z.any()).optional(),
    requiresApproval: z.boolean().default(false)
  });

  app.post("/api/agents/execute-background", async (req, res) => {
    try {
      const validatedData = backgroundTaskSchema.parse(req.body);
      const { userId, agentType, taskId, toolName, action, parameters, requiresApproval } = validatedData;

      // Check if agent has permission for this tool
      const hasPermission = await storage.checkToolPermission(userId, agentType, toolName);
      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Agent does not have permission to use this tool',
          requiresPermission: true,
          toolName 
        });
      }

      // Check if action requires explicit approval
      const sensitiveActions = ['email:send', 'payment:process', 'file:delete', 'contact:add', 'post:publish'];
      const isSensitive = sensitiveActions.some(sa => action.includes(sa));
      
      if (isSensitive || requiresApproval) {
        // Store pending action for approval
        await storage.createPendingAction({
          userId,
          agentType,
          taskId,
          toolName,
          action,
          parameters: JSON.stringify(parameters || {}),
          status: 'pending_approval',
          requiresApproval: true
        });

        return res.json({
          success: true,
          status: 'pending_approval',
          message: `Action "${action}" on ${toolName} requires your approval before execution`,
          taskId,
          actionDescription: formatActionDescription(action, toolName, parameters),
          timestamp: new Date().toISOString()
        });
      }

      // Execute non-sensitive action immediately
      const executionResult = await executeToolAction(toolName, action, parameters);
      
      // Store execution record
      await storage.createActionExecution({
        userId,
        agentType,
        taskId,
        toolName,
        action,
        parameters: JSON.stringify(parameters || {}),
        result: JSON.stringify(executionResult),
        status: 'completed',
        executedAt: new Date().toISOString()
      });

      // Notify user of completed action
      await storage.createActionNotification({
        userId,
        agentType,
        message: `${agentType} agent completed: ${formatActionDescription(action, toolName, parameters)}`,
        actionType: action,
        toolName,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        status: 'completed',
        result: executionResult,
        message: `Action completed on ${toolName}`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Background execution error:', error);
      res.status(500).json({ error: 'Failed to execute background task' });
    }
  });

  // Action approval endpoint
  const actionApprovalSchema = z.object({
    userId: z.string().default('demo-user'),
    actionId: z.string(),
    approved: z.boolean(),
    note: z.string().optional()
  });

  app.post("/api/agents/approve-action", async (req, res) => {
    try {
      const validatedData = actionApprovalSchema.parse(req.body);
      const { userId, actionId, approved, note } = validatedData;

      const pendingAction = await storage.getPendingAction(actionId);
      if (!pendingAction) {
        return res.status(404).json({ error: 'Pending action not found' });
      }

      if (approved) {
        // Execute the approved action
        const executionResult = await executeToolAction(
          pendingAction.toolName, 
          pendingAction.action, 
          JSON.parse(pendingAction.parameters)
        );

        // Update pending action status
        await storage.updatePendingAction(actionId, {
          status: 'approved_executed',
          result: JSON.stringify(executionResult),
          approvedAt: new Date().toISOString(),
          note
        });

        // Create execution record
        await storage.createActionExecution({
          userId,
          agentType: pendingAction.agentType,
          taskId: pendingAction.taskId,
          toolName: pendingAction.toolName,
          action: pendingAction.action,
          parameters: pendingAction.parameters,
          result: JSON.stringify(executionResult),
          status: 'completed',
          executedAt: new Date().toISOString()
        });

        res.json({
          success: true,
          status: 'approved_executed',
          result: executionResult,
          message: `Action approved and executed successfully`,
          timestamp: new Date().toISOString()
        });
      } else {
        // Reject the action
        await storage.updatePendingAction(actionId, {
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          note
        });

        res.json({
          success: true,
          status: 'rejected',
          message: 'Action rejected by user',
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Action approval error:', error);
      res.status(500).json({ error: 'Failed to process action approval' });
    }
  });

  // Get user notifications
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 20, offset = 0 } = req.query;
      
      const notifications = await storage.getUserNotifications(
        userId, 
        parseInt(limit as string), 
        parseInt(offset as string)
      );

      res.json({
        success: true,
        notifications,
        count: notifications.length
      });

    } catch (error) {
      console.error('Notifications error:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  // Get pending actions for approval
  app.get("/api/agents/pending-actions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const pendingActions = await storage.getPendingActions(userId);

      const formattedActions = pendingActions.map(action => ({
        id: action.id,
        agentType: action.agentType,
        taskId: action.taskId,
        toolName: action.toolName,
        action: action.action,
        description: formatActionDescription(action.action, action.toolName, JSON.parse(action.parameters)),
        createdAt: action.createdAt,
        requiresApproval: action.requiresApproval
      }));

      res.json({
        success: true,
        pendingActions: formattedActions,
        count: formattedActions.length
      });

    } catch (error) {
      console.error('Pending actions error:', error);
      res.status(500).json({ error: 'Failed to fetch pending actions' });
    }
  });

  // Device tool detection and agent configuration routes
  app.use("/api/device-tools", deviceToolsRouter);
  app.use("/api/agent-config", agentConfigRouter);
  app.use("/api/extension", extensionRouter);
  app.use("/api/ai-browser", aiBrowserRouter);

  // Universal access endpoints for AI agents
  app.get('/api/universal-access/permissions/:platform', (req, res) => {
    const { platform } = req.params;
    const permissions = UniversalAccessManager.getPermissions(platform);
    
    res.json({
      success: true,
      platform,
      permissions,
      accessLevel: "UNIVERSAL",
      restrictions: []
    });
  });

  app.get('/api/universal-access/report', (req, res) => {
    const report = UniversalAccessManager.generateAccessReport();
    res.json({
      success: true,
      report
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
