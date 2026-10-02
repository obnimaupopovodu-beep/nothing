import { NextResponse } from 'next/server'
import { z } from 'zod'
import { apiActor, apiError, checkOrigin, readJson } from '@/lib/portal/http'
import { deleteDemoSubmission, updateDemoSubmissionStatus } from '@/lib/demoSubmissions'
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id=z.uuid().parse((await params).id)
    const {status}=z.object({status:z.enum(['new','approved','rejected'])}).strict().parse(await readJson(request,1024))
    const actor=await apiActor(true)
    return NextResponse.json({submission:await updateDemoSubmissionStatus(actor.client,id,status)})
  } catch(error) { return apiError(error) }
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { checkOrigin(request); const id=z.uuid().parse((await params).id); const actor=await apiActor(true); await deleteDemoSubmission(actor.client,id); return NextResponse.json({ok:true}) } catch(error) { return apiError(error) }
}
