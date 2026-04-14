/**
 * Seed Script — ExamPortal
 * Run: npx tsx seed.ts
 *
 * Creates:
 *  State       → Uttar Pradesh
 *  District    → Agra
 *  Institution → Agra Public School
 *  Users       → one per role (CENTRAL, STATE, DISTRICT, INSTITUTION, STUDENT)
 *  Class       → Class 10
 *  Chapters    → 3 Hindi chapters on Indian Culture & Philosophy
 *  Content     → reading content per chapter
 *  Quizzes     → one quiz per chapter (Hindi questions)
 *  Sections    → one timed section per quiz
 *  Questions   → 5 MCQ per section (Hindi)
 */

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import crypto from "node:crypto";
import * as schema from "@workspace/db/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("❌  DATABASE_URL not set in .env");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// ── helpers ──────────────────────────────────────────────────────────────────

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function upsertState(name: string, code: string) {
  const existing = await db.query.statesTable.findFirst({
    where: (t, { eq }) => eq(t.code, code),
  });
  if (existing) { console.log(`  ↩  State already exists: ${name}`); return existing; }
  const [row] = await db.insert(schema.statesTable).values({ name, code }).returning();
  console.log(`  ✅  State created: ${name}`);
  return row;
}

async function upsertDistrict(name: string, stateId: number) {
  const existing = await db.query.districtsTable.findFirst({
    where: (t, { eq, and }) => and(eq(t.name, name), eq(t.stateId, stateId)),
  });
  if (existing) { console.log(`  ↩  District already exists: ${name}`); return existing; }
  const [row] = await db.insert(schema.districtsTable).values({ name, stateId }).returning();
  console.log(`  ✅  District created: ${name}`);
  return row;
}

async function upsertInstitution(name: string, districtId: number) {
  const existing = await db.query.institutionsTable.findFirst({
    where: (t, { eq, and }) => and(eq(t.name, name), eq(t.districtId, districtId)),
  });
  if (existing) { console.log(`  ↩  Institution already exists: ${name}`); return existing; }
  const [row] = await db.insert(schema.institutionsTable).values({ name, districtId }).returning();
  console.log(`  ✅  Institution created: ${name}`);
  return row;
}

async function upsertUser(data: {
  email: string; name: string; role: string;
  stateId?: number | null; districtId?: number | null;
  institutionId?: number | null; classId?: number | null;
}) {
  const existing = await db.query.usersTable.findFirst({
    where: (t, { eq }) => eq(t.email, data.email),
  });
  if (existing) { console.log(`  ↩  User already exists: ${data.email}`); return existing; }
  const [row] = await db.insert(schema.usersTable).values({
    clerkId: `local:${data.email}`,
    name: data.name,
    email: data.email,
    passwordHash: hashPassword("Password@123"),
    role: data.role as any,
    stateId: data.stateId ?? null,
    districtId: data.districtId ?? null,
    institutionId: data.institutionId ?? null,
    classId: data.classId ?? null,
  }).returning();
  console.log(`  ✅  User created: ${data.email} [${data.role}]`);
  return row;
}

async function upsertClass(name: string, description: string) {
  const existing = await db.query.classesTable.findFirst({
    where: (t, { eq }) => eq(t.name, name),
  });
  if (existing) { console.log(`  ↩  Class already exists: ${name}`); return existing; }
  const [row] = await db.insert(schema.classesTable).values({ name, description }).returning();
  console.log(`  ✅  Class created: ${name}`);
  return row;
}

async function upsertChapter(title: string, classId: number, orderIndex: number) {
  const existing = await db.query.chaptersTable.findFirst({
    where: (t, { eq, and }) => and(eq(t.title, title), eq(t.classId, classId)),
  });
  if (existing) { console.log(`  ↩  Chapter already exists: ${title}`); return existing; }
  const [row] = await db.insert(schema.chaptersTable).values({ title, classId, orderIndex }).returning();
  console.log(`  ✅  Chapter created: ${title}`);
  return row;
}

async function upsertContent(chapterId: number, htmlContent: string, minReadTime: number, orderIndex: number) {
  const existing = await db.query.contentTable.findFirst({
    where: (t, { eq, and }) => and(eq(t.chapterId, chapterId), eq(t.orderIndex, orderIndex)),
  });
  if (existing) { console.log(`  ↩  Content already exists for chapter ${chapterId}`); return existing; }
  const [row] = await db.insert(schema.contentTable).values({ chapterId, htmlContent, minReadTime, orderIndex }).returning();
  console.log(`  ✅  Content added for chapter ${chapterId}`);
  return row;
}

async function upsertQuiz(title: string, chapterId: number, type: string, startTime: Date, endTime: Date) {
  const existing = await db.query.quizzesTable.findFirst({
    where: (t, { eq, and }) => and(eq(t.title, title), eq(t.chapterId, chapterId)),
  });
  if (existing) { console.log(`  ↩  Quiz already exists: ${title}`); return existing; }
  const [row] = await db.insert(schema.quizzesTable).values({
    title, chapterId, type: type as any, startTime, endTime,
  }).returning();
  console.log(`  ✅  Quiz created: ${title}`);
  return row;
}

async function upsertSection(quizId: number, title: string, timeLimit: number, orderIndex: number) {
  const existing = await db.query.quizSectionsTable.findFirst({
    where: (t, { eq, and }) => and(eq(t.quizId, quizId), eq(t.orderIndex, orderIndex)),
  });
  if (existing) { console.log(`  ↩  Section already exists for quiz ${quizId}`); return existing; }
  const [row] = await db.insert(schema.quizSectionsTable).values({ quizId, title, timeLimit, orderIndex }).returning();
  console.log(`  ✅  Section created: ${title}`);
  return row;
}

async function upsertQuestion(
  sectionId: number, question: string, options: string[],
  correctAnswer: number, orderIndex: number
) {
  const existing = await db.query.questionsTable.findFirst({
    where: (t, { eq, and }) => and(eq(t.sectionId, sectionId), eq(t.orderIndex, orderIndex)),
  });
  if (existing) return existing;
  const [row] = await db.insert(schema.questionsTable).values({
    sectionId, question, options, correctAnswer, orderIndex,
  }).returning();
  return row;
}

// ── seed data ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱  Starting seed...\n");

  // ── 1. State ──────────────────────────────────────────────────────────────
  console.log("📍  State");
  const state = await upsertState("Uttar Pradesh", "UP");

  // ── 2. District ───────────────────────────────────────────────────────────
  console.log("\n🏙️   District");
  const district = await upsertDistrict("Agra", state.id);

  // ── 3. Institution ────────────────────────────────────────────────────────
  console.log("\n🏫  Institution");
  const institution = await upsertInstitution("Agra Public School", district.id);

  // ── 4. Class ──────────────────────────────────────────────────────────────
  console.log("\n📚  Class");
  const cls = await upsertClass("कक्षा 10", "दसवीं कक्षा — माध्यमिक शिक्षा");

  // ── 5. Users (one per role) ───────────────────────────────────────────────
  console.log("\n👥  Users");
  await upsertUser({
    email: "central@examportal.com",
    name: "केंद्रीय प्रशासक",
    role: "CENTRAL",
  });
  await upsertUser({
    email: "state@examportal.com",
    name: "राज्य प्रशासक — उत्तर प्रदेश",
    role: "STATE",
    stateId: state.id,
  });
  await upsertUser({
    email: "district@examportal.com",
    name: "जिला प्रशासक — आगरा",
    role: "DISTRICT",
    stateId: state.id,
    districtId: district.id,
  });
  await upsertUser({
    email: "institution@examportal.com",
    name: "संस्था प्रशासक — Agra Public School",
    role: "INSTITUTION",
    stateId: state.id,
    districtId: district.id,
    institutionId: institution.id,
  });
  await upsertUser({
    email: "student@examportal.com",
    name: "छात्र — राहुल शर्मा",
    role: "STUDENT",
    stateId: state.id,
    districtId: district.id,
    institutionId: institution.id,
    classId: cls.id,
  });

  // ── 6. Chapters (3 chapters on Indian Culture & Philosophy in Hindi) ───────
  console.log("\n📖  Chapters");

  const chapter1 = await upsertChapter("भारतीय संस्कृति की आत्मा", cls.id, 1);
  const chapter2 = await upsertChapter("भारतीय दर्शन के मूल सिद्धांत", cls.id, 2);
  const chapter3 = await upsertChapter("वेद, उपनिषद और गीता का संदेश", cls.id, 3);

  // ── 7. Content per chapter (minReadTime in seconds) ───────────────────────
  console.log("\n📝  Content");

  await upsertContent(chapter1.id, `
    <h2>भारतीय संस्कृति की आत्मा</h2>
    <p>भारतीय संस्कृति विश्व की प्राचीनतम और समृद्धतम संस्कृतियों में से एक है। इसकी जड़ें वेदों, उपनिषदों और पुराणों में हैं।</p>
    <h3>मुख्य विशेषताएँ</h3>
    <ul>
      <li><strong>अनेकता में एकता:</strong> भारत में अनेक धर्म, भाषाएँ और परंपराएँ हैं, फिर भी एक सांस्कृतिक धागा सबको जोड़ता है।</li>
      <li><strong>अहिंसा:</strong> महात्मा गांधी और भगवान महावीर ने अहिंसा को जीवन का मूल सिद्धांत बताया।</li>
      <li><strong>वसुधैव कुटुम्बकम्:</strong> "सारा संसार एक परिवार है" — यह भारतीय दर्शन का मूल मंत्र है।</li>
      <li><strong>कर्म और धर्म:</strong> भारतीय संस्कृति में कर्म को सर्वोच्च स्थान दिया गया है।</li>
    </ul>
    <p>भारतीय संस्कृति ने विश्व को योग, आयुर्वेद, गणित और खगोल विज्ञान जैसे अमूल्य उपहार दिए हैं।</p>
  `, 300, 1);

  await upsertContent(chapter2.id, `
    <h2>भारतीय दर्शन के मूल सिद्धांत</h2>
    <p>भारतीय दर्शन (Indian Philosophy) जीवन, ब्रह्मांड और आत्मा के रहस्यों को समझने का प्रयास करता है।</p>
    <h3>प्रमुख दार्शनिक विचारधाराएँ</h3>
    <ul>
      <li><strong>अद्वैत वेदांत:</strong> आदि शंकराचार्य ने बताया कि ब्रह्म और आत्मा एक ही हैं।</li>
      <li><strong>सांख्य दर्शन:</strong> प्रकृति और पुरुष के द्वंद्व पर आधारित विचारधारा।</li>
      <li><strong>योग दर्शन:</strong> महर्षि पतंजलि ने अष्टांग योग के माध्यम से मोक्ष का मार्ग बताया।</li>
      <li><strong>न्याय और वैशेषिक:</strong> तर्क और परमाणु सिद्धांत पर आधारित दर्शन।</li>
    </ul>
    <h3>चार पुरुषार्थ</h3>
    <p>धर्म, अर्थ, काम और मोक्ष — ये चार पुरुषार्थ भारतीय जीवन दर्शन के आधार स्तंभ हैं।</p>
  `, 360, 1);

  await upsertContent(chapter3.id, `
    <h2>वेद, उपनिषद और गीता का संदेश</h2>
    <p>भारतीय ज्ञान परंपरा के तीन महान स्तंभ — वेद, उपनिषद और भगवद्गीता — मानवता को दिशा देते हैं।</p>
    <h3>वेद</h3>
    <p>चार वेद हैं — ऋग्वेद, यजुर्वेद, सामवेद और अथर्ववेद। ये विश्व के प्राचीनतम ग्रंथ हैं।</p>
    <h3>उपनिषद</h3>
    <p>उपनिषदों में आत्मा, ब्रह्म और मोक्ष के गूढ़ रहस्यों का वर्णन है। "अहं ब्रह्मास्मि" और "तत्त्वमसि" जैसे महावाक्य उपनिषदों से ही आए हैं।</p>
    <h3>भगवद्गीता</h3>
    <p>श्रीकृष्ण ने अर्जुन को कुरुक्षेत्र के युद्धक्षेत्र में जो उपदेश दिया, वह भगवद्गीता है। इसके 18 अध्यायों में कर्मयोग, ज्ञानयोग और भक्तियोग का सार है।</p>
    <blockquote>"कर्म करो, फल की चिंता मत करो।" — भगवद्गीता</blockquote>
  `, 420, 1);

  // ── 8. Quizzes (one per chapter, staggered start/end times) ───────────────
  console.log("\n📋  Quizzes");

  const now = new Date();
  const d = (days: number) => new Date(now.getTime() + days * 86400000);

  const quiz1 = await upsertQuiz("भारतीय संस्कृति — अध्याय परीक्षा", chapter1.id, "CHAPTER", d(1), d(8));
  const quiz2 = await upsertQuiz("भारतीय दर्शन — अध्याय परीक्षा", chapter2.id, "CHAPTER", d(9), d(16));
  const quiz3 = await upsertQuiz("वेद, उपनिषद और गीता — अध्याय परीक्षा", chapter3.id, "CHAPTER", d(17), d(24));

  // Also link quizzes to chapters via quiz_chapters
  for (const [quiz, chapter] of [[quiz1, chapter1], [quiz2, chapter2], [quiz3, chapter3]] as const) {
    const existing = await db.query.quizChaptersTable.findFirst({
      where: (t, { eq, and }) => and(eq(t.quizId, quiz.id), eq(t.chapterId, chapter.id)),
    });
    if (!existing) {
      await db.insert(schema.quizChaptersTable).values({ quizId: quiz.id, chapterId: chapter.id });
    }
  }

  // ── 9. Sections (one timed section per quiz, 20 min each) ─────────────────
  console.log("\n⏱️   Sections");

  const sec1 = await upsertSection(quiz1.id, "भाग 1 — बहुविकल्पीय प्रश्न", 1200, 1);
  const sec2 = await upsertSection(quiz2.id, "भाग 1 — बहुविकल्पीय प्रश्न", 1200, 1);
  const sec3 = await upsertSection(quiz3.id, "भाग 1 — बहुविकल्पीय प्रश्न", 1200, 1);

  // ── 10. Questions (5 per section, all Hindi MCQ) ──────────────────────────
  console.log("\n❓  Questions");

  // Quiz 1 — भारतीय संस्कृति
  const q1 = [
    { q: "भारतीय संस्कृति का मूल मंत्र कौन सा है?", opts: ["वसुधैव कुटुम्बकम्", "जय हिंद", "सत्यमेव जयते", "अहिंसा परमो धर्मः"], ans: 0 },
    { q: "भारत में अहिंसा के सबसे बड़े प्रचारक कौन थे?", opts: ["स्वामी विवेकानंद", "महात्मा गांधी", "सुभाष चंद्र बोस", "भगत सिंह"], ans: 1 },
    { q: "भारत ने विश्व को कौन सा विज्ञान दिया?", opts: ["परमाणु विज्ञान", "योग और आयुर्वेद", "रसायन विज्ञान", "भौतिकी"], ans: 1 },
    { q: "'अनेकता में एकता' किस देश की विशेषता है?", opts: ["चीन", "अमेरिका", "भारत", "रूस"], ans: 2 },
    { q: "कर्म और धर्म का सिद्धांत किस ग्रंथ में मिलता है?", opts: ["रामायण", "महाभारत", "भगवद्गीता", "उपरोक्त सभी"], ans: 3 },
  ];

  // Quiz 2 — भारतीय दर्शन
  const q2 = [
    { q: "अद्वैत वेदांत के प्रवर्तक कौन हैं?", opts: ["रामानुजाचार्य", "आदि शंकराचार्य", "महर्षि पतंजलि", "कपिल मुनि"], ans: 1 },
    { q: "अष्टांग योग किसने प्रतिपादित किया?", opts: ["महर्षि वेदव्यास", "महर्षि पतंजलि", "आदि शंकराचार्य", "गौतम बुद्ध"], ans: 1 },
    { q: "चार पुरुषार्थों में कौन सा शामिल नहीं है?", opts: ["धर्म", "अर्थ", "शक्ति", "मोक्ष"], ans: 2 },
    { q: "सांख्य दर्शन किस पर आधारित है?", opts: ["ईश्वर और जीव", "प्रकृति और पुरुष", "आत्मा और परमात्मा", "कर्म और फल"], ans: 1 },
    { q: "'ब्रह्म सत्य, जगत मिथ्या' किस दर्शन का कथन है?", opts: ["सांख्य", "न्याय", "अद्वैत वेदांत", "योग"], ans: 2 },
  ];

  // Quiz 3 — वेद, उपनिषद, गीता
  const q3 = [
    { q: "वेदों की संख्या कितनी है?", opts: ["2", "3", "4", "6"], ans: 2 },
    { q: "'अहं ब्रह्मास्मि' महावाक्य किससे लिया गया है?", opts: ["ऋग्वेद", "उपनिषद", "भगवद्गीता", "रामायण"], ans: 1 },
    { q: "भगवद्गीता में कितने अध्याय हैं?", opts: ["12", "14", "16", "18"], ans: 3 },
    { q: "भगवद्गीता का उपदेश किसने दिया?", opts: ["ब्रह्मा", "विष्णु", "श्रीकृष्ण", "शिव"], ans: 2 },
    { q: "सामवेद किससे संबंधित है?", opts: ["यज्ञ विधि", "संगीत और गान", "औषधि", "युद्ध"], ans: 1 },
  ];

  for (const [secId, questions] of [[sec1.id, q1], [sec2.id, q2], [sec3.id, q3]] as const) {
    for (let i = 0; i < questions.length; i++) {
      const item = questions[i];
      await upsertQuestion(secId, item.q, item.opts, item.ans, i + 1);
    }
  }
  console.log("  ✅  All questions inserted");

  console.log("\n✅  Seed complete!\n");
  console.log("  Login credentials (password: Password@123):");
  console.log("  ┌─────────────────────────────────────────────────────┐");
  console.log("  │  central@examportal.com      → CENTRAL              │");
  console.log("  │  state@examportal.com        → STATE (UP)           │");
  console.log("  │  district@examportal.com     → DISTRICT (Agra)      │");
  console.log("  │  institution@examportal.com  → INSTITUTION (APS)    │");
  console.log("  │  student@examportal.com      → STUDENT (Class 10)   │");
  console.log("  └─────────────────────────────────────────────────────┘\n");

  await pool.end();
}

main().catch((err) => {
  console.error("❌  Seed failed:", err);
  pool.end();
  process.exit(1);
});
