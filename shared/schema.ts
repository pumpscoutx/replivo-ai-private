import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const agents = pgTable("agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  price: integer("price").notNull(), // in cents
  rating: integer("rating").notNull().default(45), // out of 50 (4.5 stars = 45)
  reviewCount: integer("review_count").notNull().default(0),
  category: text("category").notNull(),
  isBundle: boolean("is_bundle").notNull().default(true),
  subAgentIds: jsonb("sub_agent_ids").$type<string[]>().default([]),
  tasks: jsonb("tasks").$type<string[]>().default([]),
  featured: boolean("featured").notNull().default(false)
});

export const subAgents = pgTable("sub_agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  price: integer("price").notNull(), // in cents
  category: text("category").notNull(),
  currentTask: text("current_task"),
  taskStatus: text("task_status").notNull().default("idle"), // idle, working, completed
  rating: integer("rating").notNull().default(45), // out of 50 (4.5 stars = 45)
  reviewCount: integer("review_count").notNull().default(0),
  recentUpdates: jsonb("recent_updates").$type<string[]>().default([]),
  demoScript: text("demo_script"), // For live preview functionality
  integrations: jsonb("integrations").$type<string[]>().default([]),
  totalHires: integer("total_hires").notNull().default(0)
});

export const customRequests = pgTable("custom_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  description: text("description").notNull(),
  industry: text("industry"),
  budgetRange: text("budget_range"),
  allowPooling: boolean("allow_pooling").notNull().default(false),
  status: text("status").notNull().default("pending") // pending, in_progress, completed
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true
});

export const insertSubAgentSchema = createInsertSchema(subAgents).omit({
  id: true
});

export const insertCustomRequestSchema = createInsertSchema(customRequests).omit({
  id: true
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true
});

// Reviews table for sub-agent ratings and feedback
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subAgentId: varchar("sub_agent_id").notNull(),
  userId: varchar("user_id").notNull(),
  rating: integer("rating").notNull(), // 1-50 (1-5 stars * 10)
  comment: text("comment"),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true
});

// Enhanced schema for browser extension and device control
export const userPermissions = pgTable("user_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  agentId: varchar("agent_id").notNull(),
  scope: text("scope").notNull(), // browser:fill, browser:read, email:send, etc.
  domain: text("domain"), // specific domain for browser permissions
  autonomyLevel: text("autonomy_level").notNull(), // suggest, confirm, autonomous
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: text("expires_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const agentConfigurations = pgTable("agent_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull(),
  agentType: text("agent_type").notNull(),
  userId: varchar("user_id").notNull(),
  autonomousTasks: jsonb("autonomous_tasks").$type<any[]>().default([]),
  confirmTasks: jsonb("confirm_tasks").$type<any[]>().default([]),
  suggestTasks: jsonb("suggest_tasks").$type<any[]>().default([]),
  allowedTools: jsonb("allowed_tools").$type<string[]>().default([]),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  workingHours: jsonb("working_hours").$type<any>().default({}),
  notifications: jsonb("notifications").$type<any>().default({}),
  conversationContext: jsonb("conversation_context").$type<any>().default({}),
  lastUpdated: text("last_updated").notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const conversationHistory = pgTable("conversation_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  agentType: text("agent_type").notNull(),
  conversationId: varchar("conversation_id").notNull(),
  messages: jsonb("messages").$type<any[]>().default([]),
  context: jsonb("context").$type<any>().default({}),
  lastActivity: text("last_activity").notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const detectedTools = pgTable("detected_tools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  toolName: text("tool_name").notNull(),
  category: text("category").notNull(),
  executable: text("executable"),
  version: text("version"),
  installed: boolean("installed").notNull().default(false),
  isLoggedIn: boolean("is_logged_in").default(false),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  lastDetected: text("last_detected").notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const extensionPairings = pgTable("extension_pairings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  extensionId: text("extension_id").notNull(),
  pairingCode: text("pairing_code").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastSeen: text("last_seen").default(sql`CURRENT_TIMESTAMP`),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const commandLog = pgTable("command_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  agentId: varchar("agent_id").notNull(),
  requestId: text("request_id").notNull(),
  capability: text("capability").notNull(),
  args: jsonb("args"),
  result: jsonb("result"),
  status: text("status").notNull(), // pending, success, failed, rejected
  signature: text("signature").notNull(),
  executedAt: text("executed_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const voiceInteractions = pgTable("voice_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  agentId: varchar("agent_id").notNull(),
  transcript: text("transcript").notNull(),
  intent: text("intent"),
  response: text("response"),
  audioUrl: text("audio_url"), // optional audio storage
  duration: integer("duration"), // in milliseconds
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const taskExecutions = pgTable("task_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  agentType: text("agent_type").notNull(), // business-growth, operations, people-finance
  subAgent: text("sub_agent"),
  task: text("task").notNull(),
  context: text("context"),
  response: text("response").notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  executedAt: text("executed_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const insertUserPermissionSchema = createInsertSchema(userPermissions).omit({
  id: true,
  createdAt: true
});

export const insertExtensionPairingSchema = createInsertSchema(extensionPairings).omit({
  id: true,
  createdAt: true,
  lastSeen: true
});

export const insertCommandLogSchema = createInsertSchema(commandLog).omit({
  id: true,
  createdAt: true
});

export const insertVoiceInteractionSchema = createInsertSchema(voiceInteractions).omit({
  id: true,
  createdAt: true
});

export const insertTaskExecutionSchema = createInsertSchema(taskExecutions).omit({
  id: true,
  createdAt: true
});

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;
export type InsertSubAgent = z.infer<typeof insertSubAgentSchema>;
export type SubAgent = typeof subAgents.$inferSelect;
export type InsertCustomRequest = z.infer<typeof insertCustomRequestSchema>;
export type CustomRequest = typeof customRequests.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type UserPermission = typeof userPermissions.$inferSelect;
export type InsertUserPermission = z.infer<typeof insertUserPermissionSchema>;
export type ExtensionPairing = typeof extensionPairings.$inferSelect;
export type InsertExtensionPairing = z.infer<typeof insertExtensionPairingSchema>;
export type CommandLog = typeof commandLog.$inferSelect;
export type InsertCommandLog = z.infer<typeof insertCommandLogSchema>;
export type VoiceInteraction = typeof voiceInteractions.$inferSelect;
export type InsertVoiceInteraction = z.infer<typeof insertVoiceInteractionSchema>;
export type TaskExecution = typeof taskExecutions.$inferSelect;
export type InsertTaskExecution = z.infer<typeof insertTaskExecutionSchema>;

export const insertAgentConfigSchema = createInsertSchema(agentConfigurations).omit({
  id: true,
  createdAt: true,
  lastUpdated: true
});

export const insertConversationHistorySchema = createInsertSchema(conversationHistory).omit({
  id: true,
  createdAt: true,
  lastActivity: true
});

export const insertDetectedToolSchema = createInsertSchema(detectedTools).omit({
  id: true,
  createdAt: true,
  lastDetected: true
});

export type AgentConfiguration = typeof agentConfigurations.$inferSelect;
export type InsertAgentConfiguration = z.infer<typeof insertAgentConfigSchema>;
export type ConversationHistory = typeof conversationHistory.$inferSelect;
export type InsertConversationHistory = z.infer<typeof insertConversationHistorySchema>;
export type DetectedTool = typeof detectedTools.$inferSelect;
export type InsertDetectedTool = z.infer<typeof insertDetectedToolSchema>;
