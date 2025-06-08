import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Await the cookies() function
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh")?.value;

    if (!refreshToken) {
      const response = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      response.cookies.delete("access");
      response.cookies.delete("refresh");
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
      return response;
    }

    const newTokens = await backendRes.json();
    const cookieOptions = {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    };

    const response = NextResponse.json(
      { access: newTokens.access },
      { status: 200 }
    );

    response.cookies.set({
      name: "access",
      value: newTokens.access,
      ...cookieOptions,
    });

    response.cookies.set({
      name: "refresh",
      value: newTokens.refresh,
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
