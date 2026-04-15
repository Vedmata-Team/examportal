import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db, quizzesTable, chaptersTable, quizChaptersTable } from "@/lib/db";
import { getSessionUser, unauthorized, forbidden } from "@/lib/apiAuth";
import { z } from "zod";

const CreateQuizBody = z.object({
  title: z.string().min(1),
  chapterIds: z.array(z.number()).default([]),
  type: z.enum(["CHAPTER", "MOCK", "NATIONAL"]).default("CHAPTER"),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const quizzes = await db.select({
    id: quizzesTable.id,
    title: quizzesTable.title,
    chapterId: quizzesTable.chapterId,
    chapterTitle: chaptersTable.title,
    type: quizzesTable.type,
    startTime: quizzesTable.startTime,
    endTime: quizzesTable.endTime,
    createdAt: quizzesTable.createdAt,
    totalQuestions: sql<number>`0`,
  }).from(quizzesTable)
    .leftJoin(chaptersTable, eq(quizzesTable.chapterId, chaptersTable.id));

  return NextResponse.json(quizzes);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (!["CENTRAL", "STATE", "DISTRICT", "INSTITUTION"].includes(user.role)) return forbidden();

  const body = await req.json();
  const parsed = CreateQuizBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const { chapterIds, startTime, endTime, ...quizData } = parsed.data;
  const primaryChapterId = chapterIds[0] ?? null;

  const [quiz] = await db.insert(quizzesTable).values({
    ...quizData,
    chapterId: primaryChapterId,
    startTime: startTime ? new Date(startTime) : null,
    endTime: endTime ? new Date(endTime) : null,
  }).returning();

  // Insert quiz-chapter associations
  if (chapterIds.length > 0) {
    await db.insert(quizChaptersTable).values(
      chapterIds.map((cId) => ({ quizId: quiz.id, chapterId: cId }))
    );
  }

  return NextResponse.json(quiz, { status: 201 });
}
