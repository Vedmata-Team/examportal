import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db, usersTable } from "@/lib/db";
import { getSessionUser, unauthorized, forbidden } from "@/lib/apiAuth";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

const CreateUserBody = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["CENTRAL", "STATE", "DISTRICT", "INSTITUTION", "STUDENT"]),
  stateId: z.number().optional().nullable(),
  districtId: z.number().optional().nullable(),
  institutionId: z.number().optional().nullable(),
  classId: z.number().optional().nullable(),
});

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (!["CENTRAL", "STATE", "DISTRICT", "INSTITUTION"].includes(user.role)) return forbidden();

  const { searchParams } = new URL(req.url);
  const roleParam = searchParams.get("role");
  const conditions = [];

  if (roleParam) conditions.push(eq(usersTable.role, roleParam as any));
  if (user.role === "STATE" && user.stateId) conditions.push(eq(usersTable.stateId, user.stateId));
  if (user.role === "DISTRICT" && user.districtId) conditions.push(eq(usersTable.districtId, user.districtId));
  if (user.role === "INSTITUTION" && user.institutionId) conditions.push(eq(usersTable.institutionId, user.institutionId));

  const users = conditions.length > 0
    ? await db.select().from(usersTable).where(and(...conditions))
    : await db.select().from(usersTable);

  return NextResponse.json(users.map(u => ({ ...u, passwordHash: undefined })));
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (!["CENTRAL", "STATE", "DISTRICT", "INSTITUTION"].includes(user.role)) return forbidden();

  const body = await req.json();
  const parsed = CreateUserBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const [newUser] = await db.insert(usersTable).values({
    clerkId: `local:${parsed.data.email}`,
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash: hashPassword("TempPass123!"),
    role: parsed.data.role,
    stateId: parsed.data.stateId ?? null,
    districtId: parsed.data.districtId ?? null,
    institutionId: parsed.data.institutionId ?? null,
    classId: parsed.data.classId ?? null,
  }).returning();

  return NextResponse.json({ ...newUser, passwordHash: undefined }, { status: 201 });
}
