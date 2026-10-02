import { NextResponse } from 'next/server'
import { z } from 'zod'
import { apiActor, apiError, dbError, readJson } from '@/lib/portal/http'
export async function PUT(request: Request) {
  try {
    const text = (max: number) => z.string().trim().max(max)
    const payload = z
      .object({
        display_name: text(120),
        legal_first_name: text(100),
        legal_last_name: text(100),
        spotify_id: text(100),
        apple_music_id: text(100),
      })
      .strict()
      .parse(await readJson(request, 8192))
    const actor = await apiActor()
    const { error } = await actor.client.rpc('label_save_profile', { payload })
    dbError(error)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return apiError(error)
  }
}
