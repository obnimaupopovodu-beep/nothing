import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import sharp from 'sharp'
import { z } from 'zod'
import { apiActor, apiError, readJson, dbError, HttpError } from '@/lib/portal/http'
import { createSupabaseServiceClient } from '@/lib/supabase/server'
export const runtime = 'nodejs'
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = z.uuid().parse((await params).id)
    const body = z
      .object({
        action: z.enum(['prepare', 'complete']),
        revision: z.number().int().positive(),
        mime: z.enum(['image/jpeg', 'image/png']).optional(),
        path: z.string().max(300).optional(),
      })
      .strict()
      .parse(await readJson(request, 2048))
    const actor = await apiActor()
    const { data: release, error } = await actor.client
      .from('label_releases')
      .select('owner_id,status,revision,creation_source')
      .eq('id', id)
      .maybeSingle()
    dbError(error)
    if (!release) throw new HttpError(404, 'Release not found.')
    const { data: membership, error: membershipError } = release.owner_id === actor.user.id
      ? { data: null, error: null }
      : await actor.client.from('label_team_members').select('role')
          .eq('owner_id', release.owner_id).eq('member_id', actor.user.id).maybeSingle()
    dbError(membershipError)
    if (
      (release.owner_id !== actor.user.id && membership?.role !== 'editor' && !(actor.staff && release.creation_source === 'label')) ||
      !['draft', 'changes_requested'].includes(release.status)
    )
      throw new HttpError(403, 'Artwork cannot be changed for this release.')
    if (body.revision !== release.revision)
      throw new HttpError(409, 'Reload this release before uploading.')
    const service = createSupabaseServiceClient()
    if (body.action === 'prepare') {
      if (!body.mime) throw new HttpError(400, 'Choose a JPEG or PNG file.')
      const { data: path, error: ticketError } = await actor.client.rpc('label_begin_artwork', {
        rid: id,
        expected_revision: body.revision,
        mime: body.mime,
      })
      dbError(ticketError)
      const { data, error: signedError } = await service.storage
        .from('label-artwork')
        .createSignedUploadUrl(path, { upsert: false })
      if (signedError || !data) {
        await service.from('label_artwork_uploads').delete().eq('path', path)
        throw new HttpError(503, 'Unable to start upload.')
      }
      return NextResponse.json({ path, signedUrl: data.signedUrl })
    }
    const path = body.path
    if (!path) throw new HttpError(400, 'Upload path is required.')
    const { data: ticket, error: ticketError } = await actor.client
      .from('label_artwork_uploads')
      .select('path')
      .eq('path', path)
      .eq('release_id', id)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()
    dbError(ticketError)
    if (!ticket) throw new HttpError(403, 'This upload has expired. Upload the file again.')
    const { data: blob, error: downloadError } = await service.storage
      .from('label-artwork')
      .download(path)
    if (downloadError || !blob) throw new HttpError(400, 'The upload is incomplete. Try again.')
    let attached = false
    try {
      if (blob.size > 20 * 1024 * 1024) throw new HttpError(413, 'Artwork must be under 20 MB.')
      const file = Buffer.from(await blob.arrayBuffer())
      let metadata
      try {
        metadata = await sharp(file, { limitInputPixels: 36_000_000, failOn: 'warning' }).metadata()
      } catch {
        throw new HttpError(400, 'Choose a valid JPEG or PNG file.')
      }
      if (
        !['jpeg', 'png'].includes(metadata.format || '') ||
        !['srgb', 'rgb'].includes(metadata.space || '') ||
        !metadata.width ||
        metadata.width < 3000 ||
        metadata.width !== metadata.height ||
        (metadata.pages ?? 1) > 1
      )
        throw new HttpError(400, 'Artwork must be a square RGB JPEG or PNG, 3000–6000 px.')
      try {
        await sharp(file, { limitInputPixels: 36_000_000, failOn: 'warning' }).stats()
      } catch {
        throw new HttpError(400, 'This image could not be decoded.')
      }
      const result = await service.rpc('label_attach_artwork', {
        rid: id,
        expected_revision: body.revision,
        owner: actor.user.id,
        path,
        sha: createHash('sha256').update(file).digest('hex'),
      })
      dbError(result.error)
      attached = true
      const { data: signed } = await actor.client.storage
        .from('label-artwork')
        .createSignedUrl(path, 300)
      return NextResponse.json({ revision: body.revision + 1, url: signed?.signedUrl ?? null })
    } finally {
      if (!attached) {
        await service.storage.from('label-artwork').remove([path])
        await service.from('label_artwork_uploads').delete().eq('path', path)
      }
    }
  } catch (error) {
    return apiError(error)
  }
}
