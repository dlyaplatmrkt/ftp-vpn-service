import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, subscriptionPlansTable, subscriptionsTable } from "@workspace/db";
import {
  GetSubscriptionPlansResponse,
  GetCurrentSubscriptionResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/subscriptions/plans", async (_req, res): Promise<void> => {
  const plans = await db.select().from(subscriptionPlansTable).orderBy(subscriptionPlansTable.durationDays);
  res.json(
    GetSubscriptionPlansResponse.parse(
      plans.map((p) => ({
        id: p.id,
        name: p.name,
        durationDays: p.durationDays,
        priceRub: parseFloat(p.priceRub),
        priceCrypto: parseFloat(p.priceCrypto),
        cryptoCurrency: p.cryptoCurrency,
        maxDevices: p.maxDevices,
        features: p.features as string[],
      }))
    )
  );
});

router.get("/subscriptions/current", requireAuth, async (req, res): Promise<void> => {
  const now = new Date();

  const [subscription] = await db
    .select({
      id: subscriptionsTable.id,
      planId: subscriptionsTable.planId,
      planName: subscriptionPlansTable.name,
      status: subscriptionsTable.status,
      startedAt: subscriptionsTable.startedAt,
      expiresAt: subscriptionsTable.expiresAt,
    })
    .from(subscriptionsTable)
    .innerJoin(subscriptionPlansTable, eq(subscriptionsTable.planId, subscriptionPlansTable.id))
    .where(
      and(
        eq(subscriptionsTable.userId, req.userId!),
        eq(subscriptionsTable.status, "active")
      )
    )
    .orderBy(desc(subscriptionsTable.expiresAt))
    .limit(1);

  if (!subscription) {
    res.status(404).json({ error: "No active subscription" });
    return;
  }

  const daysLeft = Math.max(
    0,
    Math.ceil((subscription.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  res.json(
    GetCurrentSubscriptionResponse.parse({
      id: subscription.id,
      planId: subscription.planId,
      planName: subscription.planName,
      status: subscription.status,
      startedAt: subscription.startedAt,
      expiresAt: subscription.expiresAt,
      daysLeft,
    })
  );
});

export default router;
