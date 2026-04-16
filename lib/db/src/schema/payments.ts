import { pgTable, serial, integer, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { subscriptionPlansTable } from "./subscription_plans";

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  planId: integer("plan_id").references(() => subscriptionPlansTable.id).notNull(),
  method: text("method").notNull(), // crypto, sbp
  status: text("status").notNull().default("pending"), // pending, paid, expired, failed
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull(),
  externalId: text("external_id"), // CryptoBot invoice ID or SBP payment ID
  invoiceUrl: text("invoice_url"),
  qrUrl: text("qr_url"),
  bankName: text("bank_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  paidAt: timestamp("paid_at"),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({ id: true, createdAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
