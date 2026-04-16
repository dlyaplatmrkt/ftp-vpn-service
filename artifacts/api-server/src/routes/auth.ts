import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, sessionsTable } from "@workspace/db";
import { LoginWithKeyBody, LoginWithKeyResponse, GetMeResponse } from "@workspace/api-zod";
import { generateAccessKey, generateSessionToken } from "../lib/keygen";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginWithKeyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { accessKey } = parsed.data;

  let [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.accessKey, accessKey));

  if (!user) {
    res.status(401).json({ error: "Invalid access key" });
    return;
  }

  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db.insert(sessionsTable).values({
    userId: user.id,
    token,
    expiresAt,
  });

  res.json(
    LoginWithKeyResponse.parse({
      success: true,
      user: {
        id: user.id,
        accessKey: user.accessKey,
        createdAt: user.createdAt,
        lastSeenAt: user.lastSeenAt,
      },
    })
  );

  req.log.info({ userId: user.id }, "User logged in");
});

router.post("/auth/logout", requireAuth, async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.slice(7);
    await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
  }
  res.json({ success: true });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.userId!));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(
    GetMeResponse.parse({
      id: user.id,
      accessKey: user.accessKey,
      createdAt: user.createdAt,
      lastSeenAt: user.lastSeenAt,
    })
  );
});

export default router;
