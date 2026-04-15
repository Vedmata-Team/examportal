import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { clearSessionCookie, hashPassword, setSessionCookie, verifyPassword } from "../lib/localAuth";
import { GetMeResponse } from "@workspace/api-zod";

const router: IRouter = Router();

function readString(body: unknown, key: string): string {
  const value = body && typeof body === "object" ? (body as Record<string, unknown>)[key] : undefined;
  return typeof value === "string" ? value.trim() : "";
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const name = readString(req.body, "name");
  const email = readString(req.body, "email").toLowerCase();
  const password = readString(req.body, "password");

  if (!name || !email || password.length < 8) {
    res.status(400).json({ error: "Name, valid email, and password with at least 8 characters are required" });
    return;
  }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(409).json({ error: "An account already exists for this email" });
    return;
  }

  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
  const firstUser = Number(countResult.count) === 0;

  const [user] = await db.insert(usersTable).values({
    clerkId: `local:${email}`,
    name,
    email,
    passwordHash: hashPassword(password),
    role: firstUser ? "CENTRAL" : "STUDENT",
  }).returning();

  setSessionCookie(res, user.id);
  res.status(201).json(GetMeResponse.parse(user));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const email = readString(req.body, "email").toLowerCase();
  const password = readString(req.body, "password");

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  setSessionCookie(res, user.id);
  res.json(GetMeResponse.parse(user));
});

router.post("/auth/logout", (_req, res): void => {
  clearSessionCookie(res);
  res.status(204).send();
});

export default router;