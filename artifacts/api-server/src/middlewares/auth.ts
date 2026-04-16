import { type Request, type Response, type NextFunction } from "express";
import { eq, and, gt } from "drizzle-orm";
import { db, sessionsTable, usersTable } from "@workspace/db";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userAccessKey?: string;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  const now = new Date();

  const [session] = await db
    .select({
      userId: sessionsTable.userId,
      accessKey: usersTable.accessKey,
    })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(
      and(
        eq(sessionsTable.token, token),
        gt(sessionsTable.expiresAt, now)
      )
    );

  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.userId = session.userId;
  req.userAccessKey = session.accessKey;

  await db
    .update(usersTable)
    .set({ lastSeenAt: now })
    .where(eq(usersTable.id, session.userId));

  next();
}
