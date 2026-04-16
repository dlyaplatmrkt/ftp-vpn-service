import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, vpnConfigsTable, subscriptionsTable } from "@workspace/db";
import {
  GenerateConfigBody,
  GetConfigParams,
  DeleteConfigParams,
  DownloadConfigParams,
  GetConfigsResponse,
  GetConfigResponse,
  DownloadConfigResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import {
  generateWireguardKeys,
  generatePresharedKey,
  generateClientIp,
} from "../lib/keygen";
import { generateWireguardConfig, SERVER_LOCATIONS } from "../lib/wireguard";

const router: IRouter = Router();

router.get("/configs", requireAuth, async (req, res): Promise<void> => {
  const configs = await db
    .select()
    .from(vpnConfigsTable)
    .where(eq(vpnConfigsTable.userId, req.userId!))
    .orderBy(desc(vpnConfigsTable.createdAt));

  res.json(
    GetConfigsResponse.parse(
      configs.map((c) => ({
        id: c.id,
        name: c.name,
        serverLocation: c.serverLocation,
        serverFlag: c.serverFlag,
        protocol: c.protocol,
        createdAt: c.createdAt,
        isActive: c.isActive,
      }))
    )
  );
});

router.post("/configs", requireAuth, async (req, res): Promise<void> => {
  const now = new Date();

  const [activeSubscription] = await db
    .select()
    .from(subscriptionsTable)
    .where(
      and(
        eq(subscriptionsTable.userId, req.userId!),
        eq(subscriptionsTable.status, "active")
      )
    )
    .limit(1);

  if (!activeSubscription || activeSubscription.expiresAt < now) {
    res.status(403).json({ error: "No active subscription" });
    return;
  }

  const parsed = GenerateConfigBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, serverLocation } = parsed.data;

  const serverInfo = SERVER_LOCATIONS[serverLocation];
  if (!serverInfo) {
    res.status(400).json({ error: "Invalid server location" });
    return;
  }

  const existingConfigs = await db
    .select()
    .from(vpnConfigsTable)
    .where(eq(vpnConfigsTable.userId, req.userId!));

  const { privateKey, publicKey } = generateWireguardKeys();
  const presharedKey = generatePresharedKey();
  const clientIp = generateClientIp(existingConfigs.length);

  const [config] = await db
    .insert(vpnConfigsTable)
    .values({
      userId: req.userId!,
      name,
      serverLocation,
      serverFlag: serverInfo.flag,
      protocol: "AmnesiaWG",
      privateKey,
      publicKey,
      peerPublicKey: serverInfo.publicKey,
      presharedKey,
      serverEndpoint: serverInfo.endpoint,
      allowedIps: "0.0.0.0/0",
      dns: "1.1.1.1, 1.0.0.1",
      clientIp,
      isActive: true,
    })
    .returning();

  req.log.info({ configId: config.id, userId: req.userId }, "Config generated");

  res.status(201).json(
    GetConfigResponse.parse({
      id: config.id,
      name: config.name,
      serverLocation: config.serverLocation,
      serverFlag: config.serverFlag,
      protocol: config.protocol,
      createdAt: config.createdAt,
      isActive: config.isActive,
    })
  );
});

router.get("/configs/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetConfigParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [config] = await db
    .select()
    .from(vpnConfigsTable)
    .where(
      and(
        eq(vpnConfigsTable.id, params.data.id),
        eq(vpnConfigsTable.userId, req.userId!)
      )
    );

  if (!config) {
    res.status(404).json({ error: "Config not found" });
    return;
  }

  res.json(
    GetConfigResponse.parse({
      id: config.id,
      name: config.name,
      serverLocation: config.serverLocation,
      serverFlag: config.serverFlag,
      protocol: config.protocol,
      createdAt: config.createdAt,
      isActive: config.isActive,
    })
  );
});

router.delete("/configs/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteConfigParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(vpnConfigsTable)
    .where(
      and(
        eq(vpnConfigsTable.id, params.data.id),
        eq(vpnConfigsTable.userId, req.userId!)
      )
    )
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Config not found" });
    return;
  }

  res.json({ success: true });
});

router.get("/configs/:id/download", requireAuth, async (req, res): Promise<void> => {
  const params = DownloadConfigParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [config] = await db
    .select()
    .from(vpnConfigsTable)
    .where(
      and(
        eq(vpnConfigsTable.id, params.data.id),
        eq(vpnConfigsTable.userId, req.userId!)
      )
    );

  if (!config) {
    res.status(404).json({ error: "Config not found" });
    return;
  }

  const configContent = generateWireguardConfig({
    clientPrivateKey: config.privateKey,
    serverPublicKey: config.peerPublicKey,
    presharedKey: config.presharedKey,
    clientIp: config.clientIp,
    serverEndpoint: config.serverEndpoint,
    dns: config.dns,
    allowedIps: config.allowedIps,
  });

  const filename = `${config.name.replace(/[^a-zA-Z0-9_-]/g, "_")}.conf`;

  res.json(
    DownloadConfigResponse.parse({
      id: config.id,
      filename,
      content: configContent,
    })
  );
});

export default router;
