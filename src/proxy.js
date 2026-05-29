import { NextResponse } from 'next/server';

// Lindungi semua /admin/* KECUALI /admin/login.
// (Next.js 16: konvensi "middleware" diganti menjadi "proxy".)
export function proxy(req) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const authed = req.cookies.get('admin_session')?.value === 'authenticated';
    if (!authed) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
