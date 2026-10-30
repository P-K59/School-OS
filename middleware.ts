import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Enforce zero-cache headers on all protected dashboard and portal routes
  // This prevents browser BFCache and HTTP caches from persisting private school telemetry
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/school') ||
    pathname.startsWith('/student') ||
    pathname.startsWith('/teacher')
  ) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/school/:path*',
    '/student/:path*',
    '/teacher/:path*',
  ],
};
