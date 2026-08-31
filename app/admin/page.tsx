import Link from 'next/link'
import { listDemoSubmissions } from '@/lib/demoSubmissions'
import { AdminSubmissionsList } from './AdminSubmissionsList'

export const dynamic = 'force-dynamic'

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

        {configured && !loadError && <AdminSubmissionsList initialSubmissions={submissions} />}
      </div>
    </main>
  )
}
