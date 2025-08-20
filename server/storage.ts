import { type User, type InsertUser, type Agent, type InsertAgent, type SubAgent, type InsertSubAgent, type CustomRequest, type InsertCustomRequest } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private agents: Map<string, Agent>;
  private subAgents: Map<string, SubAgent>;
  private customRequests: Map<string, CustomRequest>;

  constructor() {
    this.users = new Map();
    this.agents = new Map();
    this.subAgents = new Map();
    this.customRequests = new Map();
    this.initializeData();
  }

  private initializeData() {
    // Initialize sample sub-agents
    const subAgents: InsertSubAgent[] = [
      {
        name: "Content Writer",
        description: "Creates engaging blog posts, articles, and web copy",
        icon: "fas fa-pen-fancy",
        price: 2900,
        category: "content",
        currentTask: "Writing blog post...",
        taskStatus: "working"
      },
      {
        name: "Social Media Manager",
        description: "Schedules posts and manages social presence",
        icon: "fab fa-instagram",
        price: 3900,
        category: "content",
        currentTask: "Scheduling posts...",
        taskStatus: "working"
      },
      {
        name: "SEO Specialist",
        description: "Optimizes content for search engines",
        icon: "fas fa-search",
        price: 4900,
        category: "content",
        currentTask: "Analyzing keywords...",
        taskStatus: "working"
      },
      {
        name: "Analytics Reporter",
        description: "Generates detailed performance reports",
        icon: "fas fa-chart-line",
        price: 3500,
        category: "analytics",
        currentTask: "Creating report...",
        taskStatus: "working"
      },
      {
        name: "Data Processor",
        description: "Processes and cleans large datasets",
        icon: "fas fa-database",
        price: 5900,
        category: "analytics",
        currentTask: "Processing dataset...",
        taskStatus: "working"
      },
      {
        name: "Visualization Creator",
        description: "Creates charts and interactive dashboards",
        icon: "fas fa-chart-pie",
        price: 4500,
        category: "analytics",
        currentTask: "Creating visualizations...",
        taskStatus: "working"
      },
      {
        name: "Ticket Manager",
        description: "Manages and routes support tickets",
        icon: "fas fa-inbox",
        price: 3200,
        category: "support",
        currentTask: "Managing support tickets...",
        taskStatus: "working"
      },
      {
        name: "Chat Assistant",
        description: "Provides 24/7 customer chat support",
        icon: "fas fa-comments",
        price: 4200,
        category: "support",
        currentTask: "Responding to customers...",
        taskStatus: "working"
      }
    ];

    subAgents.forEach(subAgent => {
      this.createSubAgent(subAgent);
    });

    // Initialize sample main agents
    const agents: InsertAgent[] = [
      {
        name: "Marketing Agent",
        description: "Complete marketing automation with content creation, social media management, and analytics reporting.",
        icon: "fas fa-bullhorn",
        price: 9900,
        rating: 49,
        reviewCount: 127,
        category: "marketing",
        isBundle: true,
        subAgentIds: Array.from(this.subAgents.values())
          .filter(sa => sa.category === "content")
          .map(sa => sa.id),
        tasks: [
          "Creating blog content...",
          "Scheduling social posts...",
          "Analyzing campaign performance...",
          "Optimizing SEO keywords...",
          "Generating marketing reports..."
        ],
        featured: true
      },
      {
        name: "Data Analyst",
        description: "Advanced data processing, visualization, and reporting with automated insights and trend analysis.",
        icon: "fas fa-chart-bar",
        price: 14900,
        rating: 47,
        reviewCount: 89,
        category: "analytics",
        isBundle: true,
        subAgentIds: Array.from(this.subAgents.values())
          .filter(sa => sa.category === "analytics")
          .map(sa => sa.id),
        tasks: [
          "Processing dataset...",
          "Creating visualizations...",
          "Generating insights report...",
          "Building dashboards...",
          "Monitoring KPIs..."
        ],
        featured: true
      },
      {
        name: "Customer Support",
        description: "24/7 customer service with intelligent ticket routing, response automation, and satisfaction tracking.",
        icon: "fas fa-headset",
        price: 7900,
        rating: 48,
        reviewCount: 203,
        category: "support",
        isBundle: true,
        subAgentIds: Array.from(this.subAgents.values())
          .filter(sa => sa.category === "support")
          .map(sa => sa.id),
        tasks: [
          "Managing support tickets...",
          "Responding to customers...",
          "Tracking satisfaction...",
          "Escalating complex issues...",
          "Updating knowledge base..."
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
    const agent: Agent = { ...insertAgent, id };
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
    const subAgent: SubAgent = { ...insertSubAgent, id };
    this.subAgents.set(id, subAgent);
    return subAgent;
  }

  async createCustomRequest(insertRequest: InsertCustomRequest): Promise<CustomRequest> {
    const id = randomUUID();
    const request: CustomRequest = { ...insertRequest, id };
    this.customRequests.set(id, request);
    return request;
  }

  async getAllCustomRequests(): Promise<CustomRequest[]> {
    return Array.from(this.customRequests.values());
  }
}

export const storage = new MemStorage();
