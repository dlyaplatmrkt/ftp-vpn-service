import { Router, type IRouter } from "express";
import { eq, and, count } from "drizzle-orm";
import { db, vpnConfigsTable, subscriptionsTable } from "@workspace/db";
import { GetUserStatsResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/user/stats", requireAuth, async (req, res): Promise<void> => {
  const now = new Date();

  const [totalRow] = await db
    .select({ count: count() })
    .from(vpnConfigsTable)
    .where(eq(vpnConfigsTable.userId, req.userId!));

  const [activeRow] = await db
    .select({ count: count() })
    .from(vpnConfigsTable)
    .where(
      and(
        eq(vpnConfigsTable.userId, req.userId!),
        eq(vpnConfigsTable.isActive, true)
      )
    );

  const [activeSub] = await db
    .select()
    .from(subscriptionsTable)
    .where(
      and(
        eq(subscriptionsTable.userId, req.userId!),
        eq(subscriptionsTable.status, "active")
      )
    )
    .limit(1);

  let daysUntilExpiry = 0;
  let subscriptionStatus = "none";

  if (activeSub) {
    subscriptionStatus = activeSub.status;
    daysUntilExpiry = Math.max(
      0,
      Math.ceil((activeSub.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );
  }

  res.json(
    GetUserStatsResponse.parse({
      totalConfigs: totalRow?.count ?? 0,
      activeConfigs: activeRow?.count ?? 0,
      subscriptionStatus,
      daysUntilExpiry,
      accountAgeDays: 0,
    })
  );
});

export default router;
