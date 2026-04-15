import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, contentTable, readingProgressTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { CreateContentBody, UpdateContentParams, UpdateContentBody, UpdateContentResponse } from "@workspace/api-zod";
import { adminRoles, requireCurrentUser, requireRoles } from "../lib/authz";

const router: IRouter = Router();

function parseContentId(body: unknown): number | null {
  if (!body || typeof body !== "object") return null;
  const value = (body as { contentId?: unknown }).contentId;
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null;
}

router.post("/content", requireAuth, requireRoles([...adminRoles]), async (req, res): Promise<void> => {
  const parsed = CreateContentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [content] = await db.insert(contentTable).values(parsed.data).returning();
  res.status(201).json(content);
});

router.patch("/content/:id", requireAuth, requireRoles([...adminRoles]), async (req, res): Promise<void> => {
  const params = UpdateContentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateContentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [content] = await db.update(contentTable)
    .set(parsed.data as any)
    .where(eq(contentTable.id, params.data.id))
    .returning();

  if (!content) {
    res.status(404).json({ error: "Content not found" });
    return;
  }

  res.json(UpdateContentResponse.parse(content));
});

router.post("/content/start-reading", requireAuth, async (req, res): Promise<void> => {
  const user = await requireCurrentUser(req, res);
  if (!user) return;

  const contentId = parseContentId(req.body);
  if (!contentId) {
    res.status(400).json({ error: "contentId must be a positive integer" });
    return;
  }

  const [content] = await db.select().from(contentTable).where(eq(contentTable.id, contentId));
  if (!content) {
    res.status(404).json({ error: "Content not found" });
    return;
  }

  const [progress] = await db.insert(readingProgressTable).values({
    userId: user.id,
    contentId: content.id,
    completedAt: null,
    elapsedSeconds: 0,
  }).onConflictDoUpdate({
    target: [readingProgressTable.userId, readingProgressTable.contentId],
    set: {
      startedAt: new Date(),
      completedAt: null,
      elapsedSeconds: 0,
    },
  }).returning();

  res.status(201).json({
    id: progress.id,
    contentId: content.id,
    startedAt: progress.startedAt.toISOString(),
    minReadTime: content.minReadTime,
  });
});

router.post("/content/complete-reading", requireAuth, async (req, res): Promise<void> => {
  const user = await requireCurrentUser(req, res);
  if (!user) return;

  const contentId = parseContentId(req.body);
  if (!contentId) {
    res.status(400).json({ error: "contentId must be a positive integer" });
    return;
  }

  const [content] = await db.select().from(contentTable).where(eq(contentTable.id, contentId));
  if (!content) {
    res.status(404).json({ error: "Content not found" });
    return;
  }

  const [progress] = await db.select().from(readingProgressTable)
    .where(and(eq(readingProgressTable.contentId, content.id), eq(readingProgressTable.userId, user.id)));
  if (!progress) {
    res.status(400).json({ error: "Reading timer was not started" });
    return;
  }

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - progress.startedAt.getTime()) / 1000));
  if (elapsedSeconds < content.minReadTime) {
    res.status(409).json({
      canProceed: false,
      elapsedSeconds,
      requiredSeconds: content.minReadTime,
      remainingSeconds: content.minReadTime - elapsedSeconds,
    });
    return;
  }

  const [updated] = await db.update(readingProgressTable)
    .set({ completedAt: new Date(), elapsedSeconds })
    .where(eq(readingProgressTable.id, progress.id))
    .returning();

  res.json({
    canProceed: true,
    contentId: content.id,
    elapsedSeconds: updated.elapsedSeconds,
    requiredSeconds: content.minReadTime,
  });
});

export default router;
