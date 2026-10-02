import { NextResponse } from 'next/server'
import { z } from 'zod'
import { apiActor, apiError, dbError, readJson } from '@/lib/portal/http'
import { releaseSchema } from '@/lib/portal/validation'
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = z.uuid().parse((await params).id)
    const body = z
      .object({ revision: z.number().int().positive(), release: releaseSchema })
      .strict()
      .parse(await readJson(request))
    const actor = await apiActor()
    const { data: saved, error } = await actor.client.rpc('label_save_release', {
      rid: id,
      expected_revision: body.revision,
      payload: body.release,
    })
    dbError(error)
    return NextResponse.json(saved)
  } catch (error) {
    return apiError(error)
  }
}
