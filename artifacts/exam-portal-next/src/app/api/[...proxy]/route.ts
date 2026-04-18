import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

const API_BASE = "http://127.0.0.1:8000";

const MOCK_CHAPTERS = [
  { id: 101, title: "Indian Constitution: Fundamental Rights", className: "Civics Grade 10", classId: 10 },
  { id: 102, title: "Modern Indian History: The Independence Movemnet", className: "History Grade 10", classId: 10 },
  { id: 103, title: "Physical Geography of India", className: "Geography Grade 10", classId: 10 },
];

const MOCK_QUIZZES = [
  { id: 201, title: "Fundamental Rights Practice set", chapterId: 101, type: "CHAPTER", sections: [{ id: 301, title: "General", timeLimit: 600 }] },
  { id: 202, title: "Independence Movement assessment", chapterId: 102, type: "CHAPTER", sections: [{ id: 302, title: "Phase 1", timeLimit: 900 }] },
];

const MOCK_DASHBOARD = {
  totalAttempts: 12,
  averageScore: 84.5,
  completedQuizzes: 8,
  availableQuizzes: 4,
  recentScores: [
    { quizTitle: "Civics: Preamble & Parts", score: 18, totalQuestions: 20, percentage: 90, submittedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { quizTitle: "History: 1857 Revolt", score: 15, totalQuestions: 20, percentage: 75, submittedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { quizTitle: "Geography: River Systems", score: 17, totalQuestions: 20, percentage: 85, submittedAt: new Date(Date.now() - 86400000 * 8).toISOString() },
  ]
};

const DEMO_ROLES = ["CENTRAL", "STATE", "DISTRICT", "INSTITUTION", "STUDENT"];

export async function GET(request: NextRequest, props: { params: Promise<{ proxy: string[] }> }) {
  const { proxy } = await props.params;
  return handleProxy(request, proxy);
}

export async function POST(request: NextRequest, props: { params: Promise<{ proxy: string[] }> }) {
  const { proxy } = await props.params;
  return handleProxy(request, proxy);
}

export async function PUT(request: NextRequest, props: { params: Promise<{ proxy: string[] }> }) {
  const { proxy } = await props.params;
  return handleProxy(request, proxy);
}

export async function PATCH(request: NextRequest, props: { params: Promise<{ proxy: string[] }> }) {
  const { proxy } = await props.params;
  return handleProxy(request, proxy);
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ proxy: string[] }> }) {
  const { proxy } = await props.params;
  return handleProxy(request, proxy);
}

async function handleProxy(request: NextRequest, proxy: string[]) {
  const path = proxy.join("/");
  const url = new URL(request.url);
  const target = `${API_BASE}/api/${path}${url.search}`;

  // ── MOCK SESSION INTERCEPTION ──
  // Use request.cookies for better reliability in proxy context
  const token = request.cookies.get("exam_session")?.value;
  const userId = verifySessionToken(token);

  if (userId && userId < 0) {
    // Current user mock
    if (path === "me") {
        const roleIndex = Math.abs(userId) - 1;
        const role = DEMO_ROLES[roleIndex] ?? "STUDENT";
        return NextResponse.json({
            id: userId,
            clerkId: "mock-" + role,
            email: role.toLowerCase() + "@examportal.com",
            name: role + " Demo User",
            role: role as any,
            createdAt: new Date().toISOString(),
        });
    }

    if (path === "dashboard/student") return NextResponse.json(MOCK_DASHBOARD);
    if (path === "chapters") return NextResponse.json(MOCK_CHAPTERS);
    if (path === "quizzes") return NextResponse.json(MOCK_QUIZZES);
    
    if (path.startsWith("quizzes/")) {
       const segments = path.split("/");
       const id = Number(segments[1]);
       const quiz = MOCK_QUIZZES.find(q => q.id === id);
       if (quiz) {
           return NextResponse.json({
               ...quiz,
               sections: [
                   { 
                       id: 301, 
                       title: "Physics", 
                       timeLimit: 3600, 
                       questions: [
                           { id: 5001, question: "A particle is suspended by two ideal strings as shown in the figure. Now mass m is given a small displacement perpendicular to the plane of triangle formed. Choose the correct statement(s).", options: ["Option A", "Option B", "Option C", "Option D"], correctAnswer: 0 },
                           { id: 5002, question: "The torque on a body about a given point is found to be equal to A x L where A is a constant vector and L is the angular momentum of the body about that point. From this it can be concluded that", options: ["dL/dt is perpendicular to L at all instants of time", "the component of L in the direction of A does not change with time", "the magnitude of L does not change with time", "all the above"], correctAnswer: 3 }
                       ]
                   },
                   { 
                       id: 302, 
                       title: "Chemistry", 
                       timeLimit: 3600, 
                       questions: [
                           { id: 6001, question: "The major product of the following reaction is...", options: ["Product A", "Product B", "Product C", "Product D"], correctAnswer: 1 },
                           { id: 6002, question: "Which of the following is most basic?", options: ["Aniline", "Benzylamine", "p-nitroaniline", "Acetanilide"], correctAnswer: 1 }
                       ]
                   },
                   { 
                       id: 303, 
                       title: "Math", 
                       timeLimit: 3600, 
                       questions: [
                           { id: 7001, question: "The area bounded by the curves y = log x, y = log |x|, y = |log x| and y = |log |x|| is...", options: ["4 sq units", "6 sq units", "10 sq units", "None of these"], correctAnswer: 0 },
                           { id: 7002, question: "If alpha, beta are the roots of the equation x^2 + px + q = 0...", options: ["Alpha", "Beta", "Gamma", "Delta"], correctAnswer: 2 }
                       ]
                   }
               ]
           });
       }
    }

    if (path === "exams/attempts") return NextResponse.json([
      { id: 9991, quizTitle: "Fundamental Rights Practice set", score: 100, totalQuestions: 2, correctAnswers: 2, status: "SUBMITTED", submittedAt: new Date().toISOString() },
      { id: 9992, quizTitle: "Independence Movement assessment", score: 85, totalQuestions: 20, correctAnswers: 17, status: "SUBMITTED", submittedAt: "2026-04-16T14:30:00.000Z" }
    ]);

    if (path.startsWith("exams/attempts/")) {
      const attemptId = Number(path.split("/")[2]);
      return NextResponse.json({
        id: attemptId,
        quizTitle: "Mock Quiz result",
        score: 100,
        totalQuestions: 2,
        correctAnswers: 2,
        status: "SUBMITTED",
        submittedAt: new Date().toISOString(),
        answers: [
          { 
            id: 8001,
            selectedOption: 0, 
            isCorrect: true, 
            question: { 
                question: "Which article of the Indian Constitution deals with the Right to Equality?", 
                options: ["Article 14", "Article 19", "Article 21", "Article 32"], 
                correctAnswer: 0 
            } 
          },
          { 
            id: 8002,
            selectedOption: 0, 
            isCorrect: true, 
            question: { 
                question: "Who was the first President of Independent India?", 
                options: ["Dr. Rajendra Prasad", "Jawaharlal Nehru", "Sardar Patel", "Dr. B.R. Ambedkar"], 
                correctAnswer: 0 
            } 
          }
        ]
      });
    }

    if (path === "exams/start") return NextResponse.json({ id: 9991, status: "STARTED", startedAt: new Date().toISOString() });
    if (path === "exams/submit") return NextResponse.json({ attemptId: 9991, score: 100, totalQuestions: 2, correctAnswers: 2, percentage: 100 });
  }

  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.blob();
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers: headers,
      body: body,
      redirect: "manual",
      cache: "no-store",
    });

    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 503 });
  }
}
