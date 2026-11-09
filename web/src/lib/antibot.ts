import { NextResponse } from "next/server";

type RateBucket = {
  timestamps: number[];
};

const rateLimitStore = new Map<string, RateBucket>();
let lastCleanup = Date.now();

function cleanupExpiredBuckets(now: number, maxWindowMs = 30 * 60 * 1000) {
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, bucket] of rateLimitStore.entries()) {
    const active = bucket.timestamps.filter((ts) => now - ts < maxWindowMs);
    if (active.length === 0) {
      rateLimitStore.delete(key);
    } else {
      bucket.timestamps = active;
    }
  }
}

export function getClientIp(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  return "unknown";
}

export function checkRateLimit(
  request: Request,
  scope: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  cleanupExpiredBuckets(now);

  const ip = getClientIp(request);
  const key = `${scope}:${ip}`;
  const bucket = rateLimitStore.get(key) ?? { timestamps: [] };

  bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < windowMs);

  if (bucket.timestamps.length >= maxRequests) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    rateLimitStore.set(key, bucket);
    return { allowed: false, retryAfterSeconds };
  }

  bucket.timestamps.push(now);
  rateLimitStore.set(key, bucket);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function resetRateLimitForTests(scope?: string) {
  if (!scope) {
    rateLimitStore.clear();
    return;
  }
  for (const key of rateLimitStore.keys()) {
    if (key.startsWith(`${scope}:`)) {
      rateLimitStore.delete(key);
    }
  }
}

export function getAllowedOrigins(request: Request): Set<string> {
  const publicOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || request.url).origin;
  const allowedOrigins = new Set([publicOrigin]);

  if (
    publicOrigin === "https://jacopopeca.com" ||
    publicOrigin === "https://www.jacopopeca.com"
  ) {
    allowedOrigins.add("https://jacopopeca.com");
    allowedOrigins.add("https://www.jacopopeca.com");
    allowedOrigins.add("https://staging.jacopopeca.com");
  }

  return allowedOrigins;
}

export function isSameOriginRequest(request: Request, requireOriginInProd = false): boolean {
  const allowedOrigins = getAllowedOrigins(request);
  const origin = request.headers.get("origin");

  if (origin) {
    return allowedOrigins.has(origin);
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return allowedOrigins.has(new URL(referer).origin);
    } catch {
      return false;
    }
  }

  if (requireOriginInProd && process.env.NODE_ENV === "production") {
    return false;
  }

  return true;
}

const AUTOMATED_BOT_UA_REGEX =
  /\b(?:curl|wget|python-requests|python-urllib|aiohttp|httpx|go-http-client|scrapy|libwww-perl|Apache-HttpClient|okhttp|pycurl|zgrab|masscan|nmap|nikto|sqlmap|dirbuster|gobuster|feroxbuster|nuclei|headlesschrome|phantomjs| puppeteer|playwright)\b/i;

export function isSuspiciousBotUserAgent(request: Request): boolean {
  const ua = request.headers.get("user-agent");
  if (!ua) return false;
  return AUTOMATED_BOT_UA_REGEX.test(ua);
}

export function guardPublicMutation(
  request: Request,
  options: {
    scope: string;
    maxRequests: number;
    windowMs: number;
    requireOriginInProd?: boolean;
  },
): NextResponse | null {
  if (!isSameOriginRequest(request, options.requireOriginInProd)) {
    return NextResponse.json({ error: "Origine non valida" }, { status: 403 });
  }

  if (isSuspiciousBotUserAgent(request)) {
    return NextResponse.json({ error: "Richiesta automatica bloccata." }, { status: 403 });
  }

  const rate = checkRateLimit(request, options.scope, options.maxRequests, options.windowMs);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Troppe richieste ravvicinate. Attendi qualche minuto e riprova." },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSeconds) },
      },
    );
  }

  return null;
}
