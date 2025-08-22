import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomRequestSchema } from "@shared/schema";
import { z } from "zod";
import {
  callBusinessGrowthAgent,
  callOperationsAgent,
  callPeopleFinanceAgent,
  type AgentType
} from "./llmClient";

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

      // Call the appropriate agent LLM based on type
      let agentResponse: string;
      switch (agentType) {
        case 'business-growth':
          agentResponse = await callBusinessGrowthAgent(task, context, subAgent);
          break;
        case 'operations':
          agentResponse = await callOperationsAgent(task, context, subAgent);
          break;
        case 'people-finance':
          agentResponse = await callPeopleFinanceAgent(task, context, subAgent);
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

      res.json({
        success: true,
        agentType,
        subAgent,
        response: cleanResponse,
        needsApproval,
        actionDescription,
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
      res.status(500).json({ error: 'Failed to get task history' });
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

      // Call the appropriate agent LLM
      let agentResponse: string;
      switch (agentType) {
        case 'business-growth':
          agentResponse = await callBusinessGrowthAgent(message, `Conversation ID: ${conversationId}`);
          break;
        case 'operations':
          agentResponse = await callOperationsAgent(message, `Conversation ID: ${conversationId}`);
          break;
        case 'people-finance':
          agentResponse = await callPeopleFinanceAgent(message, `Conversation ID: ${conversationId}`);
          break;
        default:
          throw new Error(`Unknown agent type: ${agentType}`);
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

      res.json({
        success: true,
        agentType,
        response: cleanResponse,
        needsApproval,
        actionDescription,
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

  // Remove all demo data endpoints and add real-time execution
  const httpServer = createServer(app);
  return httpServer;
}
