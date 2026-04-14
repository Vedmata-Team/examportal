import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db, usersTable, institutionsTable, quizzesTable, statesTable, districtsTable, chaptersTable, examAttemptsTable } from "@/lib/db";
import { getSessionUser, unauthorized, forbidden } from "@/lib/apiAuth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (!["CENTRAL", "STATE", "DISTRICT", "INSTITUTION"].includes(user.role)) return forbidden();

  try {
    const [[students], [institutions], [quizzes], [states], [districts], [chapters], [attempts], [avgRow]] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(usersTable).where(sql`role = 'STUDENT'`),
      db.select({ count: sql<number>`count(*)` }).from(institutionsTable),
      db.select({ count: sql<number>`count(*)` }).from(quizzesTable),
      db.select({ count: sql<number>`count(*)` }).from(statesTable),
      db.select({ count: sql<number>`count(*)` }).from(districtsTable),
      db.select({ count: sql<number>`count(*)` }).from(chaptersTable),
      db.select({ count: sql<number>`count(*)` }).from(examAttemptsTable),
      db.select({ avg: sql<number>`coalesce(avg(case when total_questions > 0 then score * 100.0 / total_questions else 0 end), 0)` }).from(examAttemptsTable),
    ]);

    return NextResponse.json({
      totalStudents: Number(students.count),
      totalInstitutions: Number(institutions.count),
      totalQuizzes: Number(quizzes.count),
      totalStates: Number(states.count),
      totalDistricts: Number(districts.count),
      totalChapters: Number(chapters.count),
      recentAttempts: Number(attempts.count),
      averageScore: Number(avgRow.avg) || 0,
    });
  } catch {
    return NextResponse.json({
      totalStudents: 0, totalInstitutions: 0, totalQuizzes: 0,
      totalStates: 0, totalDistricts: 0, totalChapters: 0,
      recentAttempts: 0, averageScore: 0,
    });
  }
}
