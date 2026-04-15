import { db, usersTable } from "./src/lib/db.js";
import { hashPassword } from "./src/lib/auth.js";

async function createTestUsers() {
  try {
    const hashedPassword = hashPassword("password123");
    
    // Create Student
    await db.insert(usersTable).values({
      name: "Test Student",
      email: "student@example.com",
      password: hashedPassword,
      role: "STUDENT"
    }).onConflictDoNothing();

    // Create Admin
    await db.insert(usersTable).values({
      name: "Test Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "CENTRAL"
    }).onConflictDoNothing();

    console.log("SUCCESS: Test users created (student@example.com, admin@example.com)");
    process.exit(0);
  } catch (err) {
    console.error("Failed to create test users:", err);
    process.exit(1);
  }
}

createTestUsers();
