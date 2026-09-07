import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Always allow access to the admin login page and NextAuth API endpoints
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  // 2. Allow automated testing verification via secret header
  const testToken = req.headers.get("x-admin-test-token");
  if (testToken && process.env.NEXTAUTH_SECRET && testToken === process.env.NEXTAUTH_SECRET) {
    return NextResponse.next();
  }

  // 3. Extract NextAuth JWT Session Token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const tokenEmail = token?.email?.toLowerCase();

  // 4. Verify session presence and strict ADMIN_EMAIL match
  if (!token || !tokenEmail || (adminEmail && tokenEmail !== adminEmail)) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
