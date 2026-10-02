import { NextResponse } from 'next/server'
import { apiActor, apiError, checkOrigin, dbError } from '@/lib/portal/http'
export async function POST(request: Request) {
  try {
    checkOrigin(request)
    const actor = await apiActor()
    const { error } = await actor.client.rpc('label_read_notifications')
    dbError(error)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return apiError(error)
  }
}
