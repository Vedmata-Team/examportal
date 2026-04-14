import { NextResponse } from "next/server";
import { eq, sql, desc } from "drizzle-orm";
import { db, examAttemptsTable, quizzesTable } from "@/lib/db";
import { getSessionUser, unauthorized } from "@/lib/apiAuth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const [[totalRow], [avgRow], [completedRow], [availableRow], recentScores] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(examAttemptsTable).where(eq(examAttemptsTable.userId, user.id)),
      db.select({ avg: sql<number>`coalesce(avg(case when total_questions > 0 then score * 100.0 / total_questions else 0 end), 0)` })
        .from(examAttemptsTable).where(eq(examAttemptsTable.userId, user.id)),
      db.select({ count: sql<number>`count(*)` }).from(examAttemptsTable)
        .where(sql`user_id = ${user.id} and status = 'SUBMITTED'`),
      db.select({ count: sql<number>`count(*)` }).from(quizzesTable),
      db.select({
        quizTitle: quizzesTable.title,
        score: examAttemptsTable.score,
        totalQuestions: examAttemptsTable.totalQuestions,
        submittedAt: examAttemptsTable.submittedAt,
      }).from(examAttemptsTable)
        .leftJoin(quizzesTable, eq(examAttemptsTable.quizId, quizzesTable.id))
        .where(sql`exam_attempts.user_id = ${user.id} and exam_attempts.status = 'SUBMITTED'`)
        .orderBy(desc(examAttemptsTable.submittedAt))
        .limit(5),
    ]);

    return NextResponse.json({
      totalAttempts: Number(totalRow.count),
      averageScore: Number(avgRow.avg) || 0,
      completedQuizzes: Number(completedRow.count),
      availableQuizzes: Number(availableRow.count),
      recentScores: recentScores.map(s => ({
        quizTitle: s.quizTitle ?? "Unknown",
        percentage: s.totalQuestions > 0 ? ((s.score ?? 0) / s.totalQuestions) * 100 : 0,
        submittedAt: s.submittedAt?.toISOString() ?? new Date().toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({
      totalAttempts: 0, averageScore: 0, completedQuizzes: 0,
      availableQuizzes: 0, recentScores: [],
    });
  }
}
