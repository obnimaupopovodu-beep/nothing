'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  releaseSchema,
  submissionIssues,
  type ReleaseInput,
  emptyRelease,
} from '@/lib/portal/validation'
import { ReleaseReview } from './ReleaseReview'
const steps = ['Release', 'Artists', 'Tracks & credits', 'Artwork', 'Review']
async function send(url: string, method: string, body: unknown) {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Unable to save. Try again.')
  return result
}
export function ReleaseEditor({
  initial,
  id,
  initialRevision = 0,
  initialArtwork = null,
  submissionId,
  preview = false,
}: {
  initial: ReleaseInput
  id?: string
  initialRevision?: number
  initialArtwork?: string | null
  submissionId?: string
  preview?: boolean
}) {
  const router = useRouter()
  const [data, setData] = useState(initial)
  const [releaseId, setReleaseId] = useState(id)
  const [revision, setRevision] = useState(initialRevision)
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [artwork, setArtwork] = useState(initialArtwork)
  const [confirmed, setConfirmed] = useState(false)
  useEffect(() => {
    function warn(event: BeforeUnloadEvent) {
      if (dirty) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  function update(callback: (draft: ReleaseInput) => void) {
    setData((current) => {
      const draft = structuredClone(current)
      callback(draft)
      return draft
    })
    setDirty(true)
    setNotice('')
    setConfirmed(false)
  }
  async function save() {
    const parsed = releaseSchema.safeParse(data)
    if (!parsed.success)
      throw new Error(
        parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
      )
    let currentId = releaseId
    let currentRevision = revision
    if (!currentId) {
      const result = await send('/api/releases', 'POST', { release: parsed.data, submissionId })
      currentId = result.id
      currentRevision = 1
      setReleaseId(currentId)
      window.history.replaceState(null, '', `/artists/releases/${currentId}`)
    } else {
      const result = await send(`/api/releases/${currentId}`, 'PUT', {
        revision: currentRevision,
        release: parsed.data,
      })
      currentRevision = result.revision
    }
    setRevision(currentRevision)
    setDirty(false)
    setNotice('Draft saved.')
    return { id: currentId!, revision: currentRevision }
  }
  async function saveDraft() {
    setBusy(true)
    setError('')
    try {
      await save()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save.')
    } finally {
      setBusy(false)
    }
  }
  async function submit() {
    setError('')
    const issues = submissionIssues(data)
    if (issues.length) {
      setError(issues.join(' '))
      return
    }
    if (!confirmed) {
      setError('Confirm the release details before submitting.')
      return
    }
    setBusy(true)
    try {
      const saved = await save()
      await send(`/api/releases/${saved.id}/transition`, 'POST', {
        revision: saved.revision,
        target: 'submitted',
      })
      router.replace(`/artists/releases/${saved.id}`)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to submit.')
    } finally {
      setBusy(false)
    }
  }
  async function upload(file?: File) {
    if (!file || preview) return
    setError('')
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 20 * 1024 * 1024) {
      setError('Choose a JPEG or PNG under 20 MB.')
      return
    }
    setBusy(true)
    try {
      const saved = await save()
      const ticket = await send(`/api/releases/${saved.id}/artwork`, 'POST', {
        action: 'prepare',
        revision: saved.revision,
        mime: file.type,
      })
      const uploaded = await fetch(ticket.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type, 'x-upsert': 'false' },
        body: file,
      })
      if (!uploaded.ok) throw new Error('Artwork upload failed. Please try again.')
      const result = await send(`/api/releases/${saved.id}/artwork`, 'POST', {
        action: 'complete',
        revision: saved.revision,
        path: ticket.path,
      })
      setRevision(result.revision)
      setArtwork(result.url)
      setNotice('Artwork uploaded and verified.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to upload.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="portal-editor">
      <nav className="portal-steps" aria-label="Release steps">
        {steps.map((name, index) => (
          <button
            type="button"
            key={name}
            className={step === index ? 'is-current' : ''}
            aria-current={step === index ? 'step' : undefined}
            disabled={busy}
            onClick={() => setStep(index)}
          >
            <span>0{index + 1}</span>
            {name}
          </button>
        ))}
      </nav>
      <div className="portal-editor-body">
        <div className="portal-editor-title">
          <span className="portal-eyebrow">
            Step {step + 1} of {steps.length}
          </span>
          <span className="portal-muted">
            {dirty ? 'Unsaved changes' : releaseId ? 'Saved draft' : 'New draft'}
          </span>
        </div>
        <fieldset key={step} disabled={busy} className="portal-fieldset">
          {step === 0 && (
            <>
              <h2>The essentials.</h2>
              <p className="portal-muted">Give your record a name and a place in the calendar.</p>
              <div className="portal-form-grid">
                <label className="portal-full">
                  Release title
                  <input
                    className="portal-input"
                    value={data.title}
                    maxLength={200}
                    placeholder="The name of your next record"
                    onChange={(e) =>
                      update((d) => {
                        d.title = e.target.value
                      })
                    }
                  />
                </label>
                <label>
                  Version <small>Optional</small>
                  <input
                    className="portal-input"
                    value={data.version}
                    maxLength={120}
                    placeholder="Original / Extended / Remixes"
                    onChange={(e) =>
                      update((d) => {
                        d.version = e.target.value
                      })
                    }
                  />
                </label>
                <label>
                  Release type
                  <select
                    className="portal-input"
                    value={data.release_type}
                    onChange={(e) =>
                      update((d) => {
                        d.release_type = e.target.value as ReleaseInput['release_type']
                      })
                    }
                  >
                    <option value="single">Single</option>
                    <option value="ep">EP</option>
                    <option value="album">Album</option>
                  </select>
                </label>
                <label>
                  Preferred release date
                  <input
                    className="portal-input"
                    type="date"
                    value={data.release_date}
                    onChange={(e) =>
                      update((d) => {
                        d.release_date = e.target.value
                      })
                    }
                  />
                  <small>The label confirms the final schedule.</small>
                </label>
                <label>
                  Genre
                  <input
                    className="portal-input"
                    list="release-genres"
                    value={data.genre}
                    maxLength={100}
                    placeholder="Choose or enter a genre"
                    onChange={(e) =>
                      update((d) => {
                        d.genre = e.target.value
                      })
                    }
                  />
                  <datalist id="release-genres">
                    {[
                      'House',
                      'Tech House',
                      'Deep House',
                      'Melodic House & Techno',
                      'Techno',
                      'Progressive House',
                      'Electronic',
                      'Ambient',
                      'Drum & Bass',
                    ].map((g) => (
                      <option key={g} value={g} />
                    ))}
                  </datalist>
                </label>
                <label className="portal-full">
                  Notes for the label <small>Optional</small>
                  <textarea
                    className="portal-input"
                    rows={4}
                    maxLength={4000}
                    value={data.notes}
                    placeholder="Anything we should know about this record?"
                    onChange={(e) =>
                      update((d) => {
                        d.notes = e.target.value
                      })
                    }
                  />
                </label>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <h2>The people behind the sound.</h2>
              <p className="portal-muted">
                Use public artist names here. Platform IDs help us deliver to the correct artist
                pages.
              </p>
              {data.artists.map((artist, index) => (
                <div className="portal-entry" key={index}>
                  <div className="portal-entry-head">
                    <span>Artist {String(index + 1).padStart(2, '0')}</span>
                    <button
                      type="button"
                      className="portal-text-button"
                      onClick={() =>
                        update((d) => {
                          d.artists.splice(index, 1)
                        })
                      }
                    >
                      Remove ×
                    </button>
                  </div>
                  <div className="portal-form-grid">
                    <label>
                      Artist name
                      <input
                        className="portal-input"
                        value={artist.name}
                        maxLength={120}
                        onChange={(e) =>
                          update((d) => {
                            d.artists[index].name = e.target.value
                          })
                        }
                      />
                    </label>
                    <label>
                      Role
                      <select
                        className="portal-input"
                        value={artist.role}
                        onChange={(e) =>
                          update((d) => {
                            d.artists[index].role = e.target.value as 'primary' | 'featured'
                          })
                        }
                      >
                        <option value="primary">Primary artist</option>
                        <option value="featured">Featured artist</option>
                      </select>
                    </label>
                    <label>
                      Spotify artist ID <small>Optional</small>
                      <input
                        className="portal-input"
                        value={artist.spotify_id}
                        maxLength={100}
                        placeholder="Artist ID, not a track link"
                        onChange={(e) =>
                          update((d) => {
                            d.artists[index].spotify_id = e.target.value
                          })
                        }
                      />
                    </label>
                    <label>
                      Apple Music artist ID <small>Optional</small>
                      <input
                        className="portal-input"
                        value={artist.apple_music_id}
                        maxLength={100}
                        onChange={(e) =>
                          update((d) => {
                            d.artists[index].apple_music_id = e.target.value
                          })
                        }
                      />
                    </label>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="portal-button secondary"
                disabled={data.artists.length >= 20}
                onClick={() =>
                  update((d) => {
                    d.artists.push({
                      name: '',
                      role: 'featured',
                      spotify_id: '',
                      apple_music_id: '',
                    })
                  })
                }
              >
                ＋ Add artist
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <h2>Every track. Every credit.</h2>
              <p className="portal-muted">
                Credit people with their legal first and last names. Each track needs at least one
                composer. Add lyricists when the track contains lyrics.
              </p>
              {data.tracks.map((track, index) => (
                <div className="portal-entry" key={index}>
                  <div className="portal-entry-head">
                    <span>Track {String(index + 1).padStart(2, '0')}</span>
                    {data.tracks.length > 1 && (
                      <button
                        type="button"
                        className="portal-text-button"
                        onClick={() =>
                          update((d) => {
                            d.tracks.splice(index, 1)
                          })
                        }
                      >
                        Remove ×
                      </button>
                    )}
                  </div>
                  <div className="portal-form-grid">
                    <label>
                      Track title
                      <input
                        className="portal-input"
                        value={track.title}
                        maxLength={200}
                        onChange={(e) =>
                          update((d) => {
                            d.tracks[index].title = e.target.value
                          })
                        }
                      />
                    </label>
                    <label>
                      Version <small>Optional</small>
                      <input
                        className="portal-input"
                        value={track.version}
                        maxLength={120}
                        onChange={(e) =>
                          update((d) => {
                            d.tracks[index].version = e.target.value
                          })
                        }
                      />
                    </label>
                    <label>
                      Language
                      <input
                        className="portal-input"
                        value={track.language}
                        maxLength={60}
                        placeholder="Instrumental / English / …"
                        onChange={(e) =>
                          update((d) => {
                            d.tracks[index].language = e.target.value
                          })
                        }
                      />
                    </label>
                    <label className="portal-full">
                      WAV / FLAC file link
                      <input
                        className="portal-input"
                        type="url"
                        inputMode="url"
                        value={track.audio_url}
                        maxLength={2048}
                        placeholder="https://..."
                        onChange={(e) => update((d) => { d.tracks[index].audio_url = e.target.value })}
                      />
                      <small>Use an accessible HTTPS download link. We do not store your audio files.</small>
                    </label>
                    <label className="portal-check">
                      <input
                        type="checkbox"
                        checked={track.explicit}
                        onChange={(e) =>
                          update((d) => {
                            d.tracks[index].explicit = e.target.checked
                          })
                        }
                      />
                      Explicit content
                    </label>
                  </div>
                  <h3 className="portal-credits-title">Credits</h3>
                  {track.credits.map((credit, ci) => (
                    <div className="portal-credit-row" key={ci}>
                      <label>
                        Legal first name
                        <input
                          className="portal-input"
                          value={credit.first_name}
                          maxLength={100}
                          onChange={(e) =>
                            update((d) => {
                              d.tracks[index].credits[ci].first_name = e.target.value
                            })
                          }
                        />
                      </label>
                      <label>
                        Legal last name
                        <input
                          className="portal-input"
                          value={credit.last_name}
                          maxLength={100}
                          onChange={(e) =>
                            update((d) => {
                              d.tracks[index].credits[ci].last_name = e.target.value
                            })
                          }
                        />
                      </label>
                      <label>
                        Role
                        <select
                          className="portal-input"
                          value={credit.role}
                          onChange={(e) =>
                            update((d) => {
                              d.tracks[index].credits[ci].role = e.target
                                .value as typeof credit.role
                            })
                          }
                        >
                          {[
                            'composer',
                            'lyricist',
                            'producer',
                            'mixing_engineer',
                            'mastering_engineer',
                            'performer',
                            'remixer',
                          ].map((role) => (
                            <option key={role} value={role}>
                              {role.replaceAll('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        aria-label={`Remove credit ${ci + 1} from track ${index + 1}`}
                        className="portal-text-button"
                        onClick={() =>
                          update((d) => {
                            d.tracks[index].credits.splice(ci, 1)
                          })
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="portal-text-button"
                    disabled={track.credits.length >= 50}
                    onClick={() =>
                      update((d) => {
                        d.tracks[index].credits.push({
                          first_name: '',
                          last_name: '',
                          role: 'producer',
                        })
                      })
                    }
                  >
                    ＋ Add credit
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="portal-button secondary"
                disabled={data.tracks.length >= 40}
                onClick={() =>
                  update((d) => {
                    d.tracks.push(structuredClone(emptyRelease.tracks[0]))
                  })
                }
              >
                ＋ Add track
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <h2>A face for your record.</h2>
              <p className="portal-muted">
                Have artwork ready? Add it here. You can also submit without artwork and coordinate
                it with the label.
              </p>
              <div className="portal-artwork-area">
                {artwork ? (
                  <img src={artwork} alt="Release artwork" className="portal-artwork-preview" />
                ) : (
                  <div className="portal-artwork-placeholder">
                    <span>＋</span>
                    <p>
                      YOUR RECORD,
                      <br />
                      IN A FRAME.
                    </p>
                  </div>
                )}
                <div>
                  <h3>{artwork ? 'Artwork uploaded' : 'Upload artwork'}</h3>
                  <p className="portal-muted">
                    Square JPEG or PNG
                    <br />
                    RGB · 3000 to 6000 px · up to 20 MB
                  </p>
                  <label className="portal-button secondary portal-file-label">
                    {artwork ? 'Replace artwork ↗' : 'Choose a file ↗'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) => {
                        void upload(e.target.files?.[0])
                        e.target.value = ''
                      }}
                      disabled={busy || preview}
                    />
                  </label>
                  <small>Files are checked before being attached.</small>
                </div>
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <h2>Ready when you are.</h2>
              <p className="portal-muted">
                Review the details below. Once submitted, the label reviews your release before
                delivery.
              </p>
              <ReleaseReview input={data} artworkUrl={artwork} />
              {submissionIssues(data).length > 0 && (
                <div className="portal-alert">
                  <strong>Before you send it</strong>
                  <ul>
                    {submissionIssues(data).map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              <label className="portal-check portal-confirm">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                I have checked the details and have permission to submit this music and artwork.
              </label>
            </>
          )}
        </fieldset>
        {error && (
          <p className="portal-alert" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="portal-success" role="status">
            {notice}
          </p>
        )}
        <div className="portal-editor-actions">
          <button
            type="button"
            className="portal-button secondary"
            disabled={busy || preview}
            onClick={saveDraft}
          >
            {busy ? 'Please wait…' : 'Save draft'}
          </button>
          <div>
            {step > 0 && (
              <button
                type="button"
                className="portal-text-button"
                disabled={busy}
                onClick={() => setStep(step - 1)}
              >
                ← Back
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                className="portal-button"
                disabled={busy}
                onClick={() => setStep(step + 1)}
              >
                Continue ↗
              </button>
            ) : (
              <button
                type="button"
                className="portal-button"
                disabled={preview || busy || !confirmed || submissionIssues(data).length > 0}
                onClick={submit}
              >
                Submit to label ↗
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
