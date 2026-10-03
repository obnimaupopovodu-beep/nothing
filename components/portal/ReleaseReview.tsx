'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ReleaseInput, ReleaseStatus } from '@/lib/portal/validation'
import { statusLabels } from '@/lib/portal/validation'
export function ReleaseReview({
  input,
  artworkUrl,
}: {
  input: ReleaseInput
  artworkUrl?: string | null
}) {
  return (
    <section className="portal-review">
      <div className="portal-review-summary">
        <div className="portal-review-art">
          {artworkUrl ? (
            <img src={artworkUrl} alt="Release artwork" />
          ) : (
            <span>
              NO ARTWORK
              <br />
              YET.
            </span>
          )}
        </div>
        <div>
          <p className="portal-eyebrow">{input.release_type}</p>
          <h2>{input.title || 'Untitled release'}</h2>
          <p>
            {input.artists
              .filter((a) => a.role === 'primary')
              .map((a) => a.name)
              .join(' & ') || 'Primary artist pending'}
          </p>
          <p className="portal-muted">
            {input.version || 'Original'} · {input.genre || 'Genre pending'} ·{' '}
            {input.release_date || 'Date pending'}
          </p>
        </div>
      </div>
      <div className="portal-review-details">
        <h3>Artists</h3>
        {input.artists.map((a, i) => (
          <div className="portal-review-line" key={i}>
            <strong>{a.name || 'Name pending'}</strong>
            <span>{a.role} artist</span>
            <small>
              Spotify: {a.spotify_id || 'Not added'} · Apple Music:{' '}
              {a.apple_music_id || 'Not added'}
            </small>
          </div>
        ))}
        <h3>Tracks & credits</h3>
        {input.tracks.map((t, i) => (
          <div className="portal-review-track" key={i}>
            <div>
              <strong>
                {String(i + 1).padStart(2, '0')} / {t.title || 'Untitled track'}
              </strong>
              <span>
                {t.version || 'Original'} · {t.language || 'Language pending'}
                {t.explicit ? ' · Explicit' : ''}
              </span>
              {t.audio_url && <a href={t.audio_url} target="_blank" rel="noopener noreferrer">WAV / FLAC file ↗</a>}
            </div>
            {t.credits.map((c, ci) => (
              <p key={ci}>
                <span>{c.role.replaceAll('_', ' ')}</span>
                <strong>{`${c.first_name} ${c.last_name}`.trim() || 'Legal name pending'}</strong>
              </p>
            ))}
          </div>
        ))}
        {input.notes && (
          <>
            <h3>Notes for the label</h3>
            <p className="portal-preserve">{input.notes}</p>
          </>
        )}
      </div>
    </section>
  )
}
export function ReleaseHistory({
  events,
}: {
  events: { id: string; kind: string; message: string; created_at: string }[]
}) {
  return (
    <section className="portal-history">
      <h2>Release history</h2>
      {events.map((event) => (
        <article key={event.id}>
          <i />
          <div>
            <strong>
              {statusLabels[event.kind as ReleaseStatus] || event.kind.replaceAll('_', ' ')}
            </strong>
            <time>
              {new Date(event.created_at).toISOString().slice(0, 16).replace('T', ' ')} UTC
            </time>
            {event.message && <p className="portal-preserve">{event.message}</p>}
          </div>
        </article>
      ))}
      {!events.length && <p className="portal-muted">No updates yet.</p>}
    </section>
  )
}
export function ReviewActions({
  id,
  revision,
  status,
  preview = false,
}: {
  id: string
  revision: number
  status: ReleaseStatus
  preview?: boolean
}) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const targets =
    status === 'submitted'
      ? ['under_review']
      : status === 'under_review'
        ? ['changes_requested', 'approved']
        : status === 'approved'
          ? ['delivered']
          : []
  async function change(target: string) {
    if (preview) return
    setError('')
    if (target === 'changes_requested' && !message.trim()) {
      setError('Describe what the artist needs to change.')
      return
    }
    setBusy(true)
    try {
      const response = await fetch(`/api/releases/${id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revision, target, message }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setMessage('')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update release.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="portal-panel portal-padding">
      <p className="portal-eyebrow">Review / Decision</p>
      <h2>Move the record forward.</h2>
      {targets.length ? (
        <>
          <label>
            Feedback shared with the artist
            <textarea
              className="portal-input"
              rows={4}
              maxLength={4000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Be specific about any changes required."
              disabled={busy || preview}
            />
          </label>
          <div className="portal-action-row">
            {targets.map((target) => (
              <button
                className={`portal-button ${target === 'changes_requested' ? 'secondary' : ''}`}
                key={target}
                disabled={busy || preview}
                onClick={() => change(target)}
              >
                {target === 'under_review'
                  ? 'Start review'
                  : target === 'changes_requested'
                    ? 'Request changes'
                    : target === 'approved'
                      ? 'Approve release'
                      : 'Mark delivered'}{' '}
                ↗
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="portal-muted">
          {status === 'changes_requested'
            ? 'Waiting for the artist to update and resubmit this release.'
            : 'This release has completed the current workflow.'}
        </p>
      )}
      {error && (
        <p className="portal-alert" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
