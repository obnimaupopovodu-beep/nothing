'use client'

import { useState } from 'react'
import type { DemoSubmission, DemoSubmissionStatus } from '@/lib/demoSubmissions'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

type RowState = 'idle' | 'working' | 'error'

export function AdminSubmissionsList({ initialSubmissions }: { initialSubmissions: DemoSubmission[] }) {
  const [submissions, setSubmissions] = useState<DemoSubmission[]>(initialSubmissions)
  const [rowState, setRowState] = useState<Record<string, RowState>>({})
  const [rowError, setRowError] = useState<Record<string, string>>({})

  const setState = (id: string, state: RowState, error = '') => {
    setRowState((prev) => ({ ...prev, [id]: state }))
    setRowError((prev) => ({ ...prev, [id]: error }))
  }

  const updateStatus = async (id: string, status: DemoSubmissionStatus) => {
    setState(id, 'working')
    try {
      const response = await fetch(`/api/demo-submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error ?? 'Unable to update submission.')
      }

      const { submission } = (await response.json()) as { submission: DemoSubmission }
      setSubmissions((prev) => prev.map((item) => (item.id === id ? submission : item)))
      setState(id, 'idle')
    } catch (err) {
      setState(id, 'error', err instanceof Error ? err.message : 'Unable to update submission.')
    }
  }

  const remove = async (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Delete this submission permanently?')) {
      return
    }

    setState(id, 'working')
    try {
      const response = await fetch(`/api/demo-submissions/${id}`, { method: 'DELETE' })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error ?? 'Unable to delete submission.')
      }

      setSubmissions((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      setState(id, 'error', err instanceof Error ? err.message : 'Unable to delete submission.')
    }
  }

  if (submissions.length === 0) {
    return (
      <section className="admin-empty">
        <span className="admin-empty-label">Clean slate</span>
        <h2>No demos yet.</h2>
        <p>When an artist submits the form at the bottom of the site, the entry will land here.</p>
      </section>
    )
  }

  return (
    <section className="admin-list" aria-label="Demo submissions">
      {submissions.map((submission, index) => {
        const working = rowState[submission.id] === 'working'
        const error = rowError[submission.id]

        return (
          <article key={submission.id} className="admin-card">
            <div className="admin-card-top">
              <span className="admin-number">{String(index + 1).padStart(2, '0')}</span>
              <span className={`admin-status admin-status--${submission.status}`}>{submission.status}</span>
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

              <div className="admin-card-actions">
                <button
                  type="button"
                  className="btn btn-ghost admin-action"
                  disabled={working || submission.status === 'approved'}
                  onClick={() => updateStatus(submission.id, 'approved')}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="btn btn-ghost admin-action"
                  disabled={working || submission.status === 'rejected'}
                  onClick={() => updateStatus(submission.id, 'rejected')}
                >
                  Reject
                </button>
                <button
                  type="button"
                  className="admin-action-delete"
                  disabled={working}
                  onClick={() => remove(submission.id)}
                >
                  Delete
                </button>
              </div>

              {error && (
                <span className="field-error" role="alert">
                  {error}
                </span>
              )}
            </div>
          </article>
        )
      })}
    </section>
  )
}
