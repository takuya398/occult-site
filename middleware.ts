import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");
  const expectedUser = process.env.ADMIN_BASIC_USER ?? "admin";
  const expectedPass = process.env.ADMIN_PASSWORD ?? "";
  const expected = `Basic ${btoa(`${expectedUser}:${expectedPass}`)}`;

  if (authHeader !== expected) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
    });
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/admin/:path*"],
};
