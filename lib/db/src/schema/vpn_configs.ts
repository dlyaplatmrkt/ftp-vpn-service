import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const vpnConfigsTable = pgTable("vpn_configs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  name: text("name").notNull(),
  serverLocation: text("server_location").notNull(),
  serverFlag: text("server_flag").notNull().default("🌍"),
  protocol: text("protocol").notNull().default("AmnesiaWG"),
  privateKey: text("private_key").notNull(),
  publicKey: text("public_key").notNull(),
  peerPublicKey: text("peer_public_key").notNull(),
  presharedKey: text("preshared_key").notNull(),
  serverEndpoint: text("server_endpoint").notNull(),
  allowedIps: text("allowed_ips").notNull().default("0.0.0.0/0"),
  dns: text("dns").notNull().default("1.1.1.1, 1.0.0.1"),
  clientIp: text("client_ip").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVpnConfigSchema = createInsertSchema(vpnConfigsTable).omit({ id: true, createdAt: true });
export type InsertVpnConfig = z.infer<typeof insertVpnConfigSchema>;
export type VpnConfig = typeof vpnConfigsTable.$inferSelect;
