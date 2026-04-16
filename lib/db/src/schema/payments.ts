import { pgTable, serial, text, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "expired", "failed"]);
export const paymentMethodEnum = pgEnum("payment_method", ["cryptobot", "sbp"]);

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  invoiceId: text("invoice_id").notNull().unique(),
  externalInvoiceId: text("external_invoice_id"),
  licenseKey: text("license_key").notNull(),
  planId: text("plan_id").notNull(),
  method: paymentMethodEnum("method").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  paidAt: timestamp("paid_at"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({ id: true, createdAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
