import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Monitoring log schema
export const monitoringLogs = pgTable("monitoring_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  url: text("url").notNull(),
  statusCode: integer("status_code"),
  success: boolean("success").notNull(),
  message: text("message").notNull(),
  responseTime: integer("response_time"),
});

export const insertMonitoringLogSchema = createInsertSchema(monitoringLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertMonitoringLog = z.infer<typeof insertMonitoringLogSchema>;
export type MonitoringLog = typeof monitoringLogs.$inferSelect;

// Monitoring configuration schema
export const monitoringConfig = pgTable("monitoring_config", {
  id: serial("id").primaryKey(),
  targetUrl: text("target_url").notNull(),
  checkIntervalMs: integer("check_interval_ms").notNull().default(300000), // 5 minutes in milliseconds
  isActive: boolean("is_active").notNull().default(true),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertMonitoringConfigSchema = createInsertSchema(monitoringConfig).omit({
  id: true,
  lastUpdated: true,
});

export type InsertMonitoringConfig = z.infer<typeof insertMonitoringConfigSchema>;
export type MonitoringConfig = typeof monitoringConfig.$inferSelect;
