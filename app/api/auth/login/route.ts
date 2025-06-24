import { NextRequest, NextResponse } from "next/server";
import verify from "@/app/(main)/global functions/verify";

const BASE_URL = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${BASE_URL}/accounts/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { access, refresh } = await response.json();

    const payload = await verify(access, "access");
    let role = "student"; // Default role

    // Check if verification succeeded and payload exists
    if (payload.code === 200 && payload.payload) {
      role = payload.payload.role;
    }

    const final = NextResponse.json(
      {
        message: "valid credentials",
        redirectto: `/${role}/dashboard`,
      },
      { status: 200 }
    );

    final.cookies.set("access", access, {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });

    final.cookies.set("refresh", refresh, {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });

    return final;
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }
}
