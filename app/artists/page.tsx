import Link from 'next/link'
import { PortalHeading, EmptyState } from '@/components/portal/PortalShell'
import { ReleaseList } from '@/components/portal/ReleaseList'
import { requireActor } from '@/lib/portal/auth'
import { listReleases } from '@/lib/portal/releases'
export default async function ArtistDashboard() {
  const actor = await requireActor()
  const releases = await listReleases(actor)
  return (
    <>
      <PortalHeading
        kicker="Your next chapter"
        title={`Welcome${actor.profile?.display_name ? ', ' + actor.profile.display_name : ' back'}`}
        description="Keep your records moving. From the first draft to release day."
        action={
          <Link className="portal-button" href="/artists/releases/new">
            New release <span>＋</span>
          </Link>
        }
      />
      <section className="portal-stats">
        {[
          ['Your releases', releases.length],
          [
            'In progress',
            releases.filter((r) => ['submitted', 'under_review'].includes(r.status)).length,
          ],
          ['Needs your attention', releases.filter((r) => r.status === 'changes_requested').length],
        ].map(([label, count]) => (
          <div key={label}>
            <span className="portal-eyebrow">{label}</span>
            <strong>{String(count).padStart(2, '0')}</strong>
          </div>
        ))}
      </section>
      <div className="portal-section-title">
        <h2>Your records</h2>
        <Link href="/artists/releases">View all ↗</Link>
      </div>
      {releases.length ? (
        <ReleaseList releases={releases.slice(0, 5)} />
      ) : (
        <EmptyState
          title="The next one is yours."
          detail="Create a release, collect your credits, and send it to the label when you’re ready."
          action={
            <Link className="portal-button" href="/artists/releases/new">
              Start a release ↗
            </Link>
          }
        />
      )}
      <section className="portal-guide">
        <span className="portal-eyebrow">From idea to release</span>
        <div>
          {[
            ['01', 'Make it yours', 'Add the release, artists and track credits.'],
            ['02', 'Send it through', 'Review every detail and submit to the label.'],
            ['03', 'Keep it moving', 'Follow feedback and release progress here.'],
          ].map(([num, title, desc]) => (
            <article key={num}>
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
