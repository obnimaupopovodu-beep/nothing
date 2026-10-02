'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
export function ProfileForm({
  initial,
  email,
  preview = false,
}: {
  initial: {
    display_name: string
    legal_first_name: string
    legal_last_name: string
    spotify_id: string
    apple_music_id: string
  }
  email: string
  preview?: boolean
}) {
  const router = useRouter()
  const [data, setData] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (preview) return
    setBusy(true)
    setMessage('')
    setError('')
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setMessage('Profile saved.')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save profile.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <form className="portal-panel portal-padding" onSubmit={save}>
      <fieldset className="portal-fieldset" disabled={busy}>
        <div className="portal-form-grid">
          {(
            [
              ['display_name', 'Artist / display name', 120],
              ['spotify_id', 'Spotify artist ID', 100],
              ['legal_first_name', 'Legal first name', 100],
              ['legal_last_name', 'Legal last name', 100],
              ['apple_music_id', 'Apple Music artist ID', 100],
            ] as const
          ).map(([key, label, max]) => (
            <label key={key}>
              {label}
              <input
                className="portal-input"
                maxLength={max}
                value={data[key]}
                onChange={(e) => setData({ ...data, [key]: e.target.value })}
              />
            </label>
          ))}
          <label>
            Email
            <input className="portal-input" type="email" value={email} readOnly />
            <small>Your sign-in email.</small>
          </label>
        </div>
      </fieldset>
      <p className="portal-muted">
        Legal names are used for credits. Public artist names stay separate.
      </p>
      {message && (
        <p className="portal-success" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="portal-alert" role="alert">
          {error}
        </p>
      )}
      <button className="portal-button" disabled={busy || preview}>
        {busy ? 'Saving…' : 'Save profile ↗'}
      </button>
    </form>
  )
}
