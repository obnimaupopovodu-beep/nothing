import { NextResponse } from 'next/server'
import { z } from 'zod'
import { apiActor, apiError, HttpError, readJson } from '@/lib/portal/http'
import { createArtistDemoSubmission } from '@/lib/demoSubmissions'
import { sendDemoNotification } from '@/lib/demoNotification'

const submissionSchema = z.object({
  alias: z.string().trim().min(1).max(120),
  scLink: z.string().trim().max(2048).refine(
    (value) => /^https?:\/\/(www\.)?(soundcloud\.com|on\.soundcloud\.com)\/.+/i.test(value),
    'Use a SoundCloud track link.'
  ),
  notes: z.string().trim().max(4000),
}).strict()

export async function POST(request: Request) {
  try {
    const actor = await apiActor()
    if (!actor.user.email) throw new HttpError(400, 'Add an email address to your account first.')
    const input = submissionSchema.parse(await readJson(request, 16384))
    const submission = await createArtistDemoSubmission(actor.client, actor.user.id, {
      ...input,
      email: actor.user.email,
    })
    try { await sendDemoNotification() }
    catch (error) { console.error('[demo] Notification failed', error) }
    return NextResponse.json({ submission }, { status: 201 })
  } catch (error) {
    return apiError(error)
  }
}
