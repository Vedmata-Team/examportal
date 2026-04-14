import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { getSessionCookieName, verifySessionToken } from "../lib/localAuth";

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  const cookies = header.split(";").map((cookie) => cookie.trim());
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const localUserId = verifySessionToken(readCookie(req, getSessionCookieName()));
  if (localUserId) {
    (req as any).localUserId = localUserId;
    next();
    return;
  }

  let userId: string | null | undefined;
  if (process.env.CLERK_SECRET_KEY && process.env.VITE_CLERK_PUBLISHABLE_KEY) {
    const auth = getAuth(req);
    userId = auth?.sessionClaims?.userId || auth?.userId;
  }
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as any).clerkUserId = userId;
  next();
};
