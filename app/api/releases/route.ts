import { NextResponse } from 'next/server'
import { apiActor, apiError, dbError, readJson, HttpError } from '@/lib/portal/http'
import { releaseSchema } from '@/lib/portal/validation'
import { z } from 'zod'
export async function POST(request: Request) {
  try {
    const body = await readJson(request)
    const actor = await apiActor()
    const { release, submissionId } = z.object({ release: releaseSchema, submissionId: z.uuid() }).strict().parse(body)
    const { data: approved, error: demoError } = await actor.client.from('demo_submissions')
      .select('id').eq('id', submissionId).eq('artist_user_id', actor.user.id)
      .eq('status', 'approved').maybeSingle()
    if (demoError) throw new HttpError(503, 'Unable to verify demo approval.')
    if (!approved) throw new HttpError(403, 'This demo is not approved for release details.')
    const { data: saved, error } = await actor.client.rpc('label_save_release', {
      rid: null,
      expected_revision: 0,
      payload: { ...release, demo_submission_id: submissionId },
    })
    dbError(error)
    return NextResponse.json(saved, { status: 201 })
  } catch (error) {
    return apiError(error)
  }
}
