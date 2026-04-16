import { Router } from "express";
import { db, paymentsTable, subscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateCryptoBotInvoiceBody, CreateSbpQrBody } from "@workspace/api-zod";
import { PLANS } from "./subscription";
import crypto from "crypto";

const router = Router();

function requireAuth(req: any, res: any): string | null {
  const licenseKey = req.headers["x-license-key"] as string | undefined;
  if (!licenseKey) {
    res.status(401).json({ error: "unauthorized", message: "Требуется авторизация" });
    return null;
  }
  return licenseKey.toUpperCase().trim();
}

function generateInvoiceId(): string {
  return "inv_" + crypto.randomBytes(8).toString("hex");
}

async function activateSubscription(licenseKey: string, planId: string): Promise<void> {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) return;

  const expiresAt = new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000);

  const existing = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.licenseKey, licenseKey))
    .limit(1);

  if (existing.length > 0) {
    const sub = existing[0];
    // If subscription is still active, extend from current expiry
    let baseDate = new Date();
    if (sub.status === "active" && sub.expiresAt && sub.expiresAt > baseDate) {
      baseDate = sub.expiresAt;
    }
    const newExpiry = new Date(baseDate.getTime() + plan.days * 24 * 60 * 60 * 1000);

    await db
      .update(subscriptionsTable)
      .set({
        plan: plan.id as any,
        status: "active",
        expiresAt: newExpiry,
      })
      .where(eq(subscriptionsTable.licenseKey, licenseKey));
  }
}

async function checkCryptoBotStatus(externalInvoiceId: string): Promise<"paid" | "pending" | "expired" | null> {
  const token = process.env.CRYPTO_BOT_TOKEN;
  if (!token) return null;

  try {
    const response = await fetch(
      `https://pay.crypt.bot/api/getInvoices?invoice_ids=${externalInvoiceId}`,
      {
        headers: { "Crypto-Pay-API-Token": token },
      }
    );
    const data = await response.json() as any;

    if (!data.ok || !data.result?.items?.length) return null;

    const invoice = data.result.items[0];
    if (invoice.status === "paid") return "paid";
    if (invoice.status === "expired") return "expired";
    return "pending";
  } catch {
    return null;
  }
}

router.post("/payments/cryptobot/invoice", async (req, res) => {
  const licenseKey = requireAuth(req, res);
  if (!licenseKey) return;

  const parsed = CreateCryptoBotInvoiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid request body" });
    return;
  }

  const { planId } = parsed.data;
  const plan = PLANS.find((p) => p.id === planId);

  if (!plan) {
    res.status(404).json({ error: "not_found", message: "Тариф не найден" });
    return;
  }

  const invoiceId = generateInvoiceId();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  const cryptoBotToken = process.env.CRYPTO_BOT_TOKEN;
  let payUrl = `https://t.me/CryptoBot?start=${invoiceId}`;
  let externalInvoiceId: string | null = null;

  if (cryptoBotToken) {
    try {
      const response = await fetch("https://pay.crypt.bot/api/createInvoice", {
        method: "POST",
        headers: {
          "Crypto-Pay-API-Token": cryptoBotToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          asset: "USDT",
          amount: plan.priceUsdt.toFixed(2),
          description: `FTP VPN — ${plan.name} (${plan.days} дней)`,
          payload: invoiceId,
          expires_in: 1800,
        }),
      });
      const data = await response.json() as any;
      if (data.ok && data.result?.pay_url) {
        payUrl = data.result.pay_url;
        externalInvoiceId = String(data.result.invoice_id);
      }
    } catch {
      // fallback to demo URL
    }
  }

  await db.insert(paymentsTable).values({
    invoiceId,
    externalInvoiceId,
    licenseKey,
    planId,
    method: "cryptobot",
    amount: plan.priceUsdt.toFixed(2),
    currency: "USDT",
    status: "pending",
    expiresAt,
  });

  res.json({
    invoiceId,
    payUrl,
    amount: plan.priceUsdt,
    currency: "USDT",
    expiresAt: expiresAt.toISOString(),
  });
});

router.post("/payments/sbp/qr", async (req, res) => {
  const licenseKey = requireAuth(req, res);
  if (!licenseKey) return;

  const parsed = CreateSbpQrBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid request body" });
    return;
  }

  const { planId } = parsed.data;
  const plan = PLANS.find((p) => p.id === planId);

  if (!plan) {
    res.status(404).json({ error: "not_found", message: "Тариф не найден" });
    return;
  }

  const invoiceId = generateInvoiceId();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  const sbpPhone = process.env.SBP_PHONE || "+7 (900) 000-00-00";
  const sbpBank = process.env.SBP_BANK || "Тинькофф";

  const qrData = `https://qr.nspk.ru/AD10004${Math.floor(Math.random() * 900000 + 100000)}?type=02&bank=${encodeURIComponent(sbpBank)}&sum=${plan.price * 100}&cur=RUB&crc=`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

  await db.insert(paymentsTable).values({
    invoiceId,
    externalInvoiceId: null,
    licenseKey,
    planId,
    method: "sbp",
    amount: plan.price.toFixed(2),
    currency: "RUB",
    status: "pending",
    expiresAt,
  });

  res.json({
    invoiceId,
    qrCode: qrCodeUrl,
    amount: plan.price,
    expiresAt: expiresAt.toISOString(),
    phone: sbpPhone,
    bank: sbpBank,
  });
});

router.get("/payments/status/:invoiceId", async (req, res) => {
  const { invoiceId } = req.params;

  const payment = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.invoiceId, invoiceId))
    .limit(1);

  if (payment.length === 0) {
    res.status(404).json({ error: "not_found", message: "Инвойс не найден" });
    return;
  }

  const p = payment[0];

  // Already finalised — return immediately
  if (p.status === "paid" || p.status === "failed") {
    res.json({ invoiceId: p.invoiceId, status: p.status, paidAt: p.paidAt?.toISOString() ?? null });
    return;
  }

  // Check expiry first
  if (p.status === "pending" && new Date() > p.expiresAt) {
    await db.update(paymentsTable).set({ status: "expired" }).where(eq(paymentsTable.invoiceId, invoiceId));
    res.json({ invoiceId, status: "expired", paidAt: null });
    return;
  }

  // For CryptoBot invoices, check the real payment status from their API
  if (p.method === "cryptobot" && p.externalInvoiceId) {
    const cbStatus = await checkCryptoBotStatus(p.externalInvoiceId);

    if (cbStatus === "paid") {
      const paidAt = new Date();
      await db.update(paymentsTable)
        .set({ status: "paid", paidAt })
        .where(eq(paymentsTable.invoiceId, invoiceId));

      // Activate the subscription
      await activateSubscription(p.licenseKey, p.planId);

      res.json({ invoiceId, status: "paid", paidAt: paidAt.toISOString() });
      return;
    }

    if (cbStatus === "expired") {
      await db.update(paymentsTable).set({ status: "expired" }).where(eq(paymentsTable.invoiceId, invoiceId));
      res.json({ invoiceId, status: "expired", paidAt: null });
      return;
    }
  }

  res.json({
    invoiceId: p.invoiceId,
    status: p.status,
    paidAt: p.paidAt?.toISOString() ?? null,
  });
});

export default router;
