import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, examAttemptsTable, examAnswersTable, questionsTable, quizSectionsTable, quizzesTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import {
  StartExamBody,
  SubmitExamBody, SubmitExamResponse,
  ListExamAttemptsQueryParams, ListExamAttemptsResponse,
} from "@workspace/api-zod";
import { requireCurrentUser } from "../lib/authz";

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
  const user = await requireCurrentUser(req, res);
  if (!user) return;

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

  if (attempt.userId !== user.id) {
    res.status(403).json({ error: "You cannot submit another student's attempt" });
    return;
  }

  if (attempt.status !== "IN_PROGRESS") {
    res.status(400).json({ error: "Exam already submitted" });
    return;
  }

  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, attempt.quizId));
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }

  if (quiz.type === "NATIONAL") {
    const now = new Date();
    if ((quiz.startTime && now < quiz.startTime) || (quiz.endTime && now > quiz.endTime)) {
      res.status(403).json({ error: "National test is outside the allowed time window" });
      return;
    }
  }

  const sections = await db.select().from(quizSectionsTable).where(eq(quizSectionsTable.quizId, attempt.quizId));
  const allowedSeconds = sections.reduce((sum, section) => sum + section.timeLimit, 0);
  const elapsedSeconds = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);
  const timedOut = allowedSeconds > 0 && elapsedSeconds > allowedSeconds + 15;

  const validQuestions = new Map<number, typeof questionsTable.$inferSelect>();
  for (const section of sections) {
    const questions = await db.select().from(questionsTable).where(eq(questionsTable.sectionId, section.id));
    questions.forEach((question) => validQuestions.set(question.id, question));
  }

  let correctCount = 0;
  const seenQuestions = new Set<number>();

  for (const answer of parsed.data.answers) {
    if (seenQuestions.has(answer.questionId)) continue;
    seenQuestions.add(answer.questionId);
    const question = validQuestions.get(answer.questionId);
    if (!question) continue;
    if (answer.selectedOption < 0 || answer.selectedOption >= question.options.length) continue;
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
      tabSwitches: parsed.data.tabSwitches || 0,
      status: timedOut ? "TIMED_OUT" : "SUBMITTED",
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
  const user = await requireCurrentUser(req, res);
  if (!user) return;
  const params = ListExamAttemptsQueryParams.safeParse(req.query);

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

router.get("/exams/attempts/:id", requireAuth, async (req, res): Promise<void> => {
  const user = await requireCurrentUser(req, res);
  if (!user) return;

  const attemptId = Number(req.params.id);
  const [attempt] = await db.select({
    id: examAttemptsTable.id,
    userId: examAttemptsTable.userId,
    quizId: examAttemptsTable.quizId,
    quizTitle: quizzesTable.title,
    startedAt: examAttemptsTable.startedAt,
    submittedAt: examAttemptsTable.submittedAt,
    score: examAttemptsTable.score,
    totalQuestions: examAttemptsTable.totalQuestions,
    correctAnswers: examAttemptsTable.correctAnswers,
    tabSwitches: examAttemptsTable.tabSwitches,
    status: examAttemptsTable.status,
  }).from(examAttemptsTable)
    .leftJoin(quizzesTable, eq(examAttemptsTable.quizId, quizzesTable.id))
    .where(eq(examAttemptsTable.id, attemptId));

  if (!attempt) {
    res.status(404).json({ error: "Attempt not found" });
    return;
  }

  if (attempt.userId !== user.id) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const answers = await db.select().from(examAnswersTable).where(eq(examAnswersTable.attemptId, attemptId));
  const detailedAnswers = await Promise.all(
    answers.map(async (a) => {
      const [q] = await db.select().from(questionsTable).where(eq(questionsTable.id, a.questionId));
      return { ...a, question: q };
    })
  );

  res.json({ ...attempt, answers: detailedAnswers });
});

export default router;
