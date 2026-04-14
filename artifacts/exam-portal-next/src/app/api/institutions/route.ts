import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, institutionsTable, districtsTable, statesTable } from "@/lib/db";
import { getSessionUser, unauthorized, forbidden } from "@/lib/apiAuth";
import { z } from "zod";

const CreateInstitutionBody = z.object({ name: z.string().min(1), districtId: z.number() });

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const districtIdParam = searchParams.get("districtId");

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

  if (user.role === "DISTRICT" && user.districtId) {
    query = query.where(eq(institutionsTable.districtId, user.districtId)) as any;
  } else if (districtIdParam) {
    query = query.where(eq(institutionsTable.districtId, Number(districtIdParam))) as any;
  }

  return NextResponse.json(await query);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (!["CENTRAL", "DISTRICT"].includes(user.role)) return forbidden();

  const body = await req.json();
  const parsed = CreateInstitutionBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  if (user.role === "DISTRICT" && user.districtId !== parsed.data.districtId) return forbidden();

  const [inst] = await db.insert(institutionsTable).values(parsed.data).returning();
  const [district] = await db.select().from(districtsTable).where(eq(districtsTable.id, inst.districtId));
  const [state] = district ? await db.select().from(statesTable).where(eq(statesTable.id, district.stateId)) : [null];
  return NextResponse.json({ ...inst, districtName: district?.name ?? null, stateName: state?.name ?? null }, { status: 201 });
}
