import { NextResponse } from 'next/server'
import {
  ADMIN_COOKIE,
  getAdminSessionToken,
  isAdminAuthConfigured,
  validateAdminCredentials,
} from '@/lib/adminAuth'

export async function POST(request: Request) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { error: 'Admin login is not configured.' },
      { status: 503 }
    )
  }

  const body = await request.json().catch(() => null)
  const username = String(body?.username ?? '')
  const password = String(body?.password ?? '')

  if (!validateAdminCredentials(username, password)) {
    return NextResponse.json(
      { error: 'Wrong login or password.' },
      { status: 401 }
    )
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: await getAdminSessionToken(),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  })

  return response
}
