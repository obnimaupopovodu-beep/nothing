import Link from 'next/link'
import { listDemoSubmissions } from '@/lib/demoSubmissions'

export const dynamic = 'force-dynamic'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default async function AdminPage() {
  let configured = false
  let loadError = ''
  let submissions: Awaited<ReturnType<typeof listDemoSubmissions>>['submissions'] = []

  try {
    const result = await listDemoSubmissions()
    configured = result.configured
    submissions = result.submissions
  } catch {
    configured = true
    loadError = 'Could not load submissions from Supabase.'
  }

  return (
    <main className="band admin-page">
      <div className="shell">
        <header className="admin-hero">
          <div className="admin-actions">
            <Link href="/" className="admin-back">Back to site</Link>
            <form action="/api/admin/logout" method="post">
              <button type="submit" className="admin-logout">Log out</button>
            </form>
          </div>
          <div>
            <p className="kicker"><i aria-hidden="true" />Admin</p>
            <h1 className="admin-title">Demo inbox</h1>
          </div>
          <p className="admin-lede">
            Review aliases, emails, SoundCloud links, and notes from artists who submitted a track.
          </p>
        </header>

        {!configured && (
          <section className="admin-empty">
            <span className="admin-empty-label">Supabase not connected</span>
            <h2>Connect the submissions table to start receiving demos.</h2>
            <p>
              Add Supabase env variables and create the `demo_submissions` table. Once connected,
              incoming form submissions will appear here automatically.
            </p>
          </section>
        )}

        {loadError && (
          <section className="admin-empty">
            <span className="admin-empty-label">Load error</span>
            <h2>{loadError}</h2>
            <p>Check the Supabase table name, API keys, and row-level security policy.</p>
          </section>
        )}

        {configured && !loadError && submissions.length === 0 && (
          <section className="admin-empty">
            <span className="admin-empty-label">Clean slate</span>
            <h2>No demos yet.</h2>
            <p>When an artist submits the form at the bottom of the site, the entry will land here.</p>
          </section>
        )}

        {submissions.length > 0 && (
          <section className="admin-list" aria-label="Demo submissions">
            {submissions.map((submission, index) => (
              <article key={submission.id} className="admin-card">
                <div className="admin-card-top">
                  <span className="admin-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="admin-status">{submission.status}</span>
                </div>

                <div className="admin-main">
                  <div>
                    <span className="admin-label">Alias</span>
                    <h2>{submission.alias}</h2>
                  </div>

                  <div className="admin-grid">
                    <div>
                      <span className="admin-label">Email</span>
                      <a href={`mailto:${submission.email}`}>{submission.email}</a>
                    </div>
                    <div>
                      <span className="admin-label">SoundCloud</span>
                      <a href={submission.scLink} target="_blank" rel="noopener noreferrer">
                        Open track
                      </a>
                    </div>
                    <div>
                      <span className="admin-label">Submitted</span>
                      <span>{formatDate(submission.createdAt)}</span>
                    </div>
                  </div>

                  <div>
                    <span className="admin-label">Notes</span>
                    <p>{submission.notes || 'No notes added.'}</p>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
