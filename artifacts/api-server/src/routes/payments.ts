import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, paymentsTable, subscriptionPlansTable, subscriptionsTable } from "@workspace/db";
import {
  CreateCryptoPaymentBody,
  CreateSbpPaymentBody,
  GetPaymentStatusParams,
  CreateCryptoPaymentResponse,
  CreateSbpPaymentResponse,
  GetPaymentStatusResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/payments/crypto/create", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateCryptoPaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [plan] = await db
    .select()
    .from(subscriptionPlansTable)
    .where(eq(subscriptionPlansTable.id, parsed.data.planId));

  if (!plan) {
    res.status(404).json({ error: "Plan not found" });
    return;
  }

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const paymentId = `CRYPTO-${Date.now()}-${req.userId}`;

  const [payment] = await db
    .insert(paymentsTable)
    .values({
      userId: req.userId!,
      planId: plan.id,
      method: "crypto",
      status: "pending",
      amount: plan.priceCrypto,
      currency: plan.cryptoCurrency,
      externalId: paymentId,
      invoiceUrl: `https://t.me/CryptoBot?start=pay_${paymentId}`,
      expiresAt,
    })
    .returning();

  res.json(
    CreateCryptoPaymentResponse.parse({
      paymentId: payment.externalId!,
      invoiceUrl: payment.invoiceUrl!,
      amount: parseFloat(payment.amount),
      currency: payment.currency,
      expiresAt: payment.expiresAt,
    })
  );

  req.log.info({ paymentId, userId: req.userId, planId: plan.id }, "Crypto payment created");
});

router.post("/payments/sbp/create", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateSbpPaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [plan] = await db
    .select()
    .from(subscriptionPlansTable)
    .where(eq(subscriptionPlansTable.id, parsed.data.planId));

  if (!plan) {
    res.status(404).json({ error: "Plan not found" });
    return;
  }

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const paymentId = `SBP-${Date.now()}-${req.userId}`;

  const [payment] = await db
    .insert(paymentsTable)
    .values({
      userId: req.userId!,
      planId: plan.id,
      method: "sbp",
      status: "pending",
      amount: plan.priceRub,
      currency: "RUB",
      externalId: paymentId,
      qrUrl: `https://sbp.ru/qr/${paymentId}`,
      bankName: "Тинькофф Банк",
      expiresAt,
    })
    .returning();

  res.json(
    CreateSbpPaymentResponse.parse({
      paymentId: payment.externalId!,
      qrUrl: payment.qrUrl!,
      amount: parseFloat(payment.amount),
      bankName: payment.bankName!,
      expiresAt: payment.expiresAt,
    })
  );

  req.log.info({ paymentId, userId: req.userId, planId: plan.id }, "SBP payment created");
});

router.get("/payments/status/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetPaymentStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [payment] = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.externalId, params.data.id));

  if (!payment) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }

  if (payment.status === "pending" && payment.expiresAt < new Date()) {
    await db
      .update(paymentsTable)
      .set({ status: "expired" })
      .where(eq(paymentsTable.id, payment.id));

    res.json(
      GetPaymentStatusResponse.parse({
        paymentId: payment.externalId!,
        status: "expired",
        method: payment.method,
      })
    );
    return;
  }

  if (payment.status === "paid" && payment.paidAt) {
    const plan = await db
      .select()
      .from(subscriptionPlansTable)
      .where(eq(subscriptionPlansTable.id, payment.planId));

    if (plan[0]) {
      const expiresAt = new Date(Date.now() + plan[0].durationDays * 24 * 60 * 60 * 1000);
      await db
        .insert(subscriptionsTable)
        .values({
          userId: payment.userId,
          planId: payment.planId,
          status: "active",
          startedAt: new Date(),
          expiresAt,
        })
        .onConflictDoNothing();
    }
  }

  res.json(
    GetPaymentStatusResponse.parse({
      paymentId: payment.externalId!,
      status: payment.status,
      method: payment.method,
    })
  );
});

export default router;
