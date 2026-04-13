import { Router, type IRouter } from "express";
import { db, statesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { ListStatesResponse, CreateStateBody, ListStatesResponseItem } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/states", requireAuth, async (_req, res): Promise<void> => {
  const states = await db.select().from(statesTable).orderBy(statesTable.name);
  res.json(ListStatesResponse.parse(states));
});

router.post("/states", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateStateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [state] = await db.insert(statesTable).values(parsed.data).returning();
  res.status(201).json(ListStatesResponseItem.parse(state));
});

export default router;
