import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/";
  const res = NextResponse.json({ message: "success" });

  res.cookies.set("access", "", { expires: new Date(0) });
  res.cookies.set("refresh", "", { expires: new Date(0) });
  res.cookies.set("session_data", "", { expires: new Date(0) });

  return res;
}
