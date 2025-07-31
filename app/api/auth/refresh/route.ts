import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CompactEncrypt } from "jose";

// Reuse secret derivation from login API
async function getSecret(): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(process.env.COOKIE_SECRET ?? "");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh")?.value;

    if (!refreshToken) {
      const response = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      response.cookies.delete("access");
      response.cookies.delete("refresh");
      response.cookies.delete("session_data");
      return response;
    }

    const refreshUrl = `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}accounts/refresh/`;

    const backendRes = await fetch(refreshUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!backendRes.ok) {
      const response = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      response.cookies.delete("access");
      response.cookies.delete("refresh");
      response.cookies.delete("session_data");
      return response;
    }

    const newTokens = await backendRes.json();
    const cookieOptions = {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
    };

    // Encrypt session data same as login API
    const sessionData = {
      logo: newTokens.teacher_brand ?? null,
    };

    const secret = await getSecret();
    const sealed = await new CompactEncrypt(
      new TextEncoder().encode(JSON.stringify(sessionData))
    )
      .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
      .encrypt(secret);

    const response = NextResponse.json(
      { access: newTokens.access },
      { status: 200 }
    );

    response.cookies.set({
      name: "access",
      value: newTokens.access,
      maxAge: 60 * 60, // 1 hour
      ...cookieOptions,
    });

    response.cookies.set({
      name: "refresh",
      value: newTokens.refresh,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      ...cookieOptions,
    });

    // Set session_data cookie same as login API
    response.cookies.set({
      name: "session_data",
      value: sealed,
      maxAge: 60 * 60, // 1 hour (matches access token)
      ...cookieOptions,
    });

    return response;
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Other HTTP methods
export async function GET() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function PUT() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function DELETE() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function PATCH() {
  return new Response("Method Not Allowed", { status: 405 });
}
