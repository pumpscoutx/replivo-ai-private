import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomRequestSchema } from "@shared/schema";
import { z } from "zod";

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
      if (!pairing || !pairing.isActive) {
        return res.status(404).json({ error: 'Invalid or expired pairing code' });
      }

      await storage.updateExtensionPairing(pairing.id, { extensionId });

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
        isActive: true
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
        hasPairedExtension: activePairings.length > 0,
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

  const httpServer = createServer(app);
  return httpServer;
}
