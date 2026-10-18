import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'
import { createHash } from 'node:crypto'
import { apiError, readJson } from '@/lib/portal/http'

export const runtime = 'nodejs'
const requests = new Map<string, number>()
const schema = z.object({
  message: z.string().trim().min(8, 'Tell us a little more about the sound.').max(1600),
  email: z.union([z.literal(''), z.email().max(254)]),
  website: z.string().max(200).default(''),
}).strict()

export async function POST(request: Request) {
  try {
    const input = schema.parse(await readJson(request, 8192))
    if (input.website) return NextResponse.json({ ok: true })
    const key = process.env.RESEND_API_KEY, from = process.env.EMAIL_FROM
    const to = process.env.LISTENER_NOTIFICATION_EMAIL || process.env.DEMO_NOTIFICATION_EMAIL
    if (!key || !from || !to) return NextResponse.json({ error: 'Sound suggestions are not connected yet.' }, { status: 503 })
    // Lightweight per-instance protection. No message content or raw IP is logged.
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
    const id = createHash('sha256').update(ip).digest('hex')
    const now = Date.now()
    for (const [entry, expiry] of requests) if (expiry <= now) requests.delete(entry)
    if ((requests.get(id) || 0) > now || requests.size >= 5000) return NextResponse.json({ error: 'Please wait a minute before sending another suggestion.' }, { status: 429, headers: { 'Retry-After': '60' } })
    requests.set(id, now + 60_000)
    const { data, error } = await new Resend(key).emails.send({
      from, to: [to], subject: 'A listener shared a sound idea',
      ...(input.email ? { replyTo: input.email } : {}),
      text: `A listener would like to hear:\n\n${input.message}\n\nReply email: ${input.email || 'Not provided'}\n\nSent from the uwbelieve listener homepage.`,
    })
    if (error || !data?.id) return NextResponse.json({ error: 'Unable to send your suggestion right now.' }, { status: 503 })
    return NextResponse.json({ ok: true })
  } catch (error) { return apiError(error) }
}
