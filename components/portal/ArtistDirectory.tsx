'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GearSix, X } from '@phosphor-icons/react'
import type { ArtistReleaseMode } from '@/lib/portal/validation'

export type ArtistDirectoryProfile = {
  id: string
  display_name: string
  spotify_id: string
  apple_music_id: string
  created_at: string
  releaseMode: ArtistReleaseMode
}

const OPTIONS: { mode: ArtistReleaseMode; title: string; description: string }[] = [
  { mode: 'submission_required', title: 'Demo approval required', description: 'The artist needs an approved submission for each new release.' },
  { mode: 'once', title: 'Allow one release without a demo', description: 'Used when the artist first saves a new draft. That release can still be edited and submitted afterwards.' },
  { mode: 'unlimited', title: 'Allow releases without demos', description: 'The artist can create new releases directly until you change this setting.' },
]

const LABELS: Record<ArtistReleaseMode, string> = {
  submission_required: 'Demo required',
  once: 'One direct release available',
  unlimited: 'Direct releases enabled',
}

export function ArtistDirectory({ profiles, preview = false }: { profiles: ArtistDirectoryProfile[]; preview?: boolean }) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [selected, setSelected] = useState<ArtistDirectoryProfile | null>(null)
  const [mode, setMode] = useState<ArtistReleaseMode>('submission_required')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [previewModes, setPreviewModes] = useState<Record<string, ArtistReleaseMode>>({})

  useEffect(() => {
    const dialog = dialogRef.current
    if (!selected || !dialog) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    dialog.querySelector<HTMLInputElement>('input:checked')?.focus()
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
    }
  }, [selected])

  function open(profile: ArtistDirectoryProfile) {
    setMode(preview ? previewModes[profile.id] ?? profile.releaseMode : profile.releaseMode)
    setError('')
    setNotice('')
    setSelected(profile)
  }

  async function save() {
    if (!selected || busy) return
    setBusy(true)
    setError('')
    try {
      if (preview) {
        setPreviewModes((current) => ({ ...current, [selected.id]: mode }))
        setNotice('Preview only: permissions updated locally. No account was changed.')
        setSelected(null)
        return
      }
      const response = await fetch(`/api/admin/artists/${selected.id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to update release permissions.')
      setNotice(`Release permissions updated for ${selected.display_name || 'this artist'}.`)
      setSelected(null)
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update release permissions.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="portal-panel portal-padding">
      {notice && <p className="portal-success" role="status">{notice}</p>}
      {profiles.map((profile) => {
        const releaseMode = preview ? previewModes[profile.id] ?? profile.releaseMode : profile.releaseMode
        return (
        <article key={profile.id} className="portal-artist-row portal-directory-row">
          <span className="portal-avatar" aria-hidden="true">{(profile.display_name || 'A')[0]}</span>
          <div className="portal-directory-info">
            <h3>{profile.display_name || 'Profile not completed'}</h3>
            <p className="portal-muted">Spotify: {profile.spotify_id || 'Not added'} · Apple Music: {profile.apple_music_id || 'Not added'}</p>
            <p className={releaseMode === 'submission_required' ? 'portal-muted' : 'portal-directory-permission'}>{LABELS[releaseMode]}</p>
          </div>
          <div className="portal-directory-actions">
            <div>
              <span className="portal-muted">Joined {new Date(profile.created_at).toISOString().slice(0, 10)}</span>
              <Link className="portal-text-button" href={preview ? '/preview?workspace=admin&view=new' : `/admin/releases/new?artist=${profile.id}`}>Add release</Link>
            </div>
            <button
              className="portal-permission-gear"
              type="button"
              aria-haspopup="dialog"
              aria-label={`Release permissions for ${profile.display_name || 'artist'}`}
              title="Release permissions"
              onClick={() => open(profile)}
            >
              <GearSix size={20} aria-hidden="true" />
            </button>
          </div>
        </article>
        )
      })}
      {!profiles.length && <p className="portal-muted">Artists will appear here after their first sign-in.</p>}

      <dialog
        ref={dialogRef}
        className="portal-permission-dialog"
        aria-labelledby="artist-permissions-title"
        aria-describedby="artist-permissions-description"
        onCancel={(event) => {
          if (busy) event.preventDefault()
          else setSelected(null)
        }}
      >
        {selected && (
          <form onSubmit={(event) => { event.preventDefault(); void save() }}>
            <div className="portal-permission-dialog-heading">
              <h2 id="artist-permissions-title">Release permissions</h2>
              <button className="portal-permission-gear" type="button" disabled={busy} aria-label="Close release permissions" onClick={() => setSelected(null)}><X size={20} aria-hidden="true" /></button>
            </div>
            <p id="artist-permissions-description" className="portal-muted">Choose how {selected.display_name || 'this artist'} can create new releases. All releases still go through label review.</p>
            <fieldset className="portal-permission-options" disabled={busy}>
              <legend className="sr-only">New release access</legend>
              {OPTIONS.map((option) => (
                <label key={option.mode} className="portal-permission-option">
                  <input type="radio" name="releaseMode" value={option.mode} checked={mode === option.mode} onChange={() => setMode(option.mode)} />
                  <span><strong>{option.title}</strong><span>{option.description}</span></span>
                </label>
              ))}
            </fieldset>
            {error && <p className="portal-alert" role="alert">{error}</p>}
            <div className="portal-permission-dialog-actions">
              <button className="portal-button secondary" type="button" disabled={busy} onClick={() => setSelected(null)}>Cancel</button>
              <button className="portal-button" disabled={busy}>{busy ? 'Saving…' : 'Save permissions'}</button>
            </div>
          </form>
        )}
      </dialog>
    </section>
  )
}
