import { NextResponse } from "next/server";
import { db, classesTable } from "@/lib/db";
import { getSessionUser, unauthorized, forbidden } from "@/lib/apiAuth";
import { z } from "zod";

const CreateClassBody = z.object({ name: z.string().min(1), description: z.string().optional() });

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const classes = await db.select().from(classesTable).orderBy(classesTable.name);
  return NextResponse.json(classes);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (!["CENTRAL", "STATE", "DISTRICT", "INSTITUTION"].includes(user.role)) return forbidden();

  const body = await req.json();
  const parsed = CreateClassBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const [cls] = await db.insert(classesTable).values(parsed.data).returning();
  return NextResponse.json(cls, { status: 201 });
}
