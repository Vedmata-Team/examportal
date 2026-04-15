import { Router, type IRouter } from "express";
import { db, classesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { ListClassesResponse, CreateClassBody, ListClassesResponseItem } from "@workspace/api-zod";
import { adminRoles, requireRoles } from "../lib/authz";

const router: IRouter = Router();

router.get("/classes", requireAuth, async (_req, res): Promise<void> => {
  const classes = await db.select().from(classesTable).orderBy(classesTable.name);
  res.json(ListClassesResponse.parse(classes));
});

router.post("/classes", requireAuth, requireRoles([...adminRoles]), async (req, res): Promise<void> => {
  const parsed = CreateClassBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [cls] = await db.insert(classesTable).values(parsed.data).returning();
  res.status(201).json(ListClassesResponseItem.parse(cls));
});

export default router;
