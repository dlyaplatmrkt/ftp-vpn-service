import { pgTable, serial, text, integer, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const subscriptionPlansTable = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  durationDays: integer("duration_days").notNull(),
  priceRub: numeric("price_rub", { precision: 10, scale: 2 }).notNull(),
  priceCrypto: numeric("price_crypto", { precision: 10, scale: 6 }).notNull(),
  cryptoCurrency: text("crypto_currency").notNull().default("USDT"),
  maxDevices: integer("max_devices").notNull().default(5),
  features: jsonb("features").$type<string[]>().notNull().default([]),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlansTable).omit({ id: true });
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlansTable.$inferSelect;
