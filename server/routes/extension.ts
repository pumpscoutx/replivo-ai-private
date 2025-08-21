import { Router } from 'express';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';
import { z } from 'zod';

const extensionRouter = Router();

// Extension pairing endpoint
extensionRouter.post('/pair', async (req, res) => {
  try {
    const { code, extensionId } = req.body;
    
    if (!code || !extensionId) {
      return res.status(400).json({ error: 'Code and extensionId required' });
    }

    // Find pairing request by code
    const pairing = await storage.getPairingByCode(code);
    if (!pairing || !pairing.isActive) {
      return res.status(404).json({ error: 'Invalid or expired pairing code' });
    }

    // Update pairing with extension ID
    await storage.updateExtensionPairing(pairing.id, { extensionId });

    // Generate JWT token for WebSocket authentication
    const token = jwt.sign(
      { 
        userId: pairing.userId, 
        extensionId,
        type: 'extension'
      },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      userId: pairing.userId,
      websocketUrl: `/extension-ws?token=${token}`
    });

  } catch (error) {
    console.error('Extension pairing error:', error);
    res.status(500).json({ error: 'Pairing failed' });
  }
});

// Generate pairing code for user
extensionRouter.post('/generate-code', async (req, res) => {
  try {
    // In production, get userId from authenticated session
    const userId = req.body.userId || 'demo-user';
    
    // Generate random pairing code
    const pairingCode = randomBytes(4).toString('hex').toUpperCase();
    
    // Create pairing record
    const pairing = await storage.createExtensionPairing({
      userId,
      extensionId: '', // Will be filled when extension pairs
      pairingCode,
      isActive: true
    });

    res.json({
      pairingCode,
      pairingId: pairing.id,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
    });

  } catch (error) {
    console.error('Code generation error:', error);
    res.status(500).json({ error: 'Failed to generate pairing code' });
  }
});

// Get user's extension status
extensionRouter.get('/status/:userId', async (req, res) => {
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
        isOnline: p.lastSeen && new Date(p.lastSeen).getTime() > Date.now() - 5 * 60 * 1000 // 5 minutes
      }))
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

// Revoke extension access
extensionRouter.post('/revoke/:pairingId', async (req, res) => {
  try {
    const { pairingId } = req.params;
    
    await storage.updateExtensionPairing(pairingId, { isActive: false });
    
    res.json({ success: true });

  } catch (error) {
    console.error('Revoke error:', error);
    res.status(500).json({ error: 'Failed to revoke access' });
  }
});

// Get user permissions for extension
extensionRouter.get('/permissions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const permissions = await storage.getUserPermissions(userId);
    const activePermissions = permissions.filter(p => p.isActive && 
      (!p.expiresAt || new Date(p.expiresAt) > new Date())
    );

    res.json({
      permissions: activePermissions.map(p => ({
        id: p.id,
        agentId: p.agentId,
        scope: p.scope,
        domain: p.domain,
        autonomyLevel: p.autonomyLevel,
        expiresAt: p.expiresAt
      }))
    });

  } catch (error) {
    console.error('Permissions error:', error);
    res.status(500).json({ error: 'Failed to get permissions' });
  }
});

// Grant new permission
const grantPermissionSchema = z.object({
  agentId: z.string(),
  scope: z.string(),
  domain: z.string().optional(),
  autonomyLevel: z.enum(['suggest', 'confirm', 'autonomous']),
  expiresAt: z.string().optional()
});

extensionRouter.post('/permissions/:userId/grant', async (req, res) => {
  try {
    const { userId } = req.params;
    const validatedData = grantPermissionSchema.parse(req.body);
    
    const permission = await storage.createUserPermission({
      userId,
      ...validatedData
    });

    res.json({ success: true, permission });

  } catch (error) {
    console.error('Permission grant error:', error);
    res.status(500).json({ error: 'Failed to grant permission' });
  }
});

// Get command execution log
extensionRouter.get('/commands/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const commands = await storage.getCommandLog(
      userId, 
      parseInt(limit as string), 
      parseInt(offset as string)
    );

    res.json({
      commands: commands.map(cmd => ({
        id: cmd.id,
        agentId: cmd.agentId,
        capability: cmd.capability,
        status: cmd.status,
        createdAt: cmd.createdAt,
        executedAt: cmd.executedAt
      }))
    });

  } catch (error) {
    console.error('Command log error:', error);
    res.status(500).json({ error: 'Failed to get command log' });
  }
});

export default extensionRouter;