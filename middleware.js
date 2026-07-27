import { NextResponse } from 'next/server'

export function middleware(req) {
  const { pathname } = req.nextUrl

  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/admin/login'
  const isApiRoute = pathname.startsWith('/api/admin')

  if (isAdminRoute && !isLoginPage) {
    const session = req.cookies.get('admin_session')?.value
    
    // Check if session exists and has valid format (64 char hex)
    if (!session || !/^[a-f0-9]{64}$/i.test(session)) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // Add security headers
  const response = NextResponse.next()
  
  // Prevent admin pages from being embedded in iframes
  if (isAdminRoute || isApiRoute) {
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
