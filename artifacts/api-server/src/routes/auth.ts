import { Router } from "express";
import { db, subscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { LoginBody } from "@workspace/api-zod";

const router = Router();

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid request body" });
    return;
  }

  const { licenseKey } = parsed.data;
  const normalizedKey = licenseKey.toUpperCase().trim();

  const subscription = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.licenseKey, normalizedKey))
    .limit(1);

  if (subscription.length === 0) {
    res.status(401).json({ error: "invalid_key", message: "Лицензионный ключ не найден" });
    return;
  }

  const sub = subscription[0];

  if (sub.status === "expired") {
    res.status(401).json({ error: "key_expired", message: "Подписка истекла" });
    return;
  }

  res.json({
    success: true,
    licenseKey: sub.licenseKey,
    subscription: {
      id: sub.id,
      licenseKey: sub.licenseKey,
      plan: sub.plan,
      status: sub.status,
      expiresAt: sub.expiresAt?.toISOString() ?? null,
      configsCount: sub.configsCount,
      createdAt: sub.createdAt.toISOString(),
    },
  });
});

router.post("/auth/logout", (req, res) => {
  res.json({ success: true });
});

router.get("/auth/me", async (req, res) => {
  const licenseKey = req.headers["x-license-key"] as string | undefined;

  if (!licenseKey) {
    res.status(401).json({ error: "unauthorized", message: "Требуется авторизация" });
    return;
  }

  const subscription = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.licenseKey, licenseKey.toUpperCase().trim()))
    .limit(1);

  if (subscription.length === 0) {
    res.status(401).json({ error: "unauthorized", message: "Ключ не найден" });
    return;
  }

  const sub = subscription[0];

  res.json({
    licenseKey: sub.licenseKey,
    subscription: {
      id: sub.id,
      licenseKey: sub.licenseKey,
      plan: sub.plan,
      status: sub.status,
      expiresAt: sub.expiresAt?.toISOString() ?? null,
      configsCount: sub.configsCount,
      createdAt: sub.createdAt.toISOString(),
    },
  });
});

export default router;
