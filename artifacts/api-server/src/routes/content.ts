import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, contentTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { CreateContentBody, UpdateContentParams, UpdateContentBody, UpdateContentResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/content", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateContentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [content] = await db.insert(contentTable).values(parsed.data).returning();
  res.status(201).json(content);
});

router.patch("/content/:id", requireAuth, async (req, res): Promise<void> => {
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

export default router;
