import { NextResponse } from 'next/server'
import { z } from 'zod'
import { apiActor, apiError, dbError, HttpError, readJson } from '@/lib/portal/http'
import { artistReleaseModes } from '@/lib/portal/validation'

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await apiActor(true)
    const artistId = z.uuid().parse((await context.params).id)
    const { mode } = z.object({ mode: z.enum(artistReleaseModes) }).strict().parse(await readJson(request, 1024))
    const { error } = await actor.client.rpc('label_set_artist_release_mode', {
      target_artist: artistId,
      new_mode: mode,
    })
    if (error?.code === '22023') throw new HttpError(400, 'The artist must confirm their email before direct releases can be enabled.')
    dbError(error)
    return NextResponse.json({ artistId, mode })
  } catch (error) {
    return apiError(error)
  }
}
