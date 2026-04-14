import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, quizzesTable, chaptersTable, quizSectionsTable, questionsTable, quizChaptersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import {
  ListQuizzesQueryParams, ListQuizzesResponse,
  CreateQuizBody, ListQuizzesResponseItem,
  GetQuizParams, GetQuizResponse,
  CreateQuizSectionBody,
  CreateQuestionBody,
} from "@workspace/api-zod";
import { adminRoles, requireRoles } from "../lib/authz";

const router: IRouter = Router();

router.get("/quizzes", requireAuth, async (req, res): Promise<void> => {
  const params = ListQuizzesQueryParams.safeParse(req.query);

  const questionCountSubquery = db.select({
    quizId: quizSectionsTable.quizId,
    count: sql<number>`count(${questionsTable.id})`.as("count"),
  }).from(quizSectionsTable)
    .leftJoin(questionsTable, eq(questionsTable.sectionId, quizSectionsTable.id))
    .groupBy(quizSectionsTable.quizId)
    .as("qc");

  let query = db.select({
    id: quizzesTable.id,
    title: quizzesTable.title,
    chapterId: quizzesTable.chapterId,
    chapterTitle: chaptersTable.title,
    type: quizzesTable.type,
    startTime: quizzesTable.startTime,
    endTime: quizzesTable.endTime,
    totalQuestions: sql<number>`coalesce(${questionCountSubquery.count}, 0)`,
    createdAt: quizzesTable.createdAt,
  }).from(quizzesTable)
    .leftJoin(chaptersTable, eq(quizzesTable.chapterId, chaptersTable.id))
    .leftJoin(questionCountSubquery, eq(quizzesTable.id, questionCountSubquery.quizId));

  if (params.success && params.data.chapterId) {
    query = query.where(eq(quizzesTable.chapterId, params.data.chapterId)) as any;
  }

  const quizzes = await query;
  res.json(ListQuizzesResponse.parse(quizzes));
});

router.post("/quizzes", requireAuth, requireRoles([...adminRoles]), async (req, res): Promise<void> => {
  const parsed = CreateQuizBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const primaryChapterId = parsed.data.chapterId ?? parsed.data.chapterIds?.[0] ?? null;

  const [quiz] = await db.insert(quizzesTable).values({
    title: parsed.data.title,
    chapterId: primaryChapterId,
    type: parsed.data.type as any,
    startTime: parsed.data.startTime ? new Date(parsed.data.startTime) : null,
    endTime: parsed.data.endTime ? new Date(parsed.data.endTime) : null,
  }).returning();

  if (parsed.data.chapterIds && parsed.data.chapterIds.length > 0) {
    await db.insert(quizChaptersTable).values(
      parsed.data.chapterIds.map((cId) => ({
        quizId: quiz.id,
        chapterId: cId,
      }))
    );
  } else if (primaryChapterId) {
    await db.insert(quizChaptersTable).values({
      quizId: quiz.id,
      chapterId: primaryChapterId,
    });
  }

  const [chapter] = primaryChapterId 
    ? await db.select().from(chaptersTable).where(eq(chaptersTable.id, primaryChapterId))
    : [null];
    
  res.status(201).json(ListQuizzesResponseItem.parse({ ...quiz, chapterTitle: chapter?.title ?? "Multi-Chapter", totalQuestions: 0 }));
});

router.get("/quizzes/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetQuizParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, params.data.id));
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }

  const sections = await db.select().from(quizSectionsTable)
    .where(eq(quizSectionsTable.quizId, params.data.id))
    .orderBy(quizSectionsTable.orderIndex);

  const sectionsWithQuestions = await Promise.all(
    sections.map(async (section) => {
      const questions = await db.select().from(questionsTable)
        .where(eq(questionsTable.sectionId, section.id))
        .orderBy(questionsTable.orderIndex);
      return { ...section, questions };
    })
  );

  res.json(GetQuizResponse.parse({ ...quiz, sections: sectionsWithQuestions }));
});

router.post("/quiz-sections", requireAuth, requireRoles([...adminRoles]), async (req, res): Promise<void> => {
  const parsed = CreateQuizSectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [section] = await db.insert(quizSectionsTable).values(parsed.data).returning();
  res.status(201).json(section);
});

router.post("/questions", requireAuth, requireRoles([...adminRoles]), async (req, res): Promise<void> => {
  const parsed = CreateQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [question] = await db.insert(questionsTable).values({
    sectionId: parsed.data.sectionId,
    question: parsed.data.question,
    options: parsed.data.options,
    correctAnswer: parsed.data.correctAnswer,
    orderIndex: parsed.data.orderIndex,
  }).returning();
  res.status(201).json(question);
});

export default router;
