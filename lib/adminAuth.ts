import type { NextRequest } from 'next/server'

export const ADMIN_COOKIE = 'nothing_admin_session'

export function isAdminAuthConfigured() {
  return Boolean(
    process.env.ADMIN_USERNAME &&
    process.env.ADMIN_PASSWORD &&
    process.env.ADMIN_SESSION_SECRET
  )
}

export async function getAdminSessionToken() {
  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD
  const secret = process.env.ADMIN_SESSION_SECRET

  if (!username || !password || !secret) return ''

  const payload = `${username}:${password}:${secret}`
  const data = new TextEncoder().encode(payload)
  const hash = await crypto.subtle.digest('SHA-256', data)

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function isAdminAuthenticated(request: NextRequest) {
  if (!isAdminAuthConfigured()) return false

  const cookie = request.cookies.get(ADMIN_COOKIE)?.value
  if (!cookie) return false

  return cookie === await getAdminSessionToken()
}

export function validateAdminCredentials(username: string, password: string) {
  return (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  )
}
