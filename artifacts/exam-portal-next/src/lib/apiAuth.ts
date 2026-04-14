import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";
import type { User } from "@workspace/db/schema";

const DEMO_ROLES = ["CENTRAL", "STATE", "DISTRICT", "INSTITUTION", "STUDENT"];

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("exam_session")?.value;
  const userId = verifySessionToken(token);
  if (!userId) return null;

  // Demo mock users have negative IDs
  if (userId < 0) {
    const roleIndex = Math.abs(userId) - 1;
    const role = DEMO_ROLES[roleIndex] ?? "STUDENT";
    return {
      id: userId,
      clerkId: "mock-" + role,
      email: role.toLowerCase() + "@examportal.com",
      name: role + " Demo User",
      role: role as any,
      passwordHash: null,
      stateId: null,
      districtId: null,
      institutionId: null,
      classId: null,
      createdAt: new Date(),
    };
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  return user ?? null;
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return Response.json({ error: "Forbidden" }, { status: 403 });
}
