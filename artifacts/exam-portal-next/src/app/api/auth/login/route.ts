import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@/lib/db";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { GetMeResponse } from "@workspace/api-zod";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // --- DEMO MOCK INTERCEPT ---
    // Bypass database for demo credentials to allow UI testing without actual Postgres
    const demoRoles: Record<string, string> = {
      "central@examportal.com": "CENTRAL",
      "state@examportal.com": "STATE",
      "district@examportal.com": "DISTRICT",
      "institution@examportal.com": "INSTITUTION",
      "student@examportal.com": "STUDENT"
    };

    if (password === "Password@123" && demoRoles[email.toLowerCase().trim()]) {
       const role = demoRoles[email.toLowerCase().trim()];
       const mockId = -Object.keys(demoRoles).indexOf(email.toLowerCase().trim()) - 1;
       
       await setSessionCookie(mockId);
       
       return NextResponse.json({
         id: mockId,
         clerkId: "mock-" + role,
         email: email.toLowerCase().trim(),
         name: role + " Demo User",
         role: role,
         createdAt: new Date().toISOString(),
         stateId: null,
         districtId: null,
         institutionId: null,
         classId: null
       });
    }
    // --- END DEMO MOCK INTERCEPT ---

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase().trim()));

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    await setSessionCookie(user.id);

    return NextResponse.json(GetMeResponse.parse(user));
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: err.message || "Authentication failed" }, { status: 500 });
  }
}
