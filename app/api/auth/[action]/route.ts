import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { apiError, checkOrigin, readJson, HttpError } from '@/lib/portal/http'
import { safeNext } from '@/lib/portal/validation'

export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  try {
    const { action } = await params
    checkOrigin(request)
    const client = await createSupabaseServerClient()
    if (action === 'logout') {
      const { error } = await client.auth.signOut()
      if (error) throw new HttpError(503, 'Unable to sign out. Please try again.')
      return NextResponse.redirect(new URL('/login', request.url), 303)
    }
    const body = await readJson(request, 8192)
    if (action === 'reset') {
      const {
        data: { user },
      } = await client.auth.getUser()
      if (!user) throw new HttpError(401, 'Open the password reset link first.')
      const password = z.string().min(12).max(128).parse(body.password)
      const { error } = await client.auth.updateUser({ password })
      if (error)
        throw new HttpError(400, 'Unable to update your password. Request a new reset link.')
      await client.auth.signOut({ scope: 'others' })
      return NextResponse.json({ next: safeNext(body.next, body.workspace === 'admin' ? '/admin' : '/artists') })
    }
    const email = z.email().max(254).parse(body.email).toLowerCase()
    // PKCE verifier cookies are host-only: return to the host that started Auth.
    const callback = new URL('/auth/callback', request.url)
    if (action === 'forgot') {
      callback.searchParams.set('next', '/login?mode=reset')
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: callback.toString(),
      })
      if (error) throw new HttpError(400, 'Unable to send reset email. Try again later.')
      return NextResponse.json({
        message: 'If this email has an account, a reset link has been sent.',
      })
    }
    const password = z
      .string()
      .min(action === 'register' ? 12 : 1)
      .max(128)
      .parse(body.password)
    if (action === 'register') {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: callback.toString() },
      })
      if (error)
        throw new HttpError(400, 'Unable to create account. Check your details or try signing in.')
      return NextResponse.json(
        data.session
          ? { next: '/artists' }
          : { message: 'Check your email to confirm your account before signing in.' }
      )
    }
    if (action !== 'login') throw new HttpError(404, 'Unknown action.')
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error)
      throw new HttpError(401, 'Email or password is incorrect, or your email is not confirmed.')
    return NextResponse.json({
      next: safeNext(body.next, body.workspace === 'admin' ? '/admin' : '/artists'),
    })
  } catch (error) {
    return apiError(error)
  }
}
