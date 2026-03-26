import type { APIRoute } from "astro";

export const prerender = false;

// Simple authentication using an environment variable
const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD || "admin123";
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;
const failedAttempts = new Map<string, number[]>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string, now: number): boolean {
  const attempts = (failedAttempts.get(ip) || []).filter(
    (ts) => now - ts < WINDOW_MS,
  );
  failedAttempts.set(ip, attempts);
  return attempts.length >= MAX_ATTEMPTS;
}

function registerFailedAttempt(ip: string, now: number) {
  const attempts = (failedAttempts.get(ip) || []).filter(
    (ts) => now - ts < WINDOW_MS,
  );
  attempts.push(now);
  failedAttempts.set(ip, attempts);
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const ip = getClientIp(request);
    const now = Date.now();
    if (isRateLimited(ip, now)) {
      return new Response(JSON.stringify({ error: "Too many attempts" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Some server environments (like Astro dev server with certain setups)
    // might fail reading the stream with just request.json()
    // let's try reading the text first and parsing it manually.
    const text = await request.text();
    const data = JSON.parse(text);
    const { password } = data;

    if (password === ADMIN_PASSWORD) {
      failedAttempts.delete(ip);
      // Set a session cookie valid for 7 days
      cookies.set("cms_session", "authenticated", {
        path: "/",
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
      });
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    registerFailedAttempt(ip, now);
    return new Response(JSON.stringify({ error: "Invalid password" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Auth Error:", err);
    return new Response(JSON.stringify({ error: "Bad request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ cookies }) => {
  cookies.delete("cms_session", { path: "/" });
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
