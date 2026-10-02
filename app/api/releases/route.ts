import { NextResponse } from 'next/server'
import { apiActor, apiError, dbError, readJson } from '@/lib/portal/http'
import { releaseSchema } from '@/lib/portal/validation'
export async function POST(request: Request) {
  try {
    const body = await readJson(request)
    const actor = await apiActor()
    const payload = releaseSchema.parse(body)
    const { data: saved, error } = await actor.client.rpc('label_save_release', {
      rid: null,
      expected_revision: 0,
      payload,
    })
    dbError(error)
    return NextResponse.json(saved, { status: 201 })
  } catch (error) {
    return apiError(error)
  }
}
