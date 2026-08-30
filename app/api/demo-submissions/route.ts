import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/adminAuth'
import { DemoSubmissionError, createDemoSubmission, listDemoSubmissions } from '@/lib/demoSubmissions'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const soundCloudPattern = /^https?:\/\/(www\.)?(soundcloud\.com|on\.soundcloud\.com)\/.+/i

export async function GET(request: NextRequest) {
  if (!await isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const result = await listDemoSubmissions()
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Unable to load demo submissions.' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const alias = String(body.alias ?? '').trim()
    const email = String(body.email ?? '').trim()
    const scLink = String(body.scLink ?? '').trim()
    const notes = String(body.notes ?? '').trim()

    if (!alias) {
      return NextResponse.json({ error: 'Alias is required.' }, { status: 400 })
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
    }

    if (!soundCloudPattern.test(scLink)) {
      return NextResponse.json({ error: 'A valid SoundCloud link is required.' }, { status: 400 })
    }

    const submission = await createDemoSubmission({ alias, email, scLink, notes })
    return NextResponse.json({ submission }, { status: 201 })
  } catch (err) {
    if (err instanceof DemoSubmissionError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.status }
      )
    }

    return NextResponse.json(
      { error: 'Unable to save demo submission.' },
      { status: 500 }
    )
  }
}
