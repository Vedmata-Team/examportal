import { db, usersTable } from "./src/lib/db.js";

async function dumpUsers() {
  try {
    const users = await db.select().from(usersTable);
    console.log("USERS:", JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    process.exit(1);
  }
}

dumpUsers();
