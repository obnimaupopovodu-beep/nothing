import Link from 'next/link'
import { PortalShell, PortalHeading, EmptyState } from '@/components/portal/PortalShell'
import { ReleaseList } from '@/components/portal/ReleaseList'
import { requireActor } from '@/lib/portal/auth'
import { listReleases } from '@/lib/portal/releases'
export const dynamic = 'force-dynamic'
export default async function AdminPage() {
  const actor = await requireActor('admin')
  const releases = await listReleases(actor, true)
  const queue = releases.filter((r) => ['submitted', 'under_review'].includes(r.status))
  return (
    <PortalShell actor={actor} workspace="admin">
      <PortalHeading
        kicker="Label / Overview"
        title="Keep it moving"
        description="A shared workspace for your artists and their next records."
        action={
          <Link className="portal-button" href="/admin/releases">
            Open release queue ↗
          </Link>
        }
      />
      <section className="portal-stats">
        {[
          ['New submissions', releases.filter((r) => r.status === 'submitted').length],
          ['In review', releases.filter((r) => r.status === 'under_review').length],
          ['Approved', releases.filter((r) => r.status === 'approved').length],
        ].map(([label, count]) => (
          <div key={label}>
            <span className="portal-eyebrow">{label}</span>
            <strong>{String(count).padStart(2, '0')}</strong>
          </div>
        ))}
      </section>
      <div className="portal-section-title">
        <h2>Ready for your attention</h2>
        <Link href="/admin/demos">Demo inbox ↗</Link>
      </div>
      {queue.length ? (
        <ReleaseList team releases={queue} />
      ) : (
        <EmptyState
          title="The queue is clear."
          detail="Submitted releases will appear here, ready for review."
        />
      )}
      <section className="portal-team-note">
        <span className="portal-eyebrow">Your label, connected</span>
        <h2>
          Good records.
          <br />
          Clear direction.
        </h2>
        <p>Review metadata, share useful feedback, and approve releases from one place.</p>
      </section>
    </PortalShell>
  )
}
