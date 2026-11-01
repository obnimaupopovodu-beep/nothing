import { PortalHeading } from '@/components/portal/PortalShell'
import { ReleaseEditor } from '@/components/portal/ReleaseEditor'
import { requireActor } from '@/lib/portal/auth'
import { emptyRelease } from '@/lib/portal/validation'
import { notFound, redirect } from 'next/navigation'
import { z } from 'zod'
import { getArtistReleaseMode } from '@/lib/portal/releasePermissions'
export default async function NewReleasePage({ searchParams }: { searchParams: Promise<{ submission?: string }> }) {
  const actor = await requireActor()
  const { submission } = await searchParams
  let demoAlias = ''
  let description = 'Your demo has been approved. Add the metadata and delivery links; you can save and come back at any time.'
  if (submission) {
    if (!z.uuid().safeParse(submission).success) notFound()
    const { data: demo, error } = await actor.client.from('demo_submissions').select('id,alias,status')
      .eq('id', submission).eq('artist_user_id', actor.user.id).maybeSingle()
    if (error || !demo || demo.status !== 'approved') notFound()
    demoAlias = demo.alias
    const { data: existing, error: linkedError } = await actor.client.from('label_releases')
      .select('id').eq('demo_submission_id', demo.id).maybeSingle()
    if (linkedError) throw new Error('Unable to load the linked release.')
    if (existing) redirect(`/artists/releases/${existing.id}`)
  } else {
    const mode = await getArtistReleaseMode(actor)
    if (mode === 'submission_required') redirect('/artists/submissions')
    description = mode === 'once'
      ? 'The label enabled one release without a demo. This permission is used when you first save this draft; you can continue editing it afterwards.'
      : 'Direct releases are enabled for your account. Add the metadata and delivery links; no demo approval is required.'
  }
  const initial = structuredClone(emptyRelease)
  initial.artists[0].name = actor.profile?.display_name || demoAlias
  initial.artists[0].spotify_id = actor.profile?.spotify_id || ''
  initial.artists[0].apple_music_id = actor.profile?.apple_music_id || ''
  initial.tracks[0].credits[0].first_name = actor.profile?.legal_first_name || ''
  initial.tracks[0].credits[0].last_name = actor.profile?.legal_last_name || ''
  return (
    <>
      <PortalHeading
        kicker="Create / Release"
        title="A new record"
        description={description}
      />
      <ReleaseEditor initial={initial} submissionId={submission} />
    </>
  )
}
