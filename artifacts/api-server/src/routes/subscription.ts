import { Router } from "express";
import { db, subscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const PLANS = [
  {
    id: "start",
    name: "Старт",
    days: 30,
    price: 199,
    currency: "RUB",
    priceUsdt: 2.10,
    description: "Базовый доступ на месяц",
    popular: false,
  },
  {
    id: "standard",
    name: "Стандарт",
    days: 90,
    price: 499,
    currency: "RUB",
    priceUsdt: 5.40,
    description: "Оптимальный выбор на квартал",
    popular: true,
  },
  {
    id: "pro",
    name: "Про",
    days: 180,
    price: 899,
    currency: "RUB",
    priceUsdt: 9.70,
    description: "Полгода без ограничений",
    popular: false,
  },
];

function requireAuth(req: any, res: any): string | null {
  const licenseKey = req.headers["x-license-key"] as string | undefined;
  if (!licenseKey) {
    res.status(401).json({ error: "unauthorized", message: "Требуется авторизация" });
    return null;
  }
  return licenseKey.toUpperCase().trim();
}

router.get("/subscription", async (req, res) => {
  const licenseKey = requireAuth(req, res);
  if (!licenseKey) return;

  const subscription = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.licenseKey, licenseKey))
    .limit(1);

  if (subscription.length === 0) {
    res.status(401).json({ error: "unauthorized", message: "Ключ не найден" });
    return;
  }

  const sub = subscription[0];

  res.json({
    id: sub.id,
    licenseKey: sub.licenseKey,
    plan: sub.plan,
    status: sub.status,
    expiresAt: sub.expiresAt?.toISOString() ?? null,
    configsCount: sub.configsCount,
    createdAt: sub.createdAt.toISOString(),
  });
});

router.get("/subscription/plans", (req, res) => {
  res.json({ plans: PLANS });
});

router.get("/dashboard/stats", async (req, res) => {
  const licenseKey = requireAuth(req, res);
  if (!licenseKey) return;

  const subscription = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.licenseKey, licenseKey))
    .limit(1);

  if (subscription.length === 0) {
    res.status(401).json({ error: "unauthorized", message: "Ключ не найден" });
    return;
  }

  const sub = subscription[0];
  const now = new Date();
  let daysRemaining = 0;

  if (sub.expiresAt && sub.status === "active") {
    const diff = sub.expiresAt.getTime() - now.getTime();
    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  res.json({
    daysRemaining,
    configsAvailable: sub.configsCount,
    locationsCount: 5,
    totalDownloads: sub.totalDownloads,
    isActive: sub.status === "active",
  });
});

export default router;
export { PLANS };
