import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import {
  ListUsersQueryParams,
  ListUsersResponse,
  CreateUserBody,
  GetMeResponse,
  UpdateUserParams,
  UpdateUserBody,
  UpdateUserResponse,
} from "@workspace/api-zod";
import { clerkClient } from "@clerk/express";
import { adminRoles, canCreateRole, requireCurrentUser, requireRoles, type UserRole } from "../lib/authz";

const router: IRouter = Router();

router.get("/me", requireAuth, async (req, res): Promise<void> => {
  const clerkUserId = (req as any).clerkUserId;

  let [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId));

  if (!user) {
    try {
      const clerkUser = await (await clerkClient()).users.getUser(clerkUserId);
      const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
      const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || email;

      const [newUser] = await db.insert(usersTable).values({
        clerkId: clerkUserId,
        name,
        email,
        role: "STUDENT",
      }).returning();
      user = newUser;
    } catch (e) {
      req.log.error({ err: e }, "Failed to create user from Clerk");
      res.status(500).json({ error: "Failed to create user profile" });
      return;
    }
  }

  res.json(GetMeResponse.parse(user));
});

router.get("/users", requireAuth, requireRoles([...adminRoles]), async (req, res): Promise<void> => {
  const currentUser = await requireCurrentUser(req, res);
  if (!currentUser) return;
  const params = ListUsersQueryParams.safeParse(req.query);
  const conditions = [];

  if (params.success && params.data.role) {
    conditions.push(eq(usersTable.role, params.data.role as any));
  }
  if (params.success && params.data.institutionId) {
    conditions.push(eq(usersTable.institutionId, params.data.institutionId));
  }
  if (currentUser.role === "STATE" && currentUser.stateId) {
    conditions.push(eq(usersTable.stateId, currentUser.stateId));
  }
  if (currentUser.role === "DISTRICT" && currentUser.districtId) {
    conditions.push(eq(usersTable.districtId, currentUser.districtId));
  }
  if (currentUser.role === "INSTITUTION" && currentUser.institutionId) {
    conditions.push(eq(usersTable.institutionId, currentUser.institutionId));
  }

  const users = conditions.length > 0
    ? await db.select().from(usersTable).where(and(...conditions))
    : await db.select().from(usersTable);

  res.json(ListUsersResponse.parse(users));
});

router.post("/users", requireAuth, requireRoles([...adminRoles]), async (req, res): Promise<void> => {
  const currentUser = await requireCurrentUser(req, res);
  if (!currentUser) return;

  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (!canCreateRole(currentUser, parsed.data.role as UserRole)) {
    res.status(403).json({ error: "You do not have permission to create this role" });
    return;
  }

  if (currentUser.role === "STATE" && currentUser.stateId && parsed.data.stateId !== currentUser.stateId) {
    res.status(403).json({ error: "State admins can only create users in their state" });
    return;
  }
  if (currentUser.role === "DISTRICT" && currentUser.districtId && parsed.data.districtId !== currentUser.districtId) {
    res.status(403).json({ error: "District admins can only create users in their district" });
    return;
  }
  if (currentUser.role === "INSTITUTION" && currentUser.institutionId && parsed.data.institutionId !== currentUser.institutionId) {
    res.status(403).json({ error: "Institution admins can only create students in their institution" });
    return;
  }

  try {
    const clerkUser = await (await clerkClient()).users.createUser({
      emailAddress: [parsed.data.email],
      firstName: parsed.data.name.split(" ")[0],
      lastName: parsed.data.name.split(" ").slice(1).join(" ") || undefined,
      password: "TempPass123!",
    });

    const [user] = await db.insert(usersTable).values({
      clerkId: clerkUser.id,
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role as any,
      stateId: parsed.data.stateId ?? null,
      districtId: parsed.data.districtId ?? null,
      institutionId: parsed.data.institutionId ?? null,
      classId: parsed.data.classId ?? null,
    }).returning();

    res.status(201).json(GetMeResponse.parse(user));
  } catch (e: any) {
    req.log.error({ err: e }, "Failed to create user");
    res.status(400).json({ error: e.message || "Failed to create user" });
  }
});

router.patch("/users/:id", requireAuth, requireRoles([...adminRoles]), async (req, res): Promise<void> => {
  const currentUser = await requireCurrentUser(req, res);
  if (!currentUser) return;

  const params = UpdateUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (parsed.data.role && !canCreateRole(currentUser, parsed.data.role as UserRole)) {
    res.status(403).json({ error: "You do not have permission to assign this role" });
    return;
  }

  const [user] = await db.update(usersTable)
    .set(parsed.data as any)
    .where(eq(usersTable.id, params.data.id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(UpdateUserResponse.parse(user));
});

export default router;
