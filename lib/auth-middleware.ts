import { NextRequest, NextResponse } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = ["/", "/auth", "/api/auth"];

// Define routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/supervision",
  "/obligations",
  "/kpis",
  "/rewards",
];

export function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If it's a protected route, we'll let the client-side AuthWrapper handle it
  // This middleware is mainly for future server-side auth checks
  if (isProtectedRoute) {
    // For now, just continue - client-side AuthWrapper will handle auth
    return NextResponse.next();
  }

  // For public routes, continue normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
