import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, districtsTable, statesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { ListDistrictsQueryParams, ListDistrictsResponse, CreateDistrictBody, ListDistrictsResponseItem } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/districts", requireAuth, async (req, res): Promise<void> => {
  const params = ListDistrictsQueryParams.safeParse(req.query);

  let query = db.select({
    id: districtsTable.id,
    name: districtsTable.name,
    stateId: districtsTable.stateId,
    stateName: statesTable.name,
    createdAt: districtsTable.createdAt,
  }).from(districtsTable)
    .leftJoin(statesTable, eq(districtsTable.stateId, statesTable.id));

  if (params.success && params.data.stateId) {
    query = query.where(eq(districtsTable.stateId, params.data.stateId)) as any;
  }

  const districts = await query;
  res.json(ListDistrictsResponse.parse(districts));
});

router.post("/districts", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateDistrictBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [district] = await db.insert(districtsTable).values(parsed.data).returning();
  const [state] = await db.select().from(statesTable).where(eq(statesTable.id, district.stateId));
  res.status(201).json(ListDistrictsResponseItem.parse({ ...district, stateName: state?.name }));
});

export default router;
