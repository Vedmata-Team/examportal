import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@/lib/db";
import { getSessionUser, unauthorized, forbidden } from "@/lib/apiAuth";
import { z } from "zod";

const UpdateUserBody = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["CENTRAL", "STATE", "DISTRICT", "INSTITUTION", "STUDENT"]).optional(),
  stateId: z.number().nullable().optional(),
  districtId: z.number().nullable().optional(),
  institutionId: z.number().nullable().optional(),
  classId: z.number().nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (!["CENTRAL", "STATE", "DISTRICT", "INSTITUTION"].includes(user.role)) return forbidden();

  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateUserBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const [updated] = await db.update(usersTable)
    .set(parsed.data as any)
    .where(eq(usersTable.id, Number(id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ ...updated, passwordHash: undefined });
}
