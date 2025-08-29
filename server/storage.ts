import { type User, type InsertUser, type Agent, type InsertAgent, type SubAgent, type InsertSubAgent, type CustomRequest, type InsertCustomRequest, type UserPermission, type InsertUserPermission, type ExtensionPairing, type InsertExtensionPairing, type CommandLog, type InsertCommandLog, type VoiceInteraction, type InsertVoiceInteraction, type TaskExecution, type InsertTaskExecution, type AgentConfiguration, type InsertAgentConfiguration, type ConversationHistory, type InsertConversationHistory, type DetectedTool, type InsertDetectedTool, type ToolPermission, type InsertToolPermission, type PendingAction, type InsertPendingAction, type ActionExecution, type InsertActionExecution, type ActionNotification, type InsertActionNotification } from "@shared/schema";
import { randomUUID } from "crypto";
import { DeviceScanner } from './device-scanner';
import { defaultAgentTasks } from '../shared/agent-config';

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllAgents(): Promise<Agent[]>;
  getFeaturedAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  
  getAllSubAgents(): Promise<SubAgent[]>;
  getSubAgentsByCategory(category: string): Promise<SubAgent[]>;
  getSubAgent(id: string): Promise<SubAgent | undefined>;
  createSubAgent(subAgent: InsertSubAgent): Promise<SubAgent>;
  
  createCustomRequest(request: InsertCustomRequest): Promise<CustomRequest>;
  getAllCustomRequests(): Promise<CustomRequest[]>;
  
  // Extension and permission management
  createUserPermission(permission: InsertUserPermission): Promise<UserPermission>;
  getUserPermissions(userId: string): Promise<UserPermission[]>;
  updateUserPermission(id: string, updates: Partial<UserPermission>): Promise<void>;
  
  createExtensionPairing(pairing: InsertExtensionPairing): Promise<ExtensionPairing>;
  getExtensionPairings(userId: string): Promise<ExtensionPairing[]>;
  getPairingByCode(code: string): Promise<ExtensionPairing | undefined>;
  updateExtensionPairing(id: string, updates: Partial<ExtensionPairing>): Promise<void>;
  updateExtensionLastSeen(id: string): Promise<void>;
  
  createCommandLog(command: InsertCommandLog): Promise<CommandLog>;
  getCommandLog(userId: string, limit?: number, offset?: number): Promise<CommandLog[]>;
  updateCommandResult(requestId: string, updates: { status: string; result?: any; error?: string; executedAt: string }): Promise<void>;
  
  createVoiceInteraction(interaction: InsertVoiceInteraction): Promise<VoiceInteraction>;
  getVoiceInteractions(userId: string, limit?: number): Promise<VoiceInteraction[]>;
  
  createTaskExecution(task: InsertTaskExecution): Promise<TaskExecution>;
  getUserTaskHistory(userId: string, limit?: number, offset?: number): Promise<TaskExecution[]>;
  
  // Agent configuration management
  createAgentConfiguration(config: InsertAgentConfiguration): Promise<AgentConfiguration>;
  getAgentConfiguration(userId: string, agentType: string): Promise<AgentConfiguration | undefined>;
  updateAgentConfiguration(id: string, updates: Partial<AgentConfiguration>): Promise<void>;
  
  // Conversation history management
  createConversationHistory(conversation: InsertConversationHistory): Promise<ConversationHistory>;
  getConversationHistory(userId: string, agentType: string): Promise<ConversationHistory | undefined>;
  updateConversationHistory(id: string, updates: Partial<ConversationHistory>): Promise<void>;
  
  // Device tool detection
  saveDetectedTools(userId: string, tools: InsertDetectedTool[]): Promise<void>;
  getDetectedTools(userId: string): Promise<DetectedTool[]>;
  updateDetectedTool(id: string, updates: Partial<DetectedTool>): Promise<void>;
  
  // Device control and permissions
  createToolPermission(permission: InsertToolPermission): Promise<ToolPermission>;
  checkToolPermission(userId: string, agentType: string, toolName: string): Promise<boolean>;
  getToolPermissions(userId: string, agentType?: string): Promise<ToolPermission[]>;
  
  createPendingAction(action: InsertPendingAction): Promise<PendingAction>;
  getPendingAction(actionId: string): Promise<PendingAction | undefined>;
  getPendingActions(userId: string): Promise<PendingAction[]>;
  updatePendingAction(actionId: string, updates: Partial<PendingAction>): Promise<void>;
  
  createActionExecution(execution: InsertActionExecution): Promise<ActionExecution>;
  getActionExecutions(userId: string, limit?: number): Promise<ActionExecution[]>;
  
  createActionNotification(notification: InsertActionNotification): Promise<ActionNotification>;
  getUserNotifications(userId: string, limit?: number, offset?: number): Promise<ActionNotification[]>;
  markNotificationRead(notificationId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private agents: Map<string, Agent>;
  private subAgents: Map<string, SubAgent>;
  private customRequests: Map<string, CustomRequest>;
  private userPermissions: Map<string, UserPermission>;
  private extensionPairings: Map<string, ExtensionPairing>;
  private commandLogs: Map<string, CommandLog>;
  private voiceInteractions: Map<string, VoiceInteraction>;
  private taskExecutions: Map<string, TaskExecution>;
  private agentConfigurations: Map<string, AgentConfiguration>;
  private conversationHistories: Map<string, ConversationHistory>;
  private detectedTools: Map<string, DetectedTool>;
  private toolPermissions: Map<string, ToolPermission>;
  private pendingActions: Map<string, PendingAction>;
  private actionExecutions: Map<string, ActionExecution>;
  private actionNotifications: Map<string, ActionNotification>;
  private deviceScanner: DeviceScanner;

  constructor() {
    this.users = new Map();
    this.agents = new Map();
    this.subAgents = new Map();
    this.customRequests = new Map();
    this.userPermissions = new Map();
    this.extensionPairings = new Map();
    this.commandLogs = new Map();
    this.voiceInteractions = new Map();
    this.taskExecutions = new Map();
    this.agentConfigurations = new Map();
    this.conversationHistories = new Map();
    this.detectedTools = new Map();
    this.toolPermissions = new Map();
    this.pendingActions = new Map();
    this.actionExecutions = new Map();
    this.actionNotifications = new Map();
    this.deviceScanner = DeviceScanner.getInstance();
    this.initializeData();
  }

  private initializeData() {
    // Initialize sample sub-agents with enhanced data
    const subAgents: InsertSubAgent[] = [
      {
        name: "Content Creator",
        description: "Creates engaging blog posts, articles, and web copy with SEO optimization",
        icon: "fas fa-pen-fancy",
        price: 2900,
        category: "content",
        currentTask: "Writing blog post about AI trends...",
        taskStatus: "working",
        rating: 47,
        reviewCount: 284,
        recentUpdates: ["Enhanced writing quality", "Added SEO optimization", "Improved speed"],
        demoScript: "I can help you create compelling content that engages your audience and drives conversions.",
        integrations: ["WordPress", "HubSpot", "Google Docs", "Notion"],
        totalHires: 342
      },
      {
        name: "Social Media Manager",
        description: "Schedules posts and manages social presence across all platforms",
        icon: "fab fa-instagram",
        price: 3900,
        category: "content",
        currentTask: "Scheduling posts for next week...",
        taskStatus: "working",
        rating: 45,
        reviewCount: 192,
        recentUpdates: ["Multi-platform posting", "Analytics integration", "Content calendar"],
        demoScript: "I'll manage your social media presence and grow your audience engagement.",
        integrations: ["Instagram", "Twitter", "LinkedIn", "Facebook", "TikTok"],
        totalHires: 256
      },
      {
        name: "SEO Specialist",
        description: "Optimizes content for search engines and tracks rankings",
        icon: "fas fa-search",
        price: 4900,
        category: "content",
        currentTask: "Analyzing keyword opportunities...",
        taskStatus: "working",
        rating: 48,
        reviewCount: 367,
        recentUpdates: ["Advanced keyword research", "Competitor analysis", "SERP tracking"],
        demoScript: "I'll boost your search rankings and drive organic traffic to your site.",
        integrations: ["Google Analytics", "SEMrush", "Ahrefs", "Search Console"],
        totalHires: 428
      },
      {
        name: "Data Analyst",
        description: "Generates detailed performance reports and business insights",
        icon: "fas fa-chart-line",
        price: 3500,
        category: "analytics",
        currentTask: "Creating monthly performance report...",
        taskStatus: "working",
        rating: 46,
        reviewCount: 156,
        recentUpdates: ["Real-time dashboards", "Predictive analytics", "Custom metrics"],
        demoScript: "I'll analyze your data and provide actionable insights for business growth.",
        integrations: ["Google Analytics", "Tableau", "Power BI", "Salesforce"],
        totalHires: 189
      },
      {
        name: "Database Manager",
        description: "Processes and cleans large datasets with automated workflows",
        icon: "fas fa-database",
        price: 5900,
        category: "analytics",
        currentTask: "Processing customer data...",
        taskStatus: "working",
        rating: 44,
        reviewCount: 89,
        recentUpdates: ["Automated data cleaning", "Real-time processing", "Data validation"],
        demoScript: "I'll manage your databases and ensure data quality and security.",
        integrations: ["MySQL", "PostgreSQL", "MongoDB", "Redis"],
        totalHires: 143
      },
      {
        name: "Report Generator",
        description: "Creates charts and interactive dashboards for data visualization",
        icon: "fas fa-chart-pie",
        price: 4500,
        category: "analytics",
        currentTask: "Building interactive dashboard...",
        taskStatus: "working",
        rating: 45,
        reviewCount: 203,
        recentUpdates: ["Interactive charts", "Real-time updates", "Mobile responsive"],
        demoScript: "I'll create stunning visualizations that make your data easy to understand.",
        integrations: ["D3.js", "Chart.js", "Plotly", "Grafana"],
        totalHires: 267
      },
      {
        name: "Ticket Manager",
        description: "Manages and routes support tickets with intelligent prioritization",
        icon: "fas fa-inbox",
        price: 3200,
        category: "support",
        currentTask: "Managing support queue...",
        taskStatus: "working",
        rating: 43,
        reviewCount: 178,
        recentUpdates: ["Smart routing", "Priority detection", "Auto-responses"],
        demoScript: "I'll manage your support tickets and ensure customers get quick responses.",
        integrations: ["Zendesk", "Freshdesk", "Intercom", "ServiceNow"],
        totalHires: 234
      },
      {
        name: "Customer Support",
        description: "Provides 24/7 customer chat support with personalized responses",
        icon: "fas fa-comments",
        price: 4200,
        category: "support",
        currentTask: "Helping customer with refund...",
        taskStatus: "working",
        rating: 48,
        reviewCount: 445,
        recentUpdates: ["Natural language processing", "Sentiment analysis", "Multi-language"],
        demoScript: "I'll provide excellent customer support and resolve issues quickly.",
        integrations: ["Slack", "Discord", "WhatsApp", "Live Chat"],
        totalHires: 578
      }
    ];

    subAgents.forEach(subAgent => {
      const id = randomUUID();
      const fullSubAgent: SubAgent = { 
        rating: 45,
        reviewCount: 0,
        recentUpdates: [],
        demoScript: null,
        integrations: [],
        totalHires: 0,
        taskStatus: 'idle',
        currentTask: null,
        ...subAgent, 
        id 
      };
      this.subAgents.set(id, fullSubAgent);
    });

    // Initialize sample main agents
    const agents: InsertAgent[] = [
      {
        name: "Business Growth",
        description: "Scale your revenue with intelligent lead generation, sales automation, and growth optimization strategies.",
        icon: "fas fa-bullhorn",
        price: 9900,
        rating: 49,
        reviewCount: 127,
        category: "growth",
        isBundle: true,
        subAgentIds: Array.from(this.subAgents.values())
          .filter(sa => sa.category === "content")
          .map(sa => sa.id),
        tasks: [
          "Generating qualified leads...",
          "Optimizing conversion funnels...",
          "Running A/B tests...",
          "Analyzing growth metrics...",
          "Scaling successful campaigns..."
        ],
        featured: true
      },
      {
        name: "Operations",
        description: "Streamline workflows, automate processes, and optimize operational efficiency across your entire organization.",
        icon: "fas fa-cogs",
        price: 14900,
        rating: 47,
        reviewCount: 89,
        category: "operations",
        isBundle: true,
        subAgentIds: Array.from(this.subAgents.values())
          .filter(sa => sa.category === "analytics")
          .map(sa => sa.id),
        tasks: [
          "Automating workflows...",
          "Managing resources...",
          "Monitoring performance...",
          "Optimizing processes...",
          "Ensuring quality control..."
        ],
        featured: true
      },
      {
        name: "People & Finance",
        description: "Manage your team and finances with automated HR processes, payroll management, and financial planning.",
        icon: "fas fa-users-cog",
        price: 7900,
        rating: 48,
        reviewCount: 203,
        category: "people-finance",
        isBundle: true,
        subAgentIds: Array.from(this.subAgents.values())
          .filter(sa => sa.category === "support")
          .map(sa => sa.id),
        tasks: [
          "Processing payroll...",
          "Managing benefits...",
          "Tracking expenses...",
          "Recruiting talent...",
          "Analyzing budgets..."
        ],
        featured: true
      }
    ];

    agents.forEach(agent => {
      this.createAgent(agent);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async getFeaturedAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values()).filter(agent => agent.featured);
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = randomUUID();
    const agent: Agent = { 
      rating: 45,
      reviewCount: 0,
      isBundle: true,
      subAgentIds: [],
      tasks: [],
      featured: false,
      ...insertAgent, 
      id 
    };
    this.agents.set(id, agent);
    return agent;
  }

  async getAllSubAgents(): Promise<SubAgent[]> {
    return Array.from(this.subAgents.values());
  }

  async getSubAgentsByCategory(category: string): Promise<SubAgent[]> {
    return Array.from(this.subAgents.values()).filter(
      subAgent => subAgent.category === category
    );
  }

  async getSubAgent(id: string): Promise<SubAgent | undefined> {
    return this.subAgents.get(id);
  }

  async createSubAgent(insertSubAgent: InsertSubAgent): Promise<SubAgent> {
    const id = randomUUID();
    const subAgent: SubAgent = { 
      rating: 45,
      reviewCount: 0,
      recentUpdates: [],
      demoScript: null,
      integrations: [],
      totalHires: 0,
      taskStatus: 'idle',
      currentTask: null,
      ...insertSubAgent, 
      id 
    };
    this.subAgents.set(id, subAgent);
    return subAgent;
  }

  async createCustomRequest(insertRequest: InsertCustomRequest): Promise<CustomRequest> {
    const id = randomUUID();
    const request: CustomRequest = { 
      status: 'pending',
      industry: null,
      budgetRange: null,
      allowPooling: false,
      ...insertRequest, 
      id 
    };
    this.customRequests.set(id, request);
    return request;
  }

  async getAllCustomRequests(): Promise<CustomRequest[]> {
    return Array.from(this.customRequests.values());
  }

  // Extension and permission management implementation
  async createUserPermission(insertPermission: InsertUserPermission): Promise<UserPermission> {
    const id = randomUUID();
    const permission: UserPermission = { 
      isActive: true,
      createdAt: new Date().toISOString(),
      ...insertPermission, 
      id 
    };
    this.userPermissions.set(id, permission);
    return permission;
  }

  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    return Array.from(this.userPermissions.values()).filter(p => p.userId === userId);
  }

  async updateUserPermission(id: string, updates: Partial<UserPermission>): Promise<void> {
    const permission = this.userPermissions.get(id);
    if (permission) {
      this.userPermissions.set(id, { ...permission, ...updates });
    }
  }

  async createExtensionPairing(insertPairing: InsertExtensionPairing): Promise<ExtensionPairing> {
    const id = randomUUID();
    const pairing: ExtensionPairing = { 
      isActive: true,
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      ...insertPairing, 
      id 
    };
    this.extensionPairings.set(id, pairing);
    return pairing;
  }

  async getExtensionPairings(userId: string): Promise<ExtensionPairing[]> {
    return Array.from(this.extensionPairings.values()).filter(p => p.userId === userId);
  }

  async getPairingByCode(code: string): Promise<ExtensionPairing | undefined> {
    return Array.from(this.extensionPairings.values()).find(p => p.pairingCode === code);
  }

  async updateExtensionPairing(id: string, updates: Partial<ExtensionPairing>): Promise<void> {
    const pairing = this.extensionPairings.get(id);
    if (pairing) {
      this.extensionPairings.set(id, { ...pairing, ...updates });
    }
  }

  async updateExtensionLastSeen(id: string): Promise<void> {
    const pairing = this.extensionPairings.get(id);
    if (pairing) {
      this.extensionPairings.set(id, { ...pairing, lastSeen: new Date().toISOString() });
    }
  }

  async createCommandLog(insertCommand: InsertCommandLog): Promise<CommandLog> {
    const id = randomUUID();
    const command: CommandLog = { 
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...insertCommand, 
      id 
    };
    this.commandLogs.set(id, command);
    return command;
  }

  async getCommandLog(userId: string, limit = 50, offset = 0): Promise<CommandLog[]> {
    const userCommands = Array.from(this.commandLogs.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return userCommands.slice(offset, offset + limit);
  }

  async updateCommandResult(requestId: string, updates: { status: string; result?: any; error?: string; executedAt: string }): Promise<void> {
    const command = Array.from(this.commandLogs.values()).find(c => c.requestId === requestId);
    if (command) {
      this.commandLogs.set(command.id, { ...command, ...updates });
    }
  }

  async createVoiceInteraction(insertInteraction: InsertVoiceInteraction): Promise<VoiceInteraction> {
    const id = randomUUID();
    const interaction: VoiceInteraction = { 
      createdAt: new Date().toISOString(),
      ...insertInteraction, 
      id 
    };
    this.voiceInteractions.set(id, interaction);
    return interaction;
  }

  async getVoiceInteractions(userId: string, limit = 50): Promise<VoiceInteraction[]> {
    return Array.from(this.voiceInteractions.values())
      .filter(v => v.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createTaskExecution(insertTask: InsertTaskExecution): Promise<TaskExecution> {
    const id = randomUUID();
    const task: TaskExecution = { 
      status: 'pending',
      executedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      ...insertTask, 
      id 
    };
    this.taskExecutions.set(id, task);
    return task;
  }

  async getUserTaskHistory(userId: string, limit = 50, offset = 0): Promise<TaskExecution[]> {
    const userTasks = Array.from(this.taskExecutions.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return userTasks.slice(offset, offset + limit);
  }

  // Agent configuration management
  async createAgentConfiguration(config: InsertAgentConfiguration): Promise<AgentConfiguration> {
    const id = randomUUID();
    const fullConfig: AgentConfiguration = {
      id,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      ...config,
    };
    this.agentConfigurations.set(id, fullConfig);
    return fullConfig;
  }

  async getAgentConfiguration(userId: string, agentType: string): Promise<AgentConfiguration | undefined> {
    for (const config of this.agentConfigurations.values()) {
      if (config.userId === userId && config.agentType === agentType) {
        return config;
      }
    }
    return undefined;
  }

  async updateAgentConfiguration(id: string, updates: Partial<AgentConfiguration>): Promise<void> {
    const config = this.agentConfigurations.get(id);
    if (config) {
      const updatedConfig = {
        ...config,
        ...updates,
        lastUpdated: new Date().toISOString(),
      };
      this.agentConfigurations.set(id, updatedConfig);
    }
  }

  // Conversation history management
  async createConversationHistory(conversation: InsertConversationHistory): Promise<ConversationHistory> {
    const id = randomUUID();
    const fullConversation: ConversationHistory = {
      id,
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      ...conversation,
    };
    this.conversationHistories.set(id, fullConversation);
    return fullConversation;
  }

  async getConversationHistory(userId: string, agentType: string): Promise<ConversationHistory | undefined> {
    for (const conversation of this.conversationHistories.values()) {
      if (conversation.userId === userId && conversation.agentType === agentType) {
        return conversation;
      }
    }
    return undefined;
  }

  async updateConversationHistory(id: string, updates: Partial<ConversationHistory>): Promise<void> {
    const conversation = this.conversationHistories.get(id);
    if (conversation) {
      const updatedConversation = {
        ...conversation,
        ...updates,
        lastActivity: new Date().toISOString(),
      };
      this.conversationHistories.set(id, updatedConversation);
    }
  }

  // Device tool detection
  async saveDetectedTools(userId: string, tools: InsertDetectedTool[]): Promise<void> {
    // Clear existing tools for this user
    const existingKeys = Array.from(this.detectedTools.keys());
    for (const key of existingKeys) {
      const tool = this.detectedTools.get(key);
      if (tool && tool.userId === userId) {
        this.detectedTools.delete(key);
      }
    }

    // Add new tools
    for (const toolData of tools) {
      const id = randomUUID();
      const tool: DetectedTool = {
        id,
        lastDetected: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        ...toolData,
      };
      this.detectedTools.set(id, tool);
    }
  }

  async getDetectedTools(userId: string): Promise<DetectedTool[]> {
    const userTools = Array.from(this.detectedTools.values())
      .filter(tool => tool.userId === userId)
      .sort((a, b) => a.toolName.localeCompare(b.toolName));
    
    return userTools;
  }

  async updateDetectedTool(id: string, updates: Partial<DetectedTool>): Promise<void> {
    const tool = this.detectedTools.get(id);
    if (tool) {
      const updatedTool = {
        ...tool,
        ...updates,
        lastDetected: new Date().toISOString(),
      };
      this.detectedTools.set(id, updatedTool);
    }
  }

  // Device control and permissions
  async createToolPermission(permission: InsertToolPermission): Promise<ToolPermission> {
    const newPermission: ToolPermission = {
      id: randomUUID(),
      ...permission,
      createdAt: new Date().toISOString()
    };
    this.toolPermissions.set(newPermission.id, newPermission);
    return newPermission;
  }

  async checkToolPermission(userId: string, agentType: string, toolName: string): Promise<boolean> {
    const permissions = Array.from(this.toolPermissions.values());
    return permissions.some(p => 
      p.userId === userId && 
      p.agentType === agentType && 
      p.toolName === toolName && 
      p.granted
    );
  }

  async getToolPermissions(userId: string, agentType?: string): Promise<ToolPermission[]> {
    const permissions = Array.from(this.toolPermissions.values());
    return permissions.filter(p => {
      if (p.userId !== userId) return false;
      if (agentType && p.agentType !== agentType) return false;
      return true;
    });
  }

  async createPendingAction(action: InsertPendingAction): Promise<PendingAction> {
    const newAction: PendingAction = {
      id: randomUUID(),
      ...action,
      createdAt: new Date().toISOString()
    };
    this.pendingActions.set(newAction.id, newAction);
    return newAction;
  }

  async getPendingAction(actionId: string): Promise<PendingAction | undefined> {
    return this.pendingActions.get(actionId);
  }

  async getPendingActions(userId: string): Promise<PendingAction[]> {
    const actions = Array.from(this.pendingActions.values());
    return actions.filter(a => a.userId === userId && a.status === 'pending_approval');
  }

  async updatePendingAction(actionId: string, updates: Partial<PendingAction>): Promise<void> {
    const action = this.pendingActions.get(actionId);
    if (action) {
      Object.assign(action, updates);
      this.pendingActions.set(actionId, action);
    }
  }

  async createActionExecution(execution: InsertActionExecution): Promise<ActionExecution> {
    const newExecution: ActionExecution = {
      id: randomUUID(),
      ...execution,
      createdAt: new Date().toISOString()
    };
    this.actionExecutions.set(newExecution.id, newExecution);
    return newExecution;
  }

  async getActionExecutions(userId: string, limit: number = 50): Promise<ActionExecution[]> {
    const executions = Array.from(this.actionExecutions.values());
    return executions
      .filter(e => e.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createActionNotification(notification: InsertActionNotification): Promise<ActionNotification> {
    const newNotification: ActionNotification = {
      id: randomUUID(),
      ...notification,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.actionNotifications.set(newNotification.id, newNotification);
    return newNotification;
  }

  async getUserNotifications(userId: string, limit: number = 20, offset: number = 0): Promise<ActionNotification[]> {
    const notifications = Array.from(this.actionNotifications.values());
    return notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    const notification = this.actionNotifications.get(notificationId);
    if (notification) {
      notification.read = true;
      this.actionNotifications.set(notificationId, notification);
    }
  }

  async addTaskExecution(execution: InsertTaskExecution): Promise<TaskExecution> {
    const newExecution: TaskExecution = {
      id: randomUUID(),
      ...execution,
      createdAt: new Date().toISOString()
    };
    this.taskExecutions.set(newExecution.id, newExecution);
    return newExecution;
  }

  async getTaskExecutions(userId: string, limit: number = 50): Promise<TaskExecution[]> {
    const executions = Array.from(this.taskExecutions.values());
    return executions
      .filter(e => e.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
