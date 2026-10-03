import 'server-only'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { getActor } from './auth'

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
  }
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin || origin !== new URL(request.url).origin)
    throw new HttpError(403, 'Request origin is not allowed.')
}
export async function readJson(request: Request, limit = 128 * 1024) {
  checkOrigin(request)
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    throw new HttpError(415, 'Use JSON.')
  const reader = request.body?.getReader()
  if (!reader) throw new HttpError(400, 'Request body is required.')
  let bytes = 0
  const chunks: Uint8Array[] = []
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    bytes += value.byteLength
    if (bytes > limit) {
      await reader.cancel()
      throw new HttpError(413, 'Request is too large.')
    }
    chunks.push(value)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new HttpError(400, 'Invalid JSON.')
  }
}
export async function apiActor(staff = false) {
  const actor = await getActor()
  if (!actor) throw new HttpError(401, 'Sign in to continue.')
  if (staff && !actor.staff) throw new HttpError(403, 'Team access is required.')
  return actor
}
export function dbError(error: { code?: string; message: string } | null) {
  if (!error) return
  if (error.code === '42501') throw new HttpError(403, 'You do not have access to this action.')
  if (error.code === 'P0002') throw new HttpError(404, 'Release not found.')
  if (error.code === '40001')
    throw new HttpError(409, 'This release changed. Reload it before saving.')
  if (error.code === '23505')
    throw new HttpError(409, 'Release details have already been started for this demo.')
  if (error.code === '22023' || error.code === '23514')
    throw new HttpError(400, 'Check the release details and current status.')
  if (error.code === '54000')
    throw new HttpError(429, 'Too many requests. Please try again shortly.')
  console.error('[portal] Database request failed', { code: error.code })
  throw new HttpError(503, 'Unable to save changes. Please try again.')
}
export function apiError(error: unknown) {
  if (error instanceof HttpError)
    return NextResponse.json({ error: error.message }, { status: error.status })
  if (error instanceof ZodError)
    return NextResponse.json(
      { error: error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') },
      { status: 400 }
    )
  console.error('[portal] Request failed', error instanceof Error ? error.message : 'Unknown error')
  return NextResponse.json(
    { error: 'The platform is unavailable. Please contact the label.' },
    { status: 503 }
  )
}
