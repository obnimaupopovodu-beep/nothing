import Link from 'next/link'
import { PortalHeading, EmptyState } from '@/components/portal/PortalShell'
import { ReleaseList } from '@/components/portal/ReleaseList'
import { requireActor } from '@/lib/portal/auth'
import { listReleases } from '@/lib/portal/releases'
import { listArtistDemoSubmissions } from '@/lib/demoSubmissions'
import { ArtistSubmissions } from '@/components/portal/ArtistSubmissions'
export default async function ArtistDashboard() {
  const actor = await requireActor()
  const [releases, submissions] = await Promise.all([
    listReleases(actor), listArtistDemoSubmissions(actor.client, actor.user.id),
  ])
  return (
    <>
      <PortalHeading
        kicker="Your next chapter"
        title={`Welcome${actor.profile?.display_name ? ', ' + actor.profile.display_name : ' back'}`}
        description="Send a first listen, follow the label's response, then build your release."
        action={
          <Link className="portal-button" href="/artists/submissions">
            Submit a demo <span>↗</span>
          </Link>
        }
      />
      <section className="portal-stats">
        {[
          ['Your demos', submissions.length],
          [
            'Under review',
            submissions.filter((s) => s.status === 'new').length,
          ],
          ['Ready for details', submissions.filter((s) => s.status === 'approved' && !s.releaseId).length],
        ].map(([label, count]) => (
          <div key={label}>
            <span className="portal-eyebrow">{label}</span>
            <strong>{String(count).padStart(2, '0')}</strong>
          </div>
        ))}
      </section>
      <div className="portal-section-title">
        <h2>Your submissions</h2>
        <Link href="/artists/submissions">View all ↗</Link>
      </div>
      <ArtistSubmissions initialSubmissions={submissions.slice(0, 3)} email={actor.user.email || ''} initialAlias={actor.profile?.display_name || ''} />
      <div className="portal-section-title">
        <h2>Your records</h2>
        <Link href="/artists/releases">View all ↗</Link>
      </div>
      {releases.length ? (
        <ReleaseList releases={releases.slice(0, 5)} />
      ) : (
        <EmptyState
          title="The next one is yours."
          detail="When your demo is approved, add the credits, artwork and delivery links here."
          action={
            <Link className="portal-button" href="/artists/submissions">
              Submit a demo ↗
            </Link>
          }
        />
      )}
      <section className="portal-guide">
        <span className="portal-eyebrow">From idea to release</span>
        <div>
          {[
            ['01', 'Send a first listen', 'Share a SoundCloud link with the label.'],
            ['02', 'Build the release', 'After approval, add artists, credits and audio links.'],
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
