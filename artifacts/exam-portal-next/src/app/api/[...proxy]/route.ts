import { type NextRequest, NextResponse } from "next/server";

const DJANGO_BASE = process.env.DJANGO_API_URL || "http://localhost:8000";

async function handler(req: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
  const { proxy } = await params;
  const path = "/api/" + proxy.join("/");

  const url = new URL(req.url);
  const target = `${DJANGO_BASE}${path}${url.search}`;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const body =
    req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
    });
  } catch {
    return NextResponse.json(
      { error: "Django API server unreachable. Make sure it is running on port 8000." },
      { status: 503 }
    );
  }

  const responseBody = await upstream.text();
  const responseHeaders = new Headers();
  responseHeaders.set(
    "content-type",
    upstream.headers.get("content-type") || "application/json"
  );

  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) {
    responseHeaders.set("set-cookie", setCookie);
  }

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
