import { NextResponse } from 'next/server'
import { z } from 'zod'
import { apiActor, apiError, dbError, readJson } from '@/lib/portal/http'
import { releaseSchema } from '@/lib/portal/validation'

export async function POST(request: Request) {
  try {
    const actor = await apiActor(true)
    const body = z.object({ ownerId: z.uuid(), release: releaseSchema }).strict().parse(await readJson(request))
    const { data, error } = await actor.client.rpc('label_save_release', {
      rid: null, expected_revision: 0, payload: { ...body.release, owner_id: body.ownerId },
    })
    dbError(error)
    return NextResponse.json(data, { status: 201 })
  } catch (error) { return apiError(error) }
}
