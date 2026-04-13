import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, examAttemptsTable, examAnswersTable, questionsTable, quizSectionsTable, quizzesTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import {
  StartExamBody,
  SubmitExamBody, SubmitExamResponse,
  ListExamAttemptsQueryParams, ListExamAttemptsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/exams/start", requireAuth, async (req, res): Promise<void> => {
  const clerkUserId = (req as any).clerkUserId;
  const parsed = StartExamBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, parsed.data.quizId));
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }

  if (quiz.type === "NATIONAL") {
    const now = new Date();
    if (quiz.startTime && now < quiz.startTime) {
      res.status(400).json({ error: "Exam has not started yet" });
      return;
    }
    if (quiz.endTime && now > quiz.endTime) {
      res.status(400).json({ error: "Exam has ended" });
      return;
    }
  }

  const sections = await db.select().from(quizSectionsTable).where(eq(quizSectionsTable.quizId, parsed.data.quizId));
  let totalQuestions = 0;
  for (const section of sections) {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(questionsTable).where(eq(questionsTable.sectionId, section.id));
    totalQuestions += Number(result.count);
  }

  const [attempt] = await db.insert(examAttemptsTable).values({
    userId: user.id,
    quizId: parsed.data.quizId,
    totalQuestions,
    status: "IN_PROGRESS",
  }).returning();

  res.status(201).json({
    ...attempt,
    quizTitle: quiz.title,
  });
});

router.post("/exams/submit", requireAuth, async (req, res): Promise<void> => {
  const parsed = SubmitExamBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [attempt] = await db.select().from(examAttemptsTable).where(eq(examAttemptsTable.id, parsed.data.attemptId));
  if (!attempt) {
    res.status(404).json({ error: "Attempt not found" });
    return;
  }

  if (attempt.status !== "IN_PROGRESS") {
    res.status(400).json({ error: "Exam already submitted" });
    return;
  }

  let correctCount = 0;

  for (const answer of parsed.data.answers) {
    const [question] = await db.select().from(questionsTable).where(eq(questionsTable.id, answer.questionId));
    if (!question) continue;

    const isCorrect = question.correctAnswer === answer.selectedOption;
    if (isCorrect) correctCount++;

    await db.insert(examAnswersTable).values({
      attemptId: parsed.data.attemptId,
      questionId: answer.questionId,
      selectedOption: answer.selectedOption,
      isCorrect,
    });
  }

  const totalQuestions = attempt.totalQuestions;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  await db.update(examAttemptsTable)
    .set({
      submittedAt: new Date(),
      score,
      correctAnswers: correctCount,
      status: "SUBMITTED",
    })
    .where(eq(examAttemptsTable.id, parsed.data.attemptId));

  res.json(SubmitExamResponse.parse({
    attemptId: parsed.data.attemptId,
    score,
    totalQuestions,
    correctAnswers: correctCount,
    percentage: totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0,
  }));
});

router.get("/exams/attempts", requireAuth, async (req, res): Promise<void> => {
  const clerkUserId = (req as any).clerkUserId;
  const params = ListExamAttemptsQueryParams.safeParse(req.query);

  const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId));
  if (!user) {
    res.json([]);
    return;
  }

  const conditions = [eq(examAttemptsTable.userId, user.id)];
  if (params.success && params.data.quizId) {
    conditions.push(eq(examAttemptsTable.quizId, params.data.quizId));
  }

  const attempts = await db.select({
    id: examAttemptsTable.id,
    userId: examAttemptsTable.userId,
    quizId: examAttemptsTable.quizId,
    quizTitle: quizzesTable.title,
    startedAt: examAttemptsTable.startedAt,
    submittedAt: examAttemptsTable.submittedAt,
    score: examAttemptsTable.score,
    totalQuestions: examAttemptsTable.totalQuestions,
    correctAnswers: examAttemptsTable.correctAnswers,
    status: examAttemptsTable.status,
  }).from(examAttemptsTable)
    .leftJoin(quizzesTable, eq(examAttemptsTable.quizId, quizzesTable.id))
    .where(and(...conditions))
    .orderBy(examAttemptsTable.startedAt);

  res.json(ListExamAttemptsResponse.parse(attempts));
});

export default router;
