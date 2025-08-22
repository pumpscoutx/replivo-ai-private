// API routes for agent configuration management
import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { agentConfigSchema, defaultAgentTasks } from '../../shared/agent-config';

export const agentConfigRouter = Router();

// Get agent configuration
agentConfigRouter.get('/:userId/:agentType', async (req, res) => {
  try {
    const { userId, agentType } = req.params;
    
    if (!['business-growth', 'operations', 'people-finance'].includes(agentType)) {
      return res.status(400).json({ error: 'Invalid agent type' });
    }
    
    let config = await storage.getAgentConfiguration(userId, agentType);
    
    // Create default config if none exists
    if (!config) {
      const defaultTasks = defaultAgentTasks[agentType as keyof typeof defaultAgentTasks];
      
      config = await storage.createAgentConfiguration({
        agentId: `${userId}-${agentType}`,
        agentType,
        userId,
        autonomousTasks: defaultTasks.autonomous,
        confirmTasks: defaultTasks.confirm,
        suggestTasks: defaultTasks.suggest,
        allowedTools: [],
        permissions: [],
        workingHours: {
          enabled: false,
          start: '09:00',
          end: '17:00',
          timezone: 'UTC'
        },
        notifications: {
          taskCompletion: true,
          errorAlerts: true,
          dailySummary: false
        },
        conversationContext: {
          rememberPreferences: true,
          maintainHistory: true,
          personalizedResponses: true
        }
      });
    }
    
    res.json({ success: true, config });

  } catch (error) {
    console.error('Error fetching agent configuration:', error);
    res.status(500).json({ error: 'Failed to fetch agent configuration' });
  }
});

// Update agent configuration
const updateConfigSchema = z.object({
  autonomousTasks: z.array(z.any()).optional(),
  confirmTasks: z.array(z.any()).optional(),
  suggestTasks: z.array(z.any()).optional(),
  allowedTools: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
  workingHours: z.object({
    enabled: z.boolean(),
    start: z.string(),
    end: z.string(),
    timezone: z.string()
  }).optional(),
  notifications: z.object({
    taskCompletion: z.boolean(),
    errorAlerts: z.boolean(),
    dailySummary: z.boolean()
  }).optional(),
  conversationContext: z.object({
    rememberPreferences: z.boolean(),
    maintainHistory: z.boolean(),
    personalizedResponses: z.boolean()
  }).optional()
});

agentConfigRouter.patch('/:userId/:agentType', async (req, res) => {
  try {
    const { userId, agentType } = req.params;
    const validatedData = updateConfigSchema.parse(req.body);
    
    const existing = await storage.getAgentConfiguration(userId, agentType);
    if (!existing) {
      return res.status(404).json({ error: 'Agent configuration not found' });
    }
    
    await storage.updateAgentConfiguration(existing.id, validatedData);
    
    const updated = await storage.getAgentConfiguration(userId, agentType);
    res.json({ success: true, config: updated });

  } catch (error) {
    console.error('Error updating agent configuration:', error);
    res.status(500).json({ error: 'Failed to update agent configuration' });
  }
});

// Get available tasks for an agent type
agentConfigRouter.get('/:agentType/available-tasks', async (req, res) => {
  try {
    const { agentType } = req.params;
    
    if (!['business-growth', 'operations', 'people-finance'].includes(agentType)) {
      return res.status(400).json({ error: 'Invalid agent type' });
    }
    
    const defaultTasks = defaultAgentTasks[agentType as keyof typeof defaultAgentTasks];
    
    res.json({
      success: true,
      tasks: {
        autonomous: defaultTasks.autonomous,
        confirm: defaultTasks.confirm,
        suggest: defaultTasks.suggest
      }
    });

  } catch (error) {
    console.error('Error fetching available tasks:', error);
    res.status(500).json({ error: 'Failed to fetch available tasks' });
  }
});

// Toggle task autonomy level
const toggleTaskSchema = z.object({
  taskId: z.string(),
  fromLevel: z.enum(['autonomous', 'confirm', 'suggest']),
  toLevel: z.enum(['autonomous', 'confirm', 'suggest', 'disabled']),
  enabled: z.boolean().optional()
});

agentConfigRouter.post('/:userId/:agentType/toggle-task', async (req, res) => {
  try {
    const { userId, agentType } = req.params;
    const validatedData = toggleTaskSchema.parse(req.body);
    
    const config = await storage.getAgentConfiguration(userId, agentType);
    if (!config) {
      return res.status(404).json({ error: 'Agent configuration not found' });
    }
    
    const { taskId, fromLevel, toLevel, enabled } = validatedData;
    
    // Find and move task between categories
    const fromTasks = config[`${fromLevel}Tasks` as keyof typeof config] as any[];
    const taskIndex = fromTasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const task = fromTasks[taskIndex];
    
    // Update task properties
    if (enabled !== undefined) {
      task.enabled = enabled;
    }
    if (toLevel !== 'disabled') {
      task.autonomyLevel = toLevel;
    }
    
    // Remove from old category and add to new category
    if (fromLevel !== toLevel && toLevel !== 'disabled') {
      fromTasks.splice(taskIndex, 1);
      const toTasks = config[`${toLevel}Tasks` as keyof typeof config] as any[];
      toTasks.push(task);
    } else if (toLevel === 'disabled') {
      task.enabled = false;
    }
    
    await storage.updateAgentConfiguration(config.id, {
      [`${fromLevel}Tasks`]: fromTasks,
      ...(toLevel !== 'disabled' && toLevel !== fromLevel && {
        [`${toLevel}Tasks`]: config[`${toLevel}Tasks` as keyof typeof config]
      })
    });
    
    res.json({ success: true });

  } catch (error) {
    console.error('Error toggling task:', error);
    res.status(500).json({ error: 'Failed to toggle task' });
  }
});