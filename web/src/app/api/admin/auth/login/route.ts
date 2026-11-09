import { NextResponse } from "next/server";
import { checkRateLimit, isSameOriginRequest } from "@/lib/antibot";

const ADMIN_COOKIE_NAME = "jp_admin_session";

function computeSessionToken(email: string, password: string): string {
  const raw = `jp-auth-v1:${email}:${password}`;
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `jps_${(hash >>> 0).toString(16)}_${Buffer.from(`${email}:${password.slice(0, 3)}`).toString("base64").replace(/=/g, "")}`;
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origine non valida." }, { status: 403 });
  }

  const rate = checkRateLimit(request, "admin-login", 6, 15 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Troppi tentativi di accesso. Riprova tra qualche minuto." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return NextResponse.json({ error: "Credenziali admin non configurate." }, { status: 503 });
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }

  const email = (body.email || "").trim();
  const password = body.password || "";

  if (email.toLowerCase() !== adminEmail.toLowerCase() || password !== adminPassword) {
    return NextResponse.json(
      { error: "Email o password errati. Riprova." },
      { status: 401 },
    );
  }

  const token = computeSessionToken(adminEmail, adminPassword);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 giorni
  });

  return response;
}
