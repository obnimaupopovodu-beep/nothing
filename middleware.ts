import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { sessionCookieOptions, supabaseConfig } from '@/lib/supabase/config'

export async function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || request.nextUrl.hostname).split(':')[0].toLowerCase()
  const prefix =
    host === process.env.ARTIST_HOSTNAME
      ? '/artists'
      : host === process.env.ADMIN_HOSTNAME
        ? '/admin'
        : ''
  if (prefix && request.nextUrl.pathname === '/login' && !request.nextUrl.searchParams.has('workspace')) {
    const login = request.nextUrl.clone()
    login.searchParams.set('workspace', prefix === '/admin' ? 'admin' : 'artists')
    return NextResponse.redirect(login)
  }
  const url = request.nextUrl.clone()
  if (
    prefix &&
    (url.pathname === '/' ||
      /^\/(releases|profile|notifications|demos|artists)(\/|$)/.test(url.pathname)) &&
    !url.pathname.startsWith(prefix)
  ) {
    url.pathname = `${prefix}${url.pathname === '/' ? '' : url.pathname}`
  }
  let response =
    url.pathname === request.nextUrl.pathname
      ? NextResponse.next({ request })
      : NextResponse.rewrite(url, { request })
  const noIndex = Boolean(prefix) || /^\/(artists|admin|login|preview|auth|api)(\/|$)/.test(url.pathname) || process.env.VERCEL_ENV === 'preview'
  if (noIndex) response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  if (url.pathname === '/' && !prefix) return response
  const config = supabaseConfig()
  if (!config) return response
  const client = createServerClient(config.url, config.key, {
    cookieOptions: sessionCookieOptions,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (values) => {
        values.forEach(({ name, value }) => request.cookies.set(name, value))
        response =
          url.pathname === request.nextUrl.pathname
            ? NextResponse.next({ request })
            : NextResponse.rewrite(url, { request })
        values.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, { ...options, ...sessionCookieOptions })
        )
      },
    },
  })
  const {
    data: { user },
  } = await client.auth.getUser()
  const protectedPage =
    /^\/(artists|admin)(\/|$)/.test(url.pathname) && url.pathname !== '/admin/login'
  if (protectedPage && (!user || user.is_anonymous)) {
    const login = new URL('/login', request.url)
    login.searchParams.set('workspace', url.pathname.startsWith('/admin') ? 'admin' : 'artists')
    login.searchParams.set('next', url.pathname)
    const redirect = NextResponse.redirect(login)
    redirect.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c))
    return redirect
  }
  if (noIndex) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  }
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}
export const config = {
  matcher: [
    '/artists/:path*',
    '/admin/:path*',
    '/login',
    '/preview',
    '/auth/:path*',
    '/api/auth/:path*',
    '/api/releases/:path*',
    '/api/profile',
    '/api/notifications',
    '/',
    '/releases/:path*',
    '/profile',
    '/notifications',
    '/demos',
  ],
}
