import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // 1. Enforce zero-cache headers on all protected dashboard and portal routes
  // This prevents browser BFCache and intermediate proxies from persisting private telemetry
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

    // 2. Inspect session cookie for server-side route boundary enforcement
    const userCookie = request.cookies.get('school_os_user')?.value || request.cookies.get('school_os_session')?.value;
    if (userCookie) {
      try {
        const user = JSON.parse(decodeURIComponent(userCookie));
        
        // Immediate block for suspended accounts
        if (user && (user.isActive === false || user.status === 'SUSPENDED' || user.status === 'INACTIVE')) {
          const redirectUrl = new URL('/login?error=account_suspended', request.url);
          return NextResponse.redirect(redirectUrl);
        }

        // Enforce role boundaries
        if (pathname.startsWith('/admin') && user.role !== 'SUPER_ADMIN') {
          const target = user.role === 'STUDENT' ? '/student' : user.role === 'TEACHER' ? '/teacher' : '/school';
          return NextResponse.redirect(new URL(target, request.url));
        }

        if (pathname.startsWith('/school') && user.role === 'STUDENT') {
          return NextResponse.redirect(new URL('/student', request.url));
        }
      } catch {
        // Corrupted cookie: allow client-side app-shell revalidation to safely handle
      }
    }
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
