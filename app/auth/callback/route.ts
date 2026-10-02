import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { safeNext } from '@/lib/portal/validation'
export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  if (code) {
    try {
      const client = await createSupabaseServerClient()
      const { error } = await client.auth.exchangeCodeForSession(code)
      if (!error) {
        const next =
          url.searchParams.get('next') === '/login?mode=reset'
            ? '/login?mode=reset'
            : safeNext(url.searchParams.get('next'))
        return NextResponse.redirect(new URL(next, url.origin))
      }
    } catch {
      /* Show a retry state instead of exposing Auth diagnostics. */
    }
  }
  return NextResponse.redirect(new URL('/login?error=confirmation', url.origin))
}
