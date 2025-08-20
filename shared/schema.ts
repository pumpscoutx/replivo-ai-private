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
  taskStatus: text("task_status").notNull().default("idle") // idle, working, completed
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

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;
export type InsertSubAgent = z.infer<typeof insertSubAgentSchema>;
export type SubAgent = typeof subAgents.$inferSelect;
export type InsertCustomRequest = z.infer<typeof insertCustomRequestSchema>;
export type CustomRequest = typeof customRequests.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
