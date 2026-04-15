import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db, usersTable } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { GetMeResponse } from "@workspace/api-zod";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password || password.length < 8) {
      return NextResponse.json({ error: "Name, email, and password (at least 8 chars) are required" }, { status: 400 });
    }

    const emailLow = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await db.query.usersTable.findFirst({
      where: (u, { eq }) => eq(u.email, emailLow),
    });

    if (existing) {
      return NextResponse.json({ error: "An account already exists with this email" }, { status: 409 });
    }

    // Check if it's the first user
    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
    const isFirstUser = Number(countResult.count) === 0;

    const [user] = await db.insert(usersTable).values({
      name,
      email: emailLow,
      clerkId: `local:${emailLow}`,
      passwordHash: hashPassword(password),
      role: isFirstUser ? "CENTRAL" : "STUDENT",
    }).returning();

    await setSessionCookie(user.id);

    return NextResponse.json(GetMeResponse.parse(user));
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json({ error: err.message || "Registration failed" }, { status: 500 });
  }
}
