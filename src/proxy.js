import { NextResponse } from "next/server";

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const adminToken = request.cookies.get("adminToken")?.value;

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  const adminPath = `${basePath}/admin`;
  const loginPath = `${basePath}/admin/login`;

  // Protect admin routes
  if (
    pathname.startsWith(adminPath) &&
    pathname !== adminPath &&
    !pathname.startsWith(loginPath)
  ) {
    if (!adminToken) {
      return NextResponse.redirect(
        new URL(adminPath, request.url)
      );
    }
  }

  // Protect API routes
  const protectedMethods = ["POST", "PUT", "DELETE", "PATCH"];

  const publicApiRoutes = [
    `${basePath}/api/admin/login`,
    `${basePath}/api/admin/logout`,
  ];

  const isPublicApi = publicApiRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (
    pathname.startsWith(`${basePath}/api/`) &&
    protectedMethods.includes(request.method) &&
    !isPublicApi
  ) {
    if (!adminToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/vidyasthanam/admin/:path*",
    "/vidyasthanam/api/:path*",
  ],
};