import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "jp_admin_session";

function computeSessionToken(email: string, password: string): string {
  // Deterministic token derived from credentials (Edge-compatible)
  const raw = `jp-auth-v1:${email}:${password}`;
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `jps_${(hash >>> 0).toString(16)}_${btoa(`${email}:${password.slice(0, 3)}`).replace(/=/g, "")}`;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow the login page and auth endpoints
  if (
    pathname === "/admin/login" ||
    pathname === "/admin/login/" ||
    pathname.startsWith("/api/admin/auth/")
  ) {
    return NextResponse.next();
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return new NextResponse("Admin auth is not configured.", { status: 503 });
  }

  const expectedToken = computeSessionToken(adminEmail, adminPassword);
  const cookieToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (cookieToken && cookieToken === expectedToken) {
    return NextResponse.next();
  }

  // Fallback: check HTTP Basic Auth header (for API clients or saved browser Basic Auth)
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Basic ")) {
    try {
      const encodedCredentials = authorization.slice(6);
      const decodedCredentials = atob(encodedCredentials);
      const separatorIndex = decodedCredentials.indexOf(":");
      if (separatorIndex !== -1) {
        const username = decodedCredentials.slice(0, separatorIndex);
        const password = decodedCredentials.slice(separatorIndex + 1);
        if (username === adminEmail && password === adminPassword) {
          const response = NextResponse.next();
          response.cookies.set(ADMIN_COOKIE_NAME, expectedToken, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
          });
          return response;
        }
      }
    } catch {
      // Ignore malformed base64
    }
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Autenticazione richiesta." }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login/";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
