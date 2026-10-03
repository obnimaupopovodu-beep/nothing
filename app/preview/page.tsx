import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { PortalShell, PortalHeading } from '@/components/portal/PortalShell'
import { ReleaseList, StatusBadge } from '@/components/portal/ReleaseList'
import { ProfileForm } from '@/components/portal/ProfileForm'
import { Notifications } from '@/components/portal/Notifications'
import { AdminSubmissionsList } from '@/app/admin/AdminSubmissionsList'
import { FeedbackCarousel } from '@/components/portal/FeedbackCarousel'
import { ReleaseEditor } from '@/components/portal/ReleaseEditor'
import { ReleaseHistory, ReleaseReview, ReviewActions } from '@/components/portal/ReleaseReview'
import type { ReleaseRow } from '@/lib/portal/releases'
import { emptyRelease, type ReleaseInput } from '@/lib/portal/validation'
export const dynamic = 'force-dynamic'
export default async function LocalPreview({
  searchParams,
}: {
  searchParams: Promise<{ workspace?: string; view?: string; record?: string }>
}) {
  if (process.env.NODE_ENV !== 'development') notFound()
  const { workspace: selected, view = 'overview', record } = await searchParams
  const workspace = selected === 'admin' ? 'admin' : 'artists'
  const profile = {
    id: 'preview',
    display_name: 'Naivity',
    legal_first_name: 'Alex',
    legal_last_name: 'Morgan',
    spotify_id: '',
    apple_music_id: '',
  }
  const actor = {
    user: { id: 'preview', email: 'artist@example.com' } as User,
    profile,
    staff: true,
  }
  const sample: ReleaseInput = {
    ...structuredClone(emptyRelease),
    title: 'After the silence',
    genre: 'Melodic House & Techno',
    release_date: '2026-12-11',
    artists: [{ name: 'Naivity', role: 'primary', spotify_id: '', apple_music_id: '' }],
    tracks: [
      {
        title: 'After the silence',
        version: 'Extended Mix',
        explicit: false,
        language: 'Instrumental',
        audio_url: 'https://example.com/preview-master.wav',
        credits: [
          { first_name: 'Alex', last_name: 'Morgan', role: 'composer' },
          { first_name: 'Alex', last_name: 'Morgan', role: 'producer' },
        ],
      },
    ],
  }
  const rows: ReleaseRow[] = [
    {
      id: 'preview-1',
      owner_id: 'preview',
      title: 'After the silence',
      version: '',
      release_type: 'single',
      release_date: '2026-12-11',
      genre: 'Melodic House & Techno',
      notes: '',
      status: workspace === 'admin' ? 'submitted' : 'under_review',
      revision: 1,
      artwork_path: null,
      demo_submission_id: null,
      created_at: '2026-10-01',
      updated_at: '2026-10-02',
    },
    {
      id: 'preview-2',
      owner_id: 'preview',
      title: 'A little further',
      version: '',
      release_type: 'ep',
      release_date: '2026-11-20',
      genre: 'Deep House',
      notes: '',
      status: 'changes_requested',
      revision: 1,
      artwork_path: null,
      demo_submission_id: null,
      created_at: '2026-10-01',
      updated_at: '2026-10-02',
    },
    {
      id: 'preview-3',
      owner_id: 'preview',
      title: 'Blue hour',
      version: '',
      release_type: 'single',
      release_date: null,
      genre: 'Ambient',
      notes: '',
      status: workspace === 'admin' ? 'approved' : 'draft',
      revision: 1,
      artwork_path: null,
      demo_submission_id: null,
      created_at: '2026-10-01',
      updated_at: '2026-10-02',
    },
  ]
  const selectedRecord = rows.find((row) => row.id === record) || rows[0]
  if (view === 'release') {
    sample.title = selectedRecord.title
    sample.genre = selectedRecord.genre
    sample.release_date = selectedRecord.release_date || ''
    sample.release_type = selectedRecord.release_type
    sample.tracks[0].title = selectedRecord.title
    if (selectedRecord.status === 'changes_requested')
      sample.tracks[0].credits = sample.tracks[0].credits.filter(
        (credit) => credit.role !== 'composer'
      )
  }
  return (
    <PortalShell actor={actor} workspace={workspace} preview>
      {view === 'new' ? (
        <>
          <PortalHeading
            kicker="Create / Release"
            title="A new record"
            description="Explore all five steps. Changes here are temporary and cannot be sent to the database."
          />
          <ReleaseEditor initial={sample} preview />
        </>
      ) : view === 'release' ? (
        <>
          <PortalHeading
            kicker="Your release"
            title={sample.title}
            description="A preview of release metadata, credits and feedback."
            action={<StatusBadge status={selectedRecord.status} />}
          />
          <ReleaseReview input={sample} />
          {workspace === 'admin' && (
            <ReviewActions id="preview" revision={1} status={selectedRecord.status} preview />
          )}
          <ReleaseHistory
            events={[
              {
                id: 'preview-event',
                kind: selectedRecord.status,
                message:
                  selectedRecord.status === 'changes_requested'
                    ? 'Add the missing composer credits before resubmitting.'
                    : 'Release details and schedule are available here.',
                created_at: '2026-10-02T10:00:00Z',
              },
            ]}
          />
        </>
      ) : view === 'profile' ? (
        <>
          <PortalHeading
            kicker="Your identity"
            title="Artist profile"
            description="Public artist identity and legal names for credits."
          />
          <ProfileForm initial={profile} email="artist@example.com" preview />
        </>
      ) : view === 'notifications' ? (
        <>
          <PortalHeading
            kicker="Stay in the loop"
            title="Notifications"
            description="Release feedback and next steps, in one place."
          />
          <Notifications
            preview
            items={[
              {
                id: 'sample-1',
                release_id: 'preview-1',
                message:
                  'After the silence is now in review. We are checking your credits and release schedule.',
                created_at: '2026-10-02',
                read_at: null,
              },
              {
                id: 'sample-2',
                release_id: 'preview-2',
                message:
                  'A little further needs an update. Add the missing composer credits before resubmitting.',
                created_at: '2026-10-01',
                read_at: '2026-10-01',
              },
            ]}
          />
        </>
      ) : view === 'artists' ? (
        <>
          <PortalHeading
            kicker="Label / People"
            title="Artists"
            description="Profiles connected to the same release platform."
          />
          <section className="portal-panel portal-padding">
            <article className="portal-artist-row">
              <span className="portal-avatar">N</span>
              <div>
                <h3>Naivity</h3>
                <p className="portal-muted">Sample artist profile · Electronic music</p>
              </div>
            </article>
          </section>
        </>
      ) : view === 'demos' ? (
        <>
          <PortalHeading
            kicker="Label / Discovery"
            title="Demo inbox"
            description="A first listen to the next wave of records. Preview a sample submission below."
          />
          <AdminSubmissionsList
            preview
            initialSubmissions={[
              {
                id: 'sample-demo',
                alias: 'Naivity',
                email: 'artist@example.com',
                scLink: '',
                notes:
                  'An unreleased melodic house demo. Extended mix and instrumental version available.',
                status: 'new',
                createdAt: '2026-10-02T10:00:00Z',
              },
            ]}
          />
        </>
      ) : (
        <>
          <PortalHeading
            kicker={workspace === 'admin' ? 'Label / Overview' : 'Your next chapter'}
            title={
              view === 'releases'
                ? workspace === 'admin'
                  ? 'Release queue'
                  : 'My releases'
                : workspace === 'admin'
                  ? 'Keep it moving'
                  : 'Welcome, Naivity'
            }
            description={
              workspace === 'admin'
                ? 'Review records, share useful feedback, and keep releases moving.'
                : 'Keep your records moving. From the first draft to release day.'
            }
            action={
              <Link
                className="portal-button"
                href={`/preview?workspace=${workspace}&view=${workspace === 'admin' ? 'releases' : 'new'}`}
              >
                {workspace === 'admin' ? 'Open release queue ↗' : 'New release ＋'}
              </Link>
            }
          />
          {view !== 'releases' && (
            <section className="portal-stats">
              {(workspace === 'admin'
                ? [
                    ['New submissions', '01'],
                    [
                      'In review',
                      String(rows.filter((row) => row.status === 'under_review').length).padStart(
                        2,
                        '0'
                      ),
                    ],
                    ['Approved', '01'],
                  ]
                : [
                    ['Your releases', '03'],
                    ['In progress', '01'],
                    ['Needs attention', '01'],
                  ]
              ).map(([label, count]) => (
                <div key={label}>
                  <span className="portal-eyebrow">{label}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </section>
          )}
          <div className="portal-section-title">
            <h2>{workspace === 'admin' ? 'Ready for your attention' : 'Your records'}</h2>
            <Link href={`/preview?workspace=${workspace}&view=releases`}>View all ↗</Link>
          </div>
          <ReleaseList
            releases={
              view === 'overview' && workspace === 'admin'
                ? rows.filter((row) => ['submitted', 'under_review'].includes(row.status))
                : rows
            }
            team={workspace === 'admin'}
            preview
          />
          {view === 'overview' && <FeedbackCarousel workspace={workspace} />}
          {workspace === 'admin' ? (
            <section className="portal-team-note">
              <span className="portal-eyebrow">Your label, connected</span>
              <h2>
                Good records.
                <br />
                Clear direction.
              </h2>
              <p>Review metadata, share useful feedback, and approve releases from one place.</p>
            </section>
          ) : (
            <section className="portal-guide">
              <span className="portal-eyebrow">From idea to release</span>
              <div>
                {[
                  ['01', 'Make it yours', 'Add release details and every credit.'],
                  ['02', 'Send it through', 'Review and submit to the label.'],
                  ['03', 'Keep it moving', 'Follow feedback and delivery.'],
                ].map(([n, title, text]) => (
                  <article key={n}>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </PortalShell>
  )
}
