import { NextResponse, NextRequest } from "next/server";
import verify from "./app/(main)/global functions/verify";

const apiu = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

/**
 * This middleware verifies the access token and refreshes it if it's invalid.
 * It sets headers with user role, access token, and username if the access token is valid.
 * If the access token is invalid and there is no refresh token, it redirects to the login page.
 * If the access token is invalid and there is a refresh token, it refreshes the access token and
 * continues with the request.s
 * If there is an error while verifying the access token, it redirects to the login page.
 */
export async function middleware(req: NextRequest) {
  try {
    const accesstok = req.cookies.get("access")?.value || "notfound";
    const res = await verify(accesstok, "access");

    if (res.code !== 200) {
      const reftoken = req.cookies.get("refresh")?.value;
      if (!reftoken) return redirectToLogin(req);

      const r = await verify(reftoken, "refresh");
      if (r.code !== 200) return redirectToLogin(req);

      return handleTokenRefresh(req, reftoken);
    }

    const requestHeaders = new Headers(req.headers);
    if (res.payload) {
      requestHeaders.set("x-user-role", res.payload.role);
      requestHeaders.set("access", accesstok);
      requestHeaders.set("username", res.payload.username);
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      return response;
    }
  } catch {
    return redirectToLogin(req);
  }
}

function redirectToLogin(req: NextRequest) {
  return NextResponse.redirect(new URL("/login", req.url));
}

async function handleTokenRefresh(req: NextRequest, reftoken: string) {
  try {
    const refreshResponse = await fetch(`${apiu}accounts/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: reftoken }),
    });

    if (!refreshResponse.ok) return redirectToLogin(req);

    const newTokens = await refreshResponse.json();
    const final = NextResponse.redirect(req.nextUrl.clone());

    final.cookies.set("access", newTokens.access, {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
    });

    final.cookies.set("refresh", newTokens.refresh, {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
    });
    const verifiedNew = await verify(newTokens.access, "access");
    if (verifiedNew.payload) {
      final.headers.set("x-user-role", verifiedNew.payload.role);
      final.headers.set("access", newTokens.access);
      final.headers.set("username", verifiedNew.payload.username);
    }

    return final;
  } catch {
    return redirectToLogin(req);
  }
}

export const config = {
  matcher: ["/((?!api/login|login|_next/static|_next/image|favicon\\.ico).*)"],
};
