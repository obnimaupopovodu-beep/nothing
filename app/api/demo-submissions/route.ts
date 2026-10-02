import { NextResponse } from 'next/server'
import { apiActor, apiError, readJson } from '@/lib/portal/http'
import { DemoSubmissionError, createDemoSubmission, listDemoSubmissions } from '@/lib/demoSubmissions'
import { sendDemoNotification } from '@/lib/demoNotification'


const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const soundCloudPattern = /^https?:\/\/(www\.)?(soundcloud\.com|on\.soundcloud\.com)\/.+/i


export async function GET() {
  try { const actor = await apiActor(true); return NextResponse.json(await listDemoSubmissions(actor.client)) }
  catch (error) { return apiError(error) }
}

export async function POST(request: Request) {
  try {
    const body = await readJson(request, 16384)
    const alias = String(body.alias ?? '').trim()
    const email = String(body.email ?? '').trim()
    const scLink = String(body.scLink ?? '').trim()
    const notes = String(body.notes ?? '').trim()


    if (!alias || alias.length > 120 || notes.length > 4000 || scLink.length > 2048 || email.length > 254) {
      return NextResponse.json({ error: 'Alias is required.' }, { status: 400 })
    }


    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
    }


    if (!soundCloudPattern.test(scLink)) {
      return NextResponse.json({ error: 'A valid SoundCloud link is required.' }, { status: 400 })
    }


    const submission = await createDemoSubmission({ alias, email, scLink, notes })

    try {
      await sendDemoNotification()
    } catch (notifyError) {
      console.error('Demo notification email failed:', notifyError)
    }

    return NextResponse.json({ submission }, { status: 201 })
  } catch (err) {
    if (err instanceof DemoSubmissionError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.status }
      )
    }


    return apiError(err)
  }
}
