import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, chaptersTable, classesTable } from "@/lib/db";
import { getSessionUser, unauthorized, forbidden } from "@/lib/apiAuth";
import { z } from "zod";

const CreateChapterBody = z.object({
  title: z.string().min(1),
  classId: z.number(),
  orderIndex: z.number().optional().default(0),
});

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const classIdParam = searchParams.get("classId");

  let query = db.select({
    id: chaptersTable.id,
    title: chaptersTable.title,
    classId: chaptersTable.classId,
    className: classesTable.name,
    orderIndex: chaptersTable.orderIndex,
    createdAt: chaptersTable.createdAt,
  }).from(chaptersTable).leftJoin(classesTable, eq(chaptersTable.classId, classesTable.id));

  if (classIdParam) {
    query = query.where(eq(chaptersTable.classId, Number(classIdParam))) as any;
  }

  return NextResponse.json(await query.orderBy(chaptersTable.orderIndex));
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (!["CENTRAL", "STATE", "DISTRICT", "INSTITUTION"].includes(user.role)) return forbidden();

  const body = await req.json();
  const parsed = CreateChapterBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const [chapter] = await db.insert(chaptersTable).values(parsed.data).returning();
  return NextResponse.json(chapter, { status: 201 });
}
