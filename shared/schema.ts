import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Projects table
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  htmlCode: text("html_code").notNull().default(""),
  cssCode: text("css_code").notNull().default(""),
  jsCode: text("js_code").notNull().default(""),
  thumbnail: text("thumbnail"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Chat messages table
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Templates table
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  htmlCode: text("html_code").notNull(),
  cssCode: text("css_code").notNull(),
  jsCode: text("js_code").notNull(),
  thumbnail: text("thumbnail"),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
});

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

// Project Versions table - for version history
export const projectVersions = pgTable("project_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  versionNumber: text("version_number").notNull(),
  htmlCode: text("html_code").notNull(),
  cssCode: text("css_code").notNull(),
  jsCode: text("js_code").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProjectVersionSchema = createInsertSchema(projectVersions).omit({
  id: true,
  createdAt: true,
});

export type InsertProjectVersion = z.infer<typeof insertProjectVersionSchema>;
export type ProjectVersion = typeof projectVersions.$inferSelect;

// Share Links table - for sharing projects
export const shareLinks = pgTable("share_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  shareCode: varchar("share_code").notNull().unique(),
  isActive: text("is_active").notNull().default("true"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertShareLinkSchema = createInsertSchema(shareLinks).omit({
  id: true,
  createdAt: true,
});

export type InsertShareLink = z.infer<typeof insertShareLinkSchema>;
export type ShareLink = typeof shareLinks.$inferSelect;

// Component Library table - for reusable components
export const components = pgTable("components", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  htmlCode: text("html_code").notNull(),
  cssCode: text("css_code").notNull(),
  jsCode: text("js_code").notNull().default(""),
  thumbnail: text("thumbnail"),
  framework: text("framework").notNull().default("vanilla"),
});

export const insertComponentSchema = createInsertSchema(components).omit({
  id: true,
});

export type InsertComponent = z.infer<typeof insertComponentSchema>;
export type Component = typeof components.$inferSelect;

// API Types
export interface GenerateCodeRequest {
  prompt: string;
  projectId?: string;
  context?: string;
  framework?: 'vanilla' | 'tailwind' | 'bootstrap';
}

export interface GenerateCodeResponse {
  html: string;
  css: string;
  js: string;
  message: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
