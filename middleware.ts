import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/adminAuth'

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const isLoginPage = pathname === '/admin/login'
  const authenticated = await isAdminAuthenticated(request)

  if (isLoginPage && authenticated) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  if (!isLoginPage && !authenticated) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('next', `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
