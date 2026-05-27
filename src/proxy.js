import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const adminToken = request.cookies.get("adminToken")?.value;

  // Normalize pathname
  const normalizedPath =
    pathname.endsWith("/") && pathname !== "/"
      ? pathname.slice(0, -1)
      : pathname;

  const adminPath = "/admin";
  const loginPath = "/admin/login";

  // =========================
  // TOKEN VALIDATION FUNCTION
  // =========================
  async function validateAdminToken() {
    try {
      if (!adminToken) return null;

      // Decode + Verify JWT
      const decoded = jwt.verify(
        adminToken,
        process.env.JWT_SECRET
      );

      /*
        decoded:
        {
          id,
          email,
          name,
          tokenVersion,
          iat,
          exp
        }
      */

      await connectToDatabase();

      // Find admin
      const admin = await Admin.findById(decoded.id);

      if (!admin) return null;

      // Compare tokenVersion
      if (
        (admin.tokenVersion || 0) !==
        (decoded.tokenVersion || 0)
      ) {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  const validAdmin = await validateAdminToken();

  // =========================
  // ADMIN PAGE PROTECTION
  // =========================
  if (
    normalizedPath.startsWith(adminPath) &&
    normalizedPath !== adminPath &&
    !normalizedPath.startsWith(loginPath)
  ) {
    if (!validAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = adminPath;

      if (adminToken) {
        url.searchParams.set("message", "Session expired. Please log in again.");
      }

      const response = NextResponse.redirect(url);

      // remove invalid cookie
      response.cookies.delete("adminToken");

      return response;
    }
  }

  // =========================
  // LOGIN PAGE REDIRECT
  // =========================
  else if (
    normalizedPath === adminPath ||
    normalizedPath === loginPath
  ) {
    if (validAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/navbar";

      return NextResponse.redirect(url);
    }
  }

  // =========================
  // API ROUTE PROTECTION
  // =========================
  const protectedMethods = [
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
  ];

  const publicApiRoutes = [
    "/api/admin/login",
    "/api/admin/logout",
    "/api/contact/send",
    "/api/registration/send",
  ];

  const isPublicApi = publicApiRoutes.some(
    (route) =>
      normalizedPath === route ||
      normalizedPath.startsWith(route + "/")
  );

  if (
    normalizedPath.startsWith("/api/") &&
    protectedMethods.includes(request.method) &&
    !isPublicApi
  ) {
    if (!validAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: adminToken
            ? "Session expired. Please log in again."
            : "Authentication required",
        },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/:basePath*/admin/:path*",
    "/:basePath*/api/:path*",
  ],
};