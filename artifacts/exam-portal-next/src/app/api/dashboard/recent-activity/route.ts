import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db, examAttemptsTable } from "@/lib/db";
import { getSessionUser, unauthorized, forbidden } from "@/lib/apiAuth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (!["CENTRAL", "STATE", "DISTRICT", "INSTITUTION"].includes(user.role)) return forbidden();

  try {
    const attempts = await db.select().from(examAttemptsTable)
      .orderBy(desc(examAttemptsTable.startedAt))
      .limit(10);

    const activity = attempts.map(a => ({
      id: a.id,
      description: `Exam attempt ${a.status === "SUBMITTED" ? "completed" : "started"} — Quiz #${a.quizId} by User #${a.userId}`,
      timestamp: (a.submittedAt ?? a.startedAt).toISOString(),
    }));

    return NextResponse.json(activity);
  } catch {
    return NextResponse.json([]);
  }
}
