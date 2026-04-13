import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, chaptersTable, classesTable, contentTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { ListChaptersQueryParams, ListChaptersResponse, CreateChapterBody, ListChaptersResponseItem, GetChapterParams, GetChapterResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/chapters", requireAuth, async (req, res): Promise<void> => {
  const params = ListChaptersQueryParams.safeParse(req.query);

  let query = db.select({
    id: chaptersTable.id,
    title: chaptersTable.title,
    classId: chaptersTable.classId,
    className: classesTable.name,
    orderIndex: chaptersTable.orderIndex,
    createdAt: chaptersTable.createdAt,
  }).from(chaptersTable)
    .leftJoin(classesTable, eq(chaptersTable.classId, classesTable.id))
    .orderBy(chaptersTable.orderIndex);

  if (params.success && params.data.classId) {
    query = query.where(eq(chaptersTable.classId, params.data.classId)) as any;
  }

  const chapters = await query;
  res.json(ListChaptersResponse.parse(chapters));
});

router.post("/chapters", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateChapterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [chapter] = await db.insert(chaptersTable).values(parsed.data).returning();
  const [cls] = await db.select().from(classesTable).where(eq(classesTable.id, chapter.classId));
  res.status(201).json(ListChaptersResponseItem.parse({ ...chapter, className: cls?.name }));
});

router.get("/chapters/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetChapterParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [chapter] = await db.select({
    id: chaptersTable.id,
    title: chaptersTable.title,
    classId: chaptersTable.classId,
    className: classesTable.name,
    orderIndex: chaptersTable.orderIndex,
  }).from(chaptersTable)
    .leftJoin(classesTable, eq(chaptersTable.classId, classesTable.id))
    .where(eq(chaptersTable.id, params.data.id));

  if (!chapter) {
    res.status(404).json({ error: "Chapter not found" });
    return;
  }

  const chapterContent = await db.select().from(contentTable)
    .where(eq(contentTable.chapterId, params.data.id))
    .orderBy(contentTable.orderIndex);

  res.json(GetChapterResponse.parse({ ...chapter, content: chapterContent }));
});

export default router;
