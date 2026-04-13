import { Router, type IRouter } from "express";
import { eq, sql, desc } from "drizzle-orm";
import { db, usersTable, institutionsTable, quizzesTable, statesTable, districtsTable, chaptersTable, examAttemptsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { GetAdminDashboardResponse, GetStudentDashboardResponse, GetRecentActivityResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/admin", requireAuth, async (_req, res): Promise<void> => {
  const [students] = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.role, "STUDENT"));
  const [institutions] = await db.select({ count: sql<number>`count(*)` }).from(institutionsTable);
  const [quizzes] = await db.select({ count: sql<number>`count(*)` }).from(quizzesTable);
  const [states] = await db.select({ count: sql<number>`count(*)` }).from(statesTable);
  const [districts] = await db.select({ count: sql<number>`count(*)` }).from(districtsTable);
  const [chapters] = await db.select({ count: sql<number>`count(*)` }).from(chaptersTable);
  const [attempts] = await db.select({ count: sql<number>`count(*)` }).from(examAttemptsTable).where(eq(examAttemptsTable.status, "SUBMITTED"));
  const [avgScore] = await db.select({ avg: sql<number>`coalesce(avg(${examAttemptsTable.score}), 0)` }).from(examAttemptsTable).where(eq(examAttemptsTable.status, "SUBMITTED"));

  res.json(GetAdminDashboardResponse.parse({
    totalStudents: Number(students.count),
    totalInstitutions: Number(institutions.count),
    totalQuizzes: Number(quizzes.count),
    totalStates: Number(states.count),
    totalDistricts: Number(districts.count),
    totalChapters: Number(chapters.count),
    recentAttempts: Number(attempts.count),
    averageScore: Number(avgScore.avg),
  }));
});

router.get("/dashboard/student", requireAuth, async (req, res): Promise<void> => {
  const clerkUserId = (req as any).clerkUserId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId));

  if (!user) {
    res.json(GetStudentDashboardResponse.parse({
      totalAttempts: 0,
      averageScore: 0,
      completedQuizzes: 0,
      availableQuizzes: 0,
      recentScores: [],
    }));
    return;
  }

  const [totalAttempts] = await db.select({ count: sql<number>`count(*)` }).from(examAttemptsTable).where(eq(examAttemptsTable.userId, user.id));
  const [completed] = await db.select({ count: sql<number>`count(*)` }).from(examAttemptsTable).where(
    sql`${examAttemptsTable.userId} = ${user.id} AND ${examAttemptsTable.status} = 'SUBMITTED'`
  );
  const [avg] = await db.select({ avg: sql<number>`coalesce(avg(${examAttemptsTable.score}), 0)` }).from(examAttemptsTable).where(
    sql`${examAttemptsTable.userId} = ${user.id} AND ${examAttemptsTable.status} = 'SUBMITTED'`
  );
  const [available] = await db.select({ count: sql<number>`count(*)` }).from(quizzesTable);

  const recentAttempts = await db.select({
    quizTitle: quizzesTable.title,
    score: examAttemptsTable.score,
    totalQuestions: examAttemptsTable.totalQuestions,
    correctAnswers: examAttemptsTable.correctAnswers,
    submittedAt: examAttemptsTable.submittedAt,
  }).from(examAttemptsTable)
    .leftJoin(quizzesTable, eq(examAttemptsTable.quizId, quizzesTable.id))
    .where(sql`${examAttemptsTable.userId} = ${user.id} AND ${examAttemptsTable.status} = 'SUBMITTED'`)
    .orderBy(desc(examAttemptsTable.submittedAt))
    .limit(5);

  const recentScores = recentAttempts.map(a => ({
    quizTitle: a.quizTitle || "Unknown",
    score: a.score || 0,
    totalQuestions: a.totalQuestions,
    percentage: a.totalQuestions > 0 ? ((a.correctAnswers || 0) / a.totalQuestions) * 100 : 0,
    submittedAt: a.submittedAt?.toISOString() || new Date().toISOString(),
  }));

  res.json(GetStudentDashboardResponse.parse({
    totalAttempts: Number(totalAttempts.count),
    averageScore: Number(avg.avg),
    completedQuizzes: Number(completed.count),
    availableQuizzes: Number(available.count),
    recentScores,
  }));
});

router.get("/dashboard/recent-activity", requireAuth, async (_req, res): Promise<void> => {
  const recentAttempts = await db.select({
    id: examAttemptsTable.id,
    userName: usersTable.name,
    quizTitle: quizzesTable.title,
    status: examAttemptsTable.status,
    score: examAttemptsTable.score,
    submittedAt: examAttemptsTable.submittedAt,
    startedAt: examAttemptsTable.startedAt,
  }).from(examAttemptsTable)
    .leftJoin(usersTable, eq(examAttemptsTable.userId, usersTable.id))
    .leftJoin(quizzesTable, eq(examAttemptsTable.quizId, quizzesTable.id))
    .orderBy(desc(examAttemptsTable.startedAt))
    .limit(10);

  const activity = recentAttempts.map(a => ({
    id: a.id,
    type: a.status === "SUBMITTED" ? "exam_completed" : "exam_started",
    description: a.status === "SUBMITTED"
      ? `${a.userName} completed "${a.quizTitle}" with score ${a.score}%`
      : `${a.userName} started "${a.quizTitle}"`,
    userName: a.userName || "Unknown",
    timestamp: (a.submittedAt || a.startedAt).toISOString(),
  }));

  res.json(GetRecentActivityResponse.parse(activity));
});

export default router;
