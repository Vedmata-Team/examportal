import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, institutionsTable, districtsTable, statesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { ListInstitutionsQueryParams, ListInstitutionsResponse, CreateInstitutionBody, ListInstitutionsResponseItem } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/institutions", requireAuth, async (req, res): Promise<void> => {
  const params = ListInstitutionsQueryParams.safeParse(req.query);

  let query = db.select({
    id: institutionsTable.id,
    name: institutionsTable.name,
    districtId: institutionsTable.districtId,
    districtName: districtsTable.name,
    stateName: statesTable.name,
    createdAt: institutionsTable.createdAt,
  }).from(institutionsTable)
    .leftJoin(districtsTable, eq(institutionsTable.districtId, districtsTable.id))
    .leftJoin(statesTable, eq(districtsTable.stateId, statesTable.id));

  if (params.success && params.data.districtId) {
    query = query.where(eq(institutionsTable.districtId, params.data.districtId)) as any;
  }

  const institutions = await query;
  res.json(ListInstitutionsResponse.parse(institutions));
});

router.post("/institutions", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateInstitutionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [inst] = await db.insert(institutionsTable).values(parsed.data).returning();
  const [district] = await db.select().from(districtsTable).where(eq(districtsTable.id, inst.districtId));
  let stateName = null;
  if (district) {
    const [state] = await db.select().from(statesTable).where(eq(statesTable.id, district.stateId));
    stateName = state?.name;
  }
  res.status(201).json(ListInstitutionsResponseItem.parse({ ...inst, districtName: district?.name, stateName }));
});

export default router;
