'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import type { ArtistDemoSubmission, DemoSubmission } from '@/lib/demoSubmissions'

const statusText: Record<string, string> = {
  new: 'In review',
  approved: 'Approved',
  rejected: 'Not selected',
}

export function ArtistSubmissions({
  initialSubmissions,
  email,
  initialAlias,
  showForm = false,
  preview = false,
}: {
  initialSubmissions: ArtistDemoSubmission[]
  email: string
  initialAlias: string
  showForm?: boolean
  preview?: boolean
}) {
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [alias, setAlias] = useState(initialAlias)
  const [scLink, setScLink] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (preview) return
    if (!alias.trim()) return setError('Add your artist name.')
    if (!/^https?:\/\/(www\.)?(soundcloud\.com|on\.soundcloud\.com)\/.+/i.test(scLink.trim())) {
      return setError('Add a SoundCloud track link.')
    }
    setBusy(true)
    try {
      const response = await fetch('/api/demo-submissions/artist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias, scLink, notes }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to send your demo.')
      setSubmissions((current) => [{ ...(result.submission as DemoSubmission), releaseId: null }, ...current])
      setScLink('')
      setNotes('')
      setSuccess(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to send your demo.')
    } finally {
      setBusy(false)
    }
  }

  return <>
    {showForm && <section className="portal-panel portal-demo-form">
      <div className="portal-demo-form__intro">
        <span className="portal-eyebrow">01 / First listen</span>
        <h2>Send the sound first.</h2>
        <p>Share a SoundCloud link. When the label approves your demo, you can add the full release details and a WAV or FLAC delivery link for each track.</p>
        {preview && <p className="portal-muted">Preview only · Sending is disabled.</p>}
      </div>
      <form onSubmit={submit} className="portal-demo-form__fields">
        <div className="portal-form-grid">
          <label>Artist name
            <input className="portal-input" value={alias} onChange={(event) => setAlias(event.target.value)} maxLength={120} required placeholder="Your artist name" />
          </label>
          <label>Email address
            <input className="portal-input" value={email} readOnly type="email" />
            <small>We use the address on your account so this demo stays connected to you.</small>
          </label>
          <label className="portal-full">SoundCloud track link
            <input className="portal-input" value={scLink} onChange={(event) => setScLink(event.target.value)} type="url" inputMode="url" maxLength={2048} required placeholder="https://soundcloud.com/your-track" />
          </label>
          <label className="portal-full">Anything we should know? <small>Optional</small>
            <textarea className="portal-input" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={4000} rows={3} placeholder="A little context, plans or a deadline" />
          </label>
        </div>
        {error && <p className="portal-demo-form__error" role="alert">{error}</p>}
        {success && <p className="portal-demo-form__success" role="status">Your demo is in. You can follow its status below.</p>}
        <button type="submit" className="portal-button" disabled={busy || preview}>{busy ? 'Sending…' : 'Send your demo ↗'}</button>
      </form>
    </section>}
    <section className="portal-demo-list" aria-label="Your demo submissions">
      {submissions.map((submission, index) => <article className="portal-demo-row" key={submission.id}>
        <div className="portal-demo-row__number">{String(submissions.length - index).padStart(2, '0')}</div>
        <div className="portal-demo-row__main">
          <span className="portal-eyebrow">{submission.alias} · {new Date(submission.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</span>
          <h3>{submission.scLink.split('/').filter(Boolean).at(-1)?.replaceAll('-', ' ') || 'Your demo'}</h3>
          <a href={submission.scLink} target="_blank" rel="noopener noreferrer">Listen on SoundCloud ↗</a>
        </div>
        <span className={`portal-demo-status portal-demo-status--${submission.status}`}>{statusText[submission.status] || submission.status}</span>
        <div className="portal-demo-row__action">
          {submission.releaseId ? <Link className="portal-button secondary" href={preview ? '/preview?view=release' : `/artists/releases/${submission.releaseId}`}>Continue release ↗</Link>
            : submission.status === 'approved' ? <Link className="portal-button" href={preview ? '/preview?view=new' : `/artists/releases/new?submission=${submission.id}`}>Add release details ↗</Link>
              : <span className="portal-muted">{submission.status === 'rejected' ? 'You can send another demo.' : 'Waiting for the label'}</span>}
        </div>
      </article>)}
      {!submissions.length && <div className="portal-demo-list__empty">No demos yet. Send your first track to begin.</div>}
    </section>
  </>
}
