import { type User, type InsertUser, type Agent, type InsertAgent, type SubAgent, type InsertSubAgent, type CustomRequest, type InsertCustomRequest, type UserPermission, type InsertUserPermission, type ExtensionPairing, type InsertExtensionPairing, type CommandLog, type InsertCommandLog, type VoiceInteraction, type InsertVoiceInteraction } from "@shared/schema";
import { randomUUID } from "crypto";

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

  constructor() {
    this.users = new Map();
    this.agents = new Map();
    this.subAgents = new Map();
    this.customRequests = new Map();
    this.userPermissions = new Map();
    this.extensionPairings = new Map();
    this.commandLogs = new Map();
    this.voiceInteractions = new Map();
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
}

export const storage = new MemStorage();
