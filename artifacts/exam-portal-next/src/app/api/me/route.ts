import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";
import { GetMeResponse } from "@workspace/api-zod";

export async function GET() {
  const { userId: clerkUserId } = await auth();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("exam_session")?.value;
  const localUserId = verifySessionToken(sessionToken);

  let user;

  if (localUserId && localUserId < 0) {
    // --- DEMO MOCK INTERCEPT ---
    const demoRoles = ["CENTRAL", "STATE", "DISTRICT", "INSTITUTION", "STUDENT"];
    const roleIndex = Math.abs(localUserId) - 1;
    const role = demoRoles[roleIndex] || "STUDENT";
    
    user = {
      id: localUserId,
      clerkId: "mock-" + role,
      email: role.toLowerCase() + "@examportal.com",
      name: role + " Demo User",
      role: role,
      createdAt: new Date().toISOString(),
      stateId: null,
      districtId: null,
      institutionId: null,
      classId: null
    };
    // --- END DEMO MOCK INTERCEPT ---
  } else if (localUserId) {
    [user] = await db.select().from(usersTable).where(eq(usersTable.id, localUserId));
    if (!user) {
      return NextResponse.json({ error: "User profile not found" }, { status: 401 });
    }
  } else if (clerkUserId) {
    [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId));

    if (!user) {
      try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(clerkUserId);
        const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
        const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || email;

        const [newUser] = await db.insert(usersTable).values({
          clerkId: clerkUserId,
          name,
          email,
          role: "STUDENT",
        }).returning();
        user = newUser;
      } catch (e) {
        console.error("Failed to create user from Clerk:", e);
        return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 });
      }
    }
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  try {
    return NextResponse.json(GetMeResponse.parse(user));
  } catch (err) {
    console.error("Schema validation failed for user:", err);
    return NextResponse.json(user);
  }
}
