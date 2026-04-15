import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, districtsTable, statesTable } from "@/lib/db";
import { getSessionUser, unauthorized, forbidden } from "@/lib/apiAuth";
import { z } from "zod";

const CreateDistrictBody = z.object({ name: z.string().min(1), stateId: z.number() });

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const stateIdParam = searchParams.get("stateId");

  let query = db.select({
    id: districtsTable.id,
    name: districtsTable.name,
    stateId: districtsTable.stateId,
    stateName: statesTable.name,
    createdAt: districtsTable.createdAt,
  }).from(districtsTable).leftJoin(statesTable, eq(districtsTable.stateId, statesTable.id));

  if (user.role === "STATE" && user.stateId) {
    query = query.where(eq(districtsTable.stateId, user.stateId)) as any;
  } else if (stateIdParam) {
    query = query.where(eq(districtsTable.stateId, Number(stateIdParam))) as any;
  }

  return NextResponse.json(await query);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (!["CENTRAL", "STATE"].includes(user.role)) return forbidden();

  const body = await req.json();
  const parsed = CreateDistrictBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  if (user.role === "STATE" && user.stateId !== parsed.data.stateId) return forbidden();

  const [district] = await db.insert(districtsTable).values(parsed.data).returning();
  const [state] = await db.select().from(statesTable).where(eq(statesTable.id, district.stateId));
  return NextResponse.json({ ...district, stateName: state?.name ?? null }, { status: 201 });
}
