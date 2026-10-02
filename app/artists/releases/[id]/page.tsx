import { PortalHeading } from '@/components/portal/PortalShell'
import { ReleaseEditor } from '@/components/portal/ReleaseEditor'
import { ReleaseReview, ReleaseHistory } from '@/components/portal/ReleaseReview'
import { requireActor } from '@/lib/portal/auth'
import { loadRelease } from '@/lib/portal/releases'
import { StatusBadge } from '@/components/portal/ReleaseList'
export default async function ReleasePage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireActor()
  const data = await loadRelease(actor, (await params).id)
  const { data: membership } = data.release.owner_id === actor.user.id
    ? { data: null }
    : await actor.client.from('label_team_members').select('role')
        .eq('owner_id', data.release.owner_id).eq('member_id', actor.user.id).maybeSingle()
  const editable =
    (data.release.owner_id === actor.user.id || membership?.role === 'editor') &&
    ['draft', 'changes_requested'].includes(data.release.status)
  return (
    <>
      <PortalHeading
        kicker="Your release"
        title={data.release.title || 'Untitled record'}
        description={
          editable
            ? 'Your draft, your pace. Save your changes before sending it through.'
            : 'Follow the record through review and delivery.'
        }
        action={<StatusBadge status={data.release.status} />}
      />
      {data.release.status === 'changes_requested' && (
        <div className="portal-alert">
          The label requested changes. Check the feedback below, update the release, and submit it
          again.
        </div>
      )}
      {editable ? (
        <ReleaseEditor
          initial={data.input}
          id={data.release.id}
          initialRevision={data.release.revision}
          initialArtwork={data.artworkUrl}
        />
      ) : (
        <ReleaseReview input={data.input} artworkUrl={data.artworkUrl} />
      )}
      <ReleaseHistory events={data.events} />
    </>
  )
}
