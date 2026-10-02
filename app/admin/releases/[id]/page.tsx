import { PortalShell, PortalHeading } from '@/components/portal/PortalShell'
import { ReleaseReview, ReleaseHistory, ReviewActions } from '@/components/portal/ReleaseReview'
import { StatusBadge } from '@/components/portal/ReleaseList'
import { requireActor } from '@/lib/portal/auth'
import { loadRelease } from '@/lib/portal/releases'
export default async function AdminReleasePage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireActor('admin')
  const data = await loadRelease(actor, (await params).id)
  return (
    <PortalShell actor={actor} workspace="admin">
      <PortalHeading
        kicker="Label / Review"
        title={data.release.title || 'Untitled record'}
        description="Check the metadata and credits, then share the next step with the artist."
        action={<StatusBadge status={data.release.status} />}
      />
      <ReleaseReview input={data.input} artworkUrl={data.artworkUrl} />
      <ReviewActions
        id={data.release.id}
        revision={data.release.revision}
        status={data.release.status}
      />
      <ReleaseHistory events={data.events} />
    </PortalShell>
  )
}
