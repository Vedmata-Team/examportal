import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = process.env.API_BASE_URL || "http://localhost:8080";

// Routes handled natively by Next.js — do NOT proxy these
const NATIVE_PREFIXES = [
  "/api/auth/",
  "/api/me",
  "/api/states",
  "/api/districts",
  "/api/institutions",
  "/api/classes",
  "/api/chapters",
  "/api/quizzes",
  "/api/users",
  "/api/dashboard",
];

async function handler(req: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
  const { proxy } = await params;
  const path = "/api/" + proxy.join("/");

  // Safety: never proxy native routes
  if (NATIVE_PREFIXES.some((p) => path.startsWith(p))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const target = `${API_BASE}${path}${url.search}`;

  // Forward the session cookie so the Express requireAuth middleware can read it
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("exam_session");

  const headers = new Headers();
  headers.set("content-type", req.headers.get("content-type") || "application/json");
  if (sessionCookie) {
    headers.set("cookie", `exam_session=${sessionCookie.value}`);
  }

  const body = req.method !== "GET" && req.method !== "HEAD"
    ? await req.text()
    : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
    });
  } catch {
    return NextResponse.json(
      { error: "API server unreachable. Make sure the backend is running on port 8080." },
      { status: 503 }
    );
  }

  const responseBody = await upstream.text();
  const responseHeaders = new Headers();
  responseHeaders.set("content-type", upstream.headers.get("content-type") || "application/json");

  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
