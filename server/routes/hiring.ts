import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';

const hiringRouter = Router();

// Initiate hiring process for an agent
hiringRouter.post('/agents/:id/hire', async (req, res) => {
	try {
		const { id } = req.params;
		const { userId = 'demo-user', plan = 'monthly' } = req.body || {};

		const agent = await storage.getAgent(id);
		if (!agent) {
			return res.status(404).json({ error: 'Agent not found' });
		}

		// Record as a pending action to simulate a hiring session
		const pending = await storage.createPendingAction({
			userId,
			actionType: 'hire-agent',
			agentId: id,
			status: 'initiated',
			metadata: { plan }
		});

		return res.json({ success: true, sessionId: pending.id, pending });
	} catch (error) {
		console.error('Initiate hire error:', error);
		return res.status(500).json({ error: 'Failed to initiate hiring' });
	}
});

// Process payment (Stripe placeholder)
const paymentSchema = z.object({
	userId: z.string().default('demo-user'),
	sessionId: z.string(),
	amount: z.number().min(0),
	currency: z.string().default('usd'),
	method: z.string().optional(),
});

hiringRouter.post('/payment/process', async (req, res) => {
	try {
		const data = paymentSchema.parse(req.body || {});
		// Mark pending action as paid
		await storage.updatePendingAction(data.sessionId, {
			status: 'paid',
			metadata: { ...(req.body?.metadata || {}), amount: data.amount, currency: data.currency }
		});
		return res.json({ success: true, receiptId: `rcpt_${Date.now()}` });
	} catch (error) {
		console.error('Payment process error:', error);
		return res.status(400).json({ error: 'Payment validation failed' });
	}
});

// Save task and tool configuration for agent
const configureSchema = z.object({
	userId: z.string().default('demo-user'),
	sessionId: z.string().optional(),
	selectedTasks: z.array(z.any()).default([]),
	connectedTools: z.array(z.any()).default([]),
	agentType: z.string().optional(),
});

hiringRouter.post('/agents/:id/configure', async (req, res) => {
	try {
		const { id } = req.params;
		const data = configureSchema.parse(req.body || {});

		const agent = await storage.getAgent(id);
		if (!agent) {
			return res.status(404).json({ error: 'Agent not found' });
		}

		// Create or update configuration using existing storage helpers
		const agentType = data.agentType || (agent.category || 'custom');
		let existing = await storage.getAgentConfiguration(data.userId, agentType);
		if (!existing) {
			existing = await storage.createAgentConfiguration({
				agentId: `${data.userId}-${agentType}`,
				agentType,
				userId: data.userId,
				autonomousTasks: [],
				confirmTasks: [],
				suggestTasks: [],
				allowedTools: [],
				permissions: [],
				workingHours: { enabled: false, start: '09:00', end: '17:00', timezone: 'UTC' },
				notifications: { taskCompletion: true, errorAlerts: true, dailySummary: false },
				conversationContext: { rememberPreferences: true, maintainHistory: true, personalizedResponses: true }
			});
		}

		await storage.updateAgentConfiguration(existing.id, {
			autonomousTasks: data.selectedTasks,
			allowedTools: data.connectedTools,
		});

		if (data.sessionId) {
			await storage.updatePendingAction(data.sessionId, { status: 'configured' });
		}

		return res.json({ success: true });
	} catch (error) {
		console.error('Configure agent error:', error);
		return res.status(500).json({ error: 'Failed to save configuration' });
	}
});

export default hiringRouter; 