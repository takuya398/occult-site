import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;

  // パスワード未設定の場合は通す（開発環境など）
  if (!password) {
    return NextResponse.next();
  }

  const auth = req.headers.get("authorization");

  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = Buffer.from(encoded, "base64").toString("utf-8");
      const colonIndex = decoded.indexOf(":");
      const pwd = decoded.slice(colonIndex + 1);
      if (pwd === password) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Area"',
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
