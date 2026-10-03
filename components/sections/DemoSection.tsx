'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle, CircleNotch } from '@phosphor-icons/react/dist/ssr'
import { useMagneticButton } from '@/hooks/useMagneticButton'
import { RELEASE_PATH_EVENT, RELEASE_PATH_NOTES, applyReleasePathNote, type ReleasePath } from '@/lib/releasePathSelection'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function DemoSection() {
  const magneticSubmit = useMagneticButton()
  const reduceMotion = useReducedMotion()
  const [alias, setAlias]   = useState('')
  const [email, setEmail]   = useState('')
  const [link, setLink]     = useState('')
  const [note, setNote]     = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError]   = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const selectPath = (event: Event) => {
      const path = (event as CustomEvent<ReleasePath>).detail
      if (!Object.prototype.hasOwnProperty.call(RELEASE_PATH_NOTES, path)) return
      setNote(current => applyReleasePathNote(current, path))
      setStatus(current => current === 'loading' ? current : 'idle')
      setError('')
    }
    window.addEventListener(RELEASE_PATH_EVENT, selectPath)
    return () => window.removeEventListener(RELEASE_PATH_EVENT, selectPath)
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!alias.trim())                      return setError('Tell us the alias you release under.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter an email address we can answer to.')
    if (!/^https?:\/\/(www\.)?(soundcloud\.com|on\.soundcloud\.com)\/.+/i.test(link.trim())) {
      return setError('Add a SoundCloud link to the track, starting with https.')
    }

    setStatus('loading')
    try {
      const response = await fetch('/api/demo-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alias,
          email,
          scLink: link,
          notes: note,
        }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error ?? 'Unable to save demo submission.')
      }

      setStatus('success')
      setIsEditing(false)
      setAlias('')
      setEmail('')
      setLink('')
      setNote('')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Unable to save demo submission.')
    }
  }

  return (
    <section id="demo" aria-label="Submit a demo" className={isEditing ? 'band sec demo-section is-editing' : 'band sec demo-section'}>
      <div className="shell">
        <div className={isEditing ? 'wrap editing' : 'wrap'}>
          <div className="demo-intro-position">
            <motion.div
              className="demo-intro"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="kicker"><i aria-hidden="true" />Demo submission</p>
              <h2 className="demo-title">
                <span>Your next release.</span>
                <span className="accent">Starts here.</span>
              </h2>
              <p className="demo-lede">
                Send us your track. We’ll listen and get back to you within 48 hours.
              </p>
            </motion.div>
          </div>

          <div className="demo-form-position">
            <motion.div
              className="demo-form-side"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.75, delay: reduceMotion ? 0 : 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
            {status === 'success' ? (
              <div className="done" role="status">
                <CheckCircle size={30} weight="light" className="ic" aria-hidden="true" />
                <h3 className="h3">Your demo is in.</h3>
                <p className="done-b">
                  Your track is saved for review. We listen to every demo and reply within 48 hours.
                </p>
                <button type="button" className="btn btn-ghost" onClick={() => setStatus('idle')}>
                  Send another track
                </button>
              </div>
            ) : (
              <form
                onSubmit={submit}
                onFocusCapture={(event) => {
                  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                    setIsEditing(true)
                  }
                }}
                onBlurCapture={(event) => {
                  const next = event.relatedTarget
                  if (!next || !event.currentTarget.contains(next) || !(next instanceof HTMLInputElement || next instanceof HTMLTextAreaElement)) {
                    setIsEditing(false)
                  }
                }}
                noValidate
              >
                <div className="first-row">
                  <div className="f">
                    <label className="field-label" htmlFor="alias">Artist name</label>
                    <input id="alias" className="field" value={alias} onChange={(e) => setAlias(e.target.value)}
                      placeholder="Your artist name" autoComplete="nickname" required />
                  </div>

                  <div className="f">
                    <label className="field-label" htmlFor="email">Email</label>
                    <input id="email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@studio.com" autoComplete="email" required />
                  </div>
                </div>

                <div className="f">
                  <label className="field-label" htmlFor="link">SoundCloud link</label>
                  <input id="link" type="url" inputMode="url" className="field" value={link} onChange={(e) => setLink(e.target.value)}
                    placeholder="https://soundcloud.com/your-track" autoComplete="url" required />
                </div>

                <div className="f">
                  <label className="field-label" htmlFor="note">Anything we should know? <span className="optional">Optional</span></label>
                  <textarea id="note" className="field" rows={2} value={note} onChange={(e) => setNote(e.target.value)}
                    placeholder="Release plans, previous output, deadlines" />
                </div>

                {error && <span className="field-error" role="alert">{error}</span>}

                <motion.button type="submit" className="btn btn-primary magnetic-btn submit" disabled={status === 'loading'} {...magneticSubmit}>
                  {status === 'loading' ? (
                    <>
                      <CircleNotch size={16} weight="bold" className="spin" aria-hidden="true" />
                      Preparing
                    </>
                  ) : <>Send your demo <span aria-hidden="true">↗</span></>}
                </motion.button>

                <p className="fine">
                  We listen to every demo ourselves.
                </p>
              </form>
            )}
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .demo-section { isolation: isolate; }
        .demo-section::before {
          content: '';
          position: absolute;
          z-index: 0;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          background: rgba(5, 5, 5, 0.42);
          backdrop-filter: blur(7px);
          -webkit-backdrop-filter: blur(7px);
          mask-image: linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent);
          transition: opacity 0.65s cubic-bezier(0.65, 0, 0.35, 1);
        }
        .demo-section.is-editing::before { opacity: 1; }
        .wrap {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: clamp(48px, 6vw, 96px);
          align-items: center;
        }
        .demo-intro-position {
          min-width: 0;
          transition: opacity 0.65s cubic-bezier(0.65, 0, 0.35, 1),
                      filter 0.65s cubic-bezier(0.65, 0, 0.35, 1),
                      transform 0.65s cubic-bezier(0.65, 0, 0.35, 1);
        }
        .demo-form-position {
          position: relative;
          z-index: 2;
          min-width: 0;
          transition: transform 0.7s cubic-bezier(0.65, 0, 0.35, 1);
        }
        .wrap.editing .demo-intro-position {
          opacity: 0.13;
          filter: blur(10px);
          transform: scale(0.95);
          pointer-events: none;
        }
        .wrap.editing .demo-form-position {
          transform: translateX(calc(-50% - 3vw));
        }
        .demo-title {
          margin-top: 24px;
          font-size: clamp(40px, 4.3vw, 58px);
          font-weight: 800;
          line-height: 1.04;
          letter-spacing: -0.055em;
        }
        .demo-title span { display: block; }
        .demo-lede {
          max-width: 43ch;
          margin-top: 24px;
          color: var(--ink-2);
          font-size: clamp(15px, 1.4vw, 17px);
          line-height: 1.65;
        }
        .accent { color: var(--blue-soft); }
        :global(.demo-form-side) {
          position: relative;
          isolation: isolate;
          min-width: 0;
          padding-block: 8px;
        }
        :global(.demo-form-side)::before {
          content: '';
          position: absolute;
          z-index: -1;
          inset: -48px -40px;
          pointer-events: none;
          background: radial-gradient(ellipse at center, rgba(5, 5, 5, 0.88) 0%, rgba(5, 5, 5, 0.62) 53%, transparent 85%);
        }
        .first-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
        }
        .f { min-width: 0; margin-bottom: 30px; }
        .f :global(.field) { min-height: 48px; }
        .f:focus-within :global(.field) { box-shadow: 0 1px 0 var(--blue-soft); }
        .f :global(textarea.field) { resize: vertical; min-height: 70px; line-height: 1.55; }
        .optional {
          margin-left: 8px;
          color: var(--ink-3);
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: none;
          font-weight: 500;
        }
        :global(.submit) { width: 100%; min-height: 54px; margin-top: 2px; }
        .submit :global(.spin) { animation: spin 0.9s linear infinite; }
        .fine {
          margin-top: 14px;
          font-size: 12px;
          line-height: 1.6;
          color: var(--ink-3);
          text-align: center;
        }
        .done { display: grid; justify-items: start; gap: 14px; padding: clamp(12px, 3vw, 28px) 0; }
        .done :global(.ic) { color: var(--blue-soft); }
        .done-b { font-size: 14px; line-height: 1.65; color: var(--ink-2); max-width: 40ch; }
        @media (max-width: 1050px) {
          .wrap { grid-template-columns: 1fr; gap: clamp(48px, 7vw, 72px); }
          .demo-title { font-size: clamp(40px, 6vw, 58px); }
          .demo-form-position { max-width: 680px; width: 100%; margin-inline: auto; }
          .wrap.editing .demo-form-position { transform: none; }
          :global(.demo-form-side) { max-width: 680px; width: 100%; }
        }
        @media (max-width: 640px) {
          .wrap { gap: 42px; }
          .demo-title { font-size: clamp(33px, 9vw, 42px); }
          .demo-lede { margin-top: 20px; }
          .first-row { grid-template-columns: 1fr; gap: 0; }
          .f { margin-bottom: 24px; }
          :global(.demo-form-side)::before { inset: -26px -18px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .demo-section::before,
          .demo-intro-position,
          .demo-form-position { transition-duration: 0.01ms; }
        }
      `}</style>
    </section>
  )
}
