import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const planEnum = pgEnum("plan", ["start", "standard", "pro", "demo"]);
export const statusEnum = pgEnum("subscription_status", ["active", "expired", "pending"]);

export const subscriptionsTable = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  licenseKey: text("license_key").notNull().unique(),
  plan: planEnum("plan").notNull().default("start"),
  status: statusEnum("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at"),
  configsCount: integer("configs_count").notNull().default(5),
  totalDownloads: integer("total_downloads").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptionsTable).omit({ id: true, createdAt: true });
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptionsTable.$inferSelect;
