import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { getSessionCookieName, verifySessionToken } from "../lib/localAuth";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const localUserId = verifySessionToken(req.cookies?.[getSessionCookieName()]);
  if (localUserId) {
    (req as any).localUserId = localUserId;
    next();
    return;
  }

  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as any).clerkUserId = userId;
  next();
};
