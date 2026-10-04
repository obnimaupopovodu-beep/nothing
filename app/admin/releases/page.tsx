import Link from 'next/link'
import { PortalShell, PortalHeading, EmptyState } from '@/components/portal/PortalShell'
import { ReleaseList } from '@/components/portal/ReleaseList'
import { requireActor } from '@/lib/portal/auth'
import { listReleases } from '@/lib/portal/releases'
export default async function ReleaseQueuePage() {
  const actor = await requireActor('admin')
  const releases = await listReleases(actor, true)
  return (
    <PortalShell actor={actor} workspace="admin">
      <PortalHeading
        kicker="Label / Records"
        title="Release queue"
        description="Review submissions, request changes, and add records agreed outside the platform."
        action={<Link className="portal-button" href="/admin/releases/new">Add release</Link>}
      />
      {releases.length ? (
        <ReleaseList releases={releases} team />
      ) : (
        <EmptyState
          title="Waiting for the next record."
          detail="Artist submissions will arrive here after they are sent for review."
        />
      )}
    </PortalShell>
  )
}
