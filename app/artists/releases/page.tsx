import Link from 'next/link'
import { PortalHeading, EmptyState } from '@/components/portal/PortalShell'
import { ReleaseList } from '@/components/portal/ReleaseList'
import { requireActor } from '@/lib/portal/auth'
import { listReleases } from '@/lib/portal/releases'
import { getArtistReleaseMode } from '@/lib/portal/releasePermissions'
export default async function ReleasesPage() {
  const actor = await requireActor()
  const [releases, mode] = await Promise.all([listReleases(actor), getArtistReleaseMode(actor)])
  const direct = mode !== 'submission_required'
  return (
    <>
      <PortalHeading
        kicker="Your catalogue"
        title="Our releases"
        description={mode === 'once' ? 'Your records and team releases. You can create one new release without demo approval.' : mode === 'unlimited' ? 'Your records and team releases. Direct releases without demo approval are enabled.' : 'Your records and the releases shared by your artist team.'}
        action={
          <Link className="portal-button" href={direct ? '/artists/releases/new' : '/artists/submissions'}>
            {direct ? 'New release ↗' : 'Your submissions ↗'}
          </Link>
        }
      />
      {releases.length ? (
        <ReleaseList releases={releases} />
      ) : (
        <EmptyState
          title="A blank side. A new start."
          detail={direct ? 'Create your first release directly. Add the credits, artwork and audio links before sending it to the label.' : 'Approved demos become release drafts here once you add their details.'}
          action={
            <Link className="portal-button" href={direct ? '/artists/releases/new' : '/artists/submissions'}>
              {direct ? 'New release ↗' : 'Submit a demo ↗'}
            </Link>
          }
        />
      )}
    </>
  )
}
