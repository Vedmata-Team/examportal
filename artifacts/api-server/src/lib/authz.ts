import { eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";
import { db, usersTable, type User } from "@workspace/db";

export const adminRoles = ["CENTRAL", "STATE", "DISTRICT", "INSTITUTION"] as const;
export type AdminRole = typeof adminRoles[number];
export type UserRole = AdminRole | "STUDENT";

export async function getCurrentUser(req: Request): Promise<User | null> {
  const clerkUserId = (req as any).clerkUserId;
  if (!clerkUserId) return null;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId));
  return user ?? null;
}

export async function requireCurrentUser(req: Request, res: Response): Promise<User | null> {
  const user = await getCurrentUser(req);
  if (!user) {
    res.status(401).json({ error: "User profile not found" });
    return null;
  }
  return user;
}

export function requireRoles(roles: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await requireCurrentUser(req, res);
    if (!user) return;
    if (!roles.includes(user.role as UserRole)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    (req as any).currentUser = user;
    next();
  };
}

export function canCreateRole(actor: User, targetRole: UserRole): boolean {
  if (actor.role === "CENTRAL") return targetRole !== "CENTRAL";
  if (actor.role === "STATE") return targetRole === "DISTRICT" || targetRole === "INSTITUTION" || targetRole === "STUDENT";
  if (actor.role === "DISTRICT") return targetRole === "INSTITUTION" || targetRole === "STUDENT";
  if (actor.role === "INSTITUTION") return targetRole === "STUDENT";
  return false;
}

export function isAdminRole(role: string | null | undefined): boolean {
  return !!role && (adminRoles as readonly string[]).includes(role);
}