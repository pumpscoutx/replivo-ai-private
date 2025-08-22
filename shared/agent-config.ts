// Agent configuration schema for customizable settings
import { z } from 'zod';

export const agentTaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  autonomyLevel: z.enum(['autonomous', 'confirm', 'suggest']),
  enabled: z.boolean().default(true),
  permissions: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([])
});

export const agentConfigSchema = z.object({
  agentId: z.string(),
  agentType: z.enum(['business-growth', 'operations', 'people-finance']),
  userId: z.string(),
  autonomousTasks: z.array(agentTaskSchema).default([]),
  confirmTasks: z.array(agentTaskSchema).default([]),
  suggestTasks: z.array(agentTaskSchema).default([]),
  allowedTools: z.array(z.string()).default([]),
  permissions: z.array(z.string()).default([]),
  workingHours: z.object({
    enabled: z.boolean().default(false),
    start: z.string().default('09:00'),
    end: z.string().default('17:00'),
    timezone: z.string().default('UTC')
  }).default({}),
  notifications: z.object({
    taskCompletion: z.boolean().default(true),
    errorAlerts: z.boolean().default(true),
    dailySummary: z.boolean().default(false)
  }).default({}),
  conversationContext: z.object({
    rememberPreferences: z.boolean().default(true),
    maintainHistory: z.boolean().default(true),
    personalizedResponses: z.boolean().default(true)
  }).default({}),
  lastUpdated: z.string()
});

export type AgentTask = z.infer<typeof agentTaskSchema>;
export type AgentConfig = z.infer<typeof agentConfigSchema>;

// Default task configurations for each agent type
export const defaultAgentTasks = {
  'business-growth': {
    autonomous: [
      {
        id: 'social-media-monitoring',
        name: 'Social Media Monitoring',
        description: 'Monitor social media mentions and engagement metrics',
        category: 'marketing',
        autonomyLevel: 'autonomous' as const,
        enabled: true,
        permissions: ['social:read', 'analytics:read'],
        tools: ['Twitter', 'LinkedIn', 'Facebook', 'Instagram']
      },
      {
        id: 'content-research',
        name: 'Content Research',
        description: 'Research trending topics and competitor content',
        category: 'content',
        autonomyLevel: 'autonomous' as const,
        enabled: true,
        permissions: ['web:browse', 'content:analyze'],
        tools: ['Google', 'BuzzSumo', 'SEMrush']
      }
    ],
    confirm: [
      {
        id: 'email-campaigns',
        name: 'Email Campaign Creation',
        description: 'Create and schedule email marketing campaigns',
        category: 'marketing',
        autonomyLevel: 'confirm' as const,
        enabled: true,
        permissions: ['email:send', 'contact:read'],
        tools: ['Gmail', 'Mailchimp', 'HubSpot']
      },
      {
        id: 'lead-outreach',
        name: 'Lead Outreach',
        description: 'Send personalized messages to potential leads',
        category: 'sales',
        autonomyLevel: 'confirm' as const,
        enabled: true,
        permissions: ['email:send', 'crm:write'],
        tools: ['Salesforce', 'LinkedIn', 'Gmail']
      }
    ],
    suggest: [
      {
        id: 'budget-changes',
        name: 'Marketing Budget Changes',
        description: 'Suggest changes to marketing budget allocation',
        category: 'finance',
        autonomyLevel: 'suggest' as const,
        enabled: true,
        permissions: ['budget:read', 'analytics:read'],
        tools: ['Google Ads', 'Facebook Ads', 'Analytics']
      }
    ]
  },
  'operations': {
    autonomous: [
      {
        id: 'data-backup',
        name: 'Data Backup',
        description: 'Automatically backup important files and databases',
        category: 'maintenance',
        autonomyLevel: 'autonomous' as const,
        enabled: true,
        permissions: ['file:read', 'storage:write'],
        tools: ['Google Drive', 'Dropbox', 'AWS S3']
      },
      {
        id: 'system-monitoring',
        name: 'System Monitoring',
        description: 'Monitor system performance and uptime',
        category: 'monitoring',
        autonomyLevel: 'autonomous' as const,
        enabled: true,
        permissions: ['system:read', 'alerts:send'],
        tools: ['New Relic', 'Datadog', 'Pingdom']
      }
    ],
    confirm: [
      {
        id: 'data-processing',
        name: 'Data Processing',
        description: 'Process and transform data files',
        category: 'data',
        autonomyLevel: 'confirm' as const,
        enabled: true,
        permissions: ['file:read', 'file:write'],
        tools: ['Excel', 'Google Sheets', 'Python']
      },
      {
        id: 'workflow-automation',
        name: 'Workflow Automation',
        description: 'Set up automated workflows between tools',
        category: 'automation',
        autonomyLevel: 'confirm' as const,
        enabled: true,
        permissions: ['api:access', 'integration:create'],
        tools: ['Zapier', 'IFTTT', 'Microsoft Power Automate']
      }
    ],
    suggest: [
      {
        id: 'system-upgrades',
        name: 'System Upgrades',
        description: 'Suggest system and software upgrades',
        category: 'maintenance',
        autonomyLevel: 'suggest' as const,
        enabled: true,
        permissions: ['system:read', 'software:analyze'],
        tools: ['System Info', 'Update Manager']
      }
    ]
  },
  'people-finance': {
    autonomous: [
      {
        id: 'expense-tracking',
        name: 'Expense Tracking',
        description: 'Automatically track and categorize expenses',
        category: 'finance',
        autonomyLevel: 'autonomous' as const,
        enabled: true,
        permissions: ['finance:read', 'receipt:scan'],
        tools: ['QuickBooks', 'Expensify', 'Mint']
      },
      {
        id: 'timesheet-reminders',
        name: 'Timesheet Reminders',
        description: 'Send reminders for timesheet submission',
        category: 'hr',
        autonomyLevel: 'autonomous' as const,
        enabled: true,
        permissions: ['hr:read', 'notification:send'],
        tools: ['Slack', 'Email', 'BambooHR']
      }
    ],
    confirm: [
      {
        id: 'payroll-processing',
        name: 'Payroll Processing',
        description: 'Process employee payroll and benefits',
        category: 'finance',
        autonomyLevel: 'confirm' as const,
        enabled: true,
        permissions: ['payroll:write', 'finance:write'],
        tools: ['ADP', 'Gusto', 'QuickBooks Payroll']
      },
      {
        id: 'invoice-management',
        name: 'Invoice Management',
        description: 'Create and send invoices to clients',
        category: 'finance',
        autonomyLevel: 'confirm' as const,
        enabled: true,
        permissions: ['invoice:create', 'finance:write'],
        tools: ['QuickBooks', 'FreshBooks', 'Xero']
      }
    ],
    suggest: [
      {
        id: 'budget-planning',
        name: 'Budget Planning',
        description: 'Suggest budget allocations and financial planning',
        category: 'finance',
        autonomyLevel: 'suggest' as const,
        enabled: true,
        permissions: ['finance:read', 'analytics:read'],
        tools: ['Excel', 'QuickBooks', 'Financial Planning Software']
      }
    ]
  }
};