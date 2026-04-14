import { NextResponse } from "next/server";
import { db, statesTable } from "@/lib/db";
import { getSessionUser, unauthorized, forbidden } from "@/lib/apiAuth";
import { z } from "zod";

const CreateStateBody = z.object({ name: z.string().min(1), code: z.string().min(1) });

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const states = await db.select().from(statesTable).orderBy(statesTable.name);
  return NextResponse.json(states);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "CENTRAL") return forbidden();

  const body = await req.json();
  const parsed = CreateStateBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const [state] = await db.insert(statesTable).values(parsed.data).returning();
  return NextResponse.json(state, { status: 201 });
}
