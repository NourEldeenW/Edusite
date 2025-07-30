// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import verify from "@/app/(main)/global functions/verify";
import { CompactEncrypt } from "jose";

const DJANGO_BASE = process.env.NEXT_PUBLIC_DJANGO_BASE_URL!;

/**
 * Same SHA-256 → 32-byte key derivation
 */
async function getSecret(): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(process.env.COOKIE_SECRET ?? "");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
}

export async function POST(req: NextRequest) {
  try {
    const secret = await getSecret();
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Timeout guard
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const resp = await fetch(`${DJANGO_BASE}/accounts/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!resp.ok) {
      throw new Error(`HTTP status ${resp.status}`);
    }

    const { access, refresh, teacher_brand } = await resp.json();

    // Verify + encrypt in parallel
    const [verifyRes, sealed] = await Promise.all([
      verify(access, "access"),
      new CompactEncrypt(
        new TextEncoder().encode(
          JSON.stringify({ logo: teacher_brand ?? null })
        )
      )
        .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
        .encrypt(secret),
    ]);

    const role =
      verifyRes.code === 200 && verifyRes.payload?.role
        ? verifyRes.payload.role
        : "student";

    const out = NextResponse.json(
      { message: "valid credentials", redirectto: `/${role}/dashboard` },
      { status: 200 }
    );

    // Set cookies
    out.cookies.set("access", access, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
      secure: process.env.NODE_ENV === "production",
    });
    out.cookies.set("refresh", refresh, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      secure: process.env.NODE_ENV === "production",
    });
    out.cookies.set("session_data", sealed, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
      secure: process.env.NODE_ENV === "production",
    });

    return out;
  } catch (err) {
    console.error("Authentication error:", err);
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }
}
