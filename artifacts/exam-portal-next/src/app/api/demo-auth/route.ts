import { setSessionCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Special route for AI verification and testing.
 * Logs in the requester as a Student Demo User.
 */
export async function GET() {
  // -5 is the reserved ID for STUDENT in src/lib/apiAuth.ts
  await setSessionCookie(-5);
  return NextResponse.redirect(new URL("/student/dashboard", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}
