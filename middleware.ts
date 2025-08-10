// middleware.ts
import { NextResponse, NextRequest } from "next/server";
import verify from "./app/(main)/global functions/verify";
import { compactDecrypt, CompactEncrypt } from "jose";

const DJANGO_BASE = process.env.NEXT_PUBLIC_DJANGO_BASE_URL!;

interface SessionData {
  logo: string | null;
}

/**
 * Hash COOKIE_SECRET → SHA-256 → 32-byte key
 */
async function getSecret(): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(process.env.COOKIE_SECRET ?? "");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
}

export async function middleware(req: NextRequest) {
  try {
    const secret = await getSecret();
    const accessToken = req.cookies.get("access")?.value ?? "notfound";
    const sessionCookie = req.cookies.get("session_data")?.value;
    const refreshToken = req.cookies.get("refresh")?.value;

    // Verify + decrypt in parallel
    const [verifyRes, sessionData] = await Promise.all([
      verify(accessToken, "access").catch(() => ({ code: 401 })),
      sessionCookie
        ? compactDecrypt(sessionCookie, secret)
            .then(
              ({ plaintext }) =>
                JSON.parse(new TextDecoder().decode(plaintext)) as SessionData
            )
            .catch(() => null)
        : Promise.resolve<SessionData | null>(null),
    ]);

    const validSession = sessionData !== null && "logo" in sessionData;

    if (verifyRes.code !== 200 || !validSession) {
      if (!refreshToken) return redirectToLogin(req);
      return handleRefresh(req, refreshToken, secret);
    }

    // Attach headers & continue
    const headers = new Headers(req.headers);
    if ("payload" in verifyRes) {
      headers.set("x-user-role", verifyRes.payload?.role ?? "");
      headers.set("username", verifyRes.payload?.username ?? "");
      headers.set("access", accessToken);
    }
    headers.set("logo", sessionData!.logo ?? "EduTrack");

    return NextResponse.next({ request: { headers } });
  } catch {
    return redirectToLogin(req);
  }
}

function redirectToLogin(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", req.url));
  res.cookies.set("access", "", { expires: new Date(0), path: "/" });
  res.cookies.set("refresh", "", { expires: new Date(0), path: "/" });
  res.cookies.set("session_data", "", { expires: new Date(0), path: "/" });
  return res;
}

async function handleRefresh(
  req: NextRequest,
  token: string,
  secret: Uint8Array
) {
  try {
    const refreshRes = await fetch(`${DJANGO_BASE}accounts/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: token }),
    });

    if (!refreshRes.ok) return redirectToLogin(req);

    const { access, refresh, teacher_brand } = await refreshRes.json();
    const sessionData: SessionData = { logo: teacher_brand ?? null };

    // Re-encrypt session_data
    const sealed = await new CompactEncrypt(
      new TextEncoder().encode(JSON.stringify(sessionData))
    )
      .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
      .encrypt(secret);

    const res = NextResponse.redirect(req.nextUrl.clone());
    res.cookies.set("access", access, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
      secure: process.env.NODE_ENV === "production",
    });
    res.cookies.set("refresh", refresh, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      secure: process.env.NODE_ENV === "production",
    });
    res.cookies.set("session_data", sealed, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch {
    return redirectToLogin(req);
  }
}

export const config = {
  matcher: [
    "/((?!api/auth/login|login|api/auth/refresh|_next/static|_next/image|favicon\\.ico).*)",
  ],
};
