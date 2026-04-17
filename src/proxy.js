import { NextResponse } from 'next/server';

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const adminToken = request.cookies.get('adminToken')?.value;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  // Protect all /admin/:path routes except the login page itself
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && pathname !== '/admin') {
    if (!adminToken) {
      // Redirect to admin login if no token
      return NextResponse.redirect(new URL(`${basePath}/admin`, request.url));
    }
  }

  // Security for API Routes
  const protectedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  const publicApiRoutes = [
    '/api/admin/login',
    '/api/admin/logout',
    // Add other public POST routes here
  ];

  const isPublicApi = publicApiRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  // If it's an API route, check if it's a protected method and NOT a public API
  if (pathname.startsWith('/api/') && protectedMethods.includes(request.method) && !isPublicApi) {
    if (!adminToken) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
};