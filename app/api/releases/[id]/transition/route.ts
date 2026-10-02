import { NextResponse } from 'next/server'
import { z } from 'zod'
import { apiActor, apiError, dbError, readJson } from '@/lib/portal/http'
import { statuses } from '@/lib/portal/validation'
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = z.uuid().parse((await params).id)
    const body = z
      .object({
        revision: z.number().int().positive(),
        target: z.enum(statuses),
        message: z.string().trim().max(4000).default(''),
      })
      .strict()
      .parse(await readJson(request))
    const actor = await apiActor(body.target !== 'submitted')
    const { error } = await actor.client.rpc('label_transition_release', {
      rid: id,
      expected_revision: body.revision,
      target: body.target,
      message: body.message,
    })
    dbError(error)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return apiError(error)
  }
}
