import { NextResponse } from 'next/server'
import { z } from 'zod'
import { apiActor, apiError, dbError, HttpError, readJson } from '@/lib/portal/http'

export async function POST(request: Request) {
  try {
    const { email, role } = z.object({ email: z.email().max(254), role: z.enum(['admin', 'label_manager']) })
      .strict().parse(await readJson(request, 2048))
    const actor = await apiActor(true)
    if (!actor.admin) throw new HttpError(403, 'Admin access is required.')
    const { error } = await actor.client.rpc('label_add_staff', { member_email: email.toLowerCase(), member_role: role })
    if (error?.code === '22023') return NextResponse.json({ error: 'This person must register and confirm their email first.' }, { status: 400 })
    dbError(error)
    return NextResponse.json({ ok: true })
  } catch (error) { return apiError(error) }
}

export async function DELETE(request: Request) {
  try {
    const { user_id, role } = z.object({ user_id: z.uuid(), role: z.enum(['admin', 'label_manager']) })
      .strict().parse(await readJson(request, 2048))
    const actor = await apiActor(true)
    if (!actor.admin) throw new HttpError(403, 'Admin access is required.')
    const { error } = await actor.client.rpc('label_remove_staff', { target: user_id, member_role: role })
    dbError(error)
    return NextResponse.json({ ok: true })
  } catch (error) { return apiError(error) }
}
