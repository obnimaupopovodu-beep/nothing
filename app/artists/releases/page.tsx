import Link from 'next/link'
import { PortalHeading, EmptyState } from '@/components/portal/PortalShell'
import { ReleaseList } from '@/components/portal/ReleaseList'
import { requireActor } from '@/lib/portal/auth'
import { listReleases } from '@/lib/portal/releases'
export default async function ReleasesPage() {
  const actor = await requireActor()
  const releases = await listReleases(actor)
  return (
    <>
      <PortalHeading
        kicker="Your catalogue"
        title="Our releases"
        description="Your records and the releases shared by your artist team."
        action={
          <Link className="portal-button" href="/artists/submissions">
            Your submissions ↗
          </Link>
        }
      />
      {releases.length ? (
        <ReleaseList releases={releases} />
      ) : (
        <EmptyState
          title="A blank side. A new start."
          detail="Approved demos become release drafts here once you add their details."
          action={
            <Link className="portal-button" href="/artists/submissions">
              Submit a demo ↗
            </Link>
          }
        />
      )}
    </>
  )
}
