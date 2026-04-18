import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";

const protectedRoutes = ["/admin", "/student"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path starts with any of the protected route prefixes
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected) {
    const sessionToken = request.cookies.get("exam_session")?.value;
    const userId = verifySessionToken(sessionToken);

    if (!userId) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      // Optional: Store the intended destination to redirect back after login
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes (except those specifically excluded above)
    "/api/:path*",
  ],
};
