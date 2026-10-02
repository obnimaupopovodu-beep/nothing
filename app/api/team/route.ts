import { NextResponse } from 'next/server'
import { z } from 'zod'
import { apiActor, apiError, dbError, readJson } from '@/lib/portal/http'

export async function POST(request: Request) {
  try {
    const { email, role } = z.object({ email: z.email().max(254), role: z.enum(['editor', 'viewer']) })
      .strict().parse(await readJson(request, 2048))
    const actor = await apiActor()
    const { error } = await actor.client.rpc('label_add_team_member', {
      member_email: email.toLowerCase(), member_role: role,
    })
    if (error?.code === '22023')
      return NextResponse.json({ error: 'This person must register and confirm their email before joining your team.' }, { status: 400 })
    dbError(error)
    return NextResponse.json({ ok: true })
  } catch (error) { return apiError(error) }
}

export async function DELETE(request: Request) {
  try {
    const { member_id } = z.object({ member_id: z.uuid() }).strict().parse(await readJson(request, 2048))
    const actor = await apiActor()
    const { error } = await actor.client.rpc('label_remove_team_member', { target: member_id })
    dbError(error)
    return NextResponse.json({ ok: true })
  } catch (error) { return apiError(error) }
}
