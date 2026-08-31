import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/adminAuth'
import {
  DemoSubmissionError,
  deleteDemoSubmission,
  isValidDemoSubmissionStatus,
  updateDemoSubmissionStatus,
} from '@/lib/demoSubmissions'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json().catch(() => null)
  const status = String(body?.status ?? '')

  if (!isValidDemoSubmissionStatus(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
  }

  try {
    const submission = await updateDemoSubmissionStatus(id, status)
    return NextResponse.json({ submission })
  } catch (err) {
    if (err instanceof DemoSubmissionError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }

    return NextResponse.json({ error: 'Unable to update submission.' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { id } = await params

  try {
    await deleteDemoSubmission(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof DemoSubmissionError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }

    return NextResponse.json({ error: 'Unable to delete submission.' }, { status: 500 })
  }
}
