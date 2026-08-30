'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Timer, CheckCircle, ShieldCheck, CircleNotch } from '@phosphor-icons/react/dist/ssr'

const COMMITMENTS = [
  { title: 'Royalty access',     body: 'Always reach your royalties through a private dashboard.', Icon: Timer },
  { title: 'Promo transparency', body: 'Always know which promo actions were paid for on your track.', Icon: CheckCircle },
  { title: 'Straight feedback',  body: 'If a track does not meet our standards, we say it clearly. No ghosting.', Icon: ShieldCheck },
]

type Status = 'idle' | 'loading' | 'success' | 'error'

export function DemoSection() {
  const [alias, setAlias]   = useState('')
  const [email, setEmail]   = useState('')
  const [link, setLink]     = useState('')
  const [note, setNote]     = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError]   = useState('')

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
    <section id="demo" aria-label="Submit a demo" className="band sec">
      <div className="shell">
        <div className="wrap">
          {/* left: promise */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="kicker"><i aria-hidden="true" />Demo submission</p>
            <h2 className="h2" style={{ marginTop: 20 }}>
              If the record fits,
              <br />
              <span className="accent">we will tell you.</span>
            </h2>
            <p className="lede" style={{ marginTop: 20, maxWidth: '42ch' }}>
              If it does not, we will say that too. Every demo gets an answer within 48 hours.
            </p>

            <ul className="commit">
              {COMMITMENTS.map((c) => (
                <li key={c.title}>
                  <c.Icon size={18} weight="light" className="ic" aria-hidden="true" />
                  <span>
                    <b>{c.title}</b>
                    {c.body}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* right: form */}
          <motion.div
            className="panel glass"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {status === 'success' ? (
              <div className="done" role="status">
                <CheckCircle size={30} weight="light" className="ic" aria-hidden="true" />
                <h3 className="h3">Your demo is in.</h3>
                <p className="done-b">
                  The submission is saved for review. We answer within 48 hours if the record fits
                  the label direction.
                </p>
                <button type="button" className="btn btn-ghost" onClick={() => setStatus('idle')}>
                  Send another track
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <div className="f">
                  <label className="field-label" htmlFor="alias">Alias</label>
                  <input id="alias" className="field" value={alias} onChange={(e) => setAlias(e.target.value)}
                    placeholder="How you are credited" autoComplete="off" />
                </div>

                <div className="f">
                  <label className="field-label" htmlFor="email">Email</label>
                  <input id="email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@studio.com" autoComplete="email" />
                </div>

                <div className="f">
                  <label className="field-label" htmlFor="link">SoundCloud link</label>
                  <input id="link" className="field" value={link} onChange={(e) => setLink(e.target.value)}
                    placeholder="https://soundcloud.com/..." autoComplete="off" />
                </div>

                <div className="f">
                  <label className="field-label" htmlFor="note">Anything we should know</label>
                  <textarea id="note" className="field" rows={3} value={note} onChange={(e) => setNote(e.target.value)}
                    placeholder="Release plans, previous output, deadlines" />
                </div>

                {error && <span className="field-error" role="alert">{error}</span>}

                <button type="submit" className="btn btn-primary submit" disabled={status === 'loading'}>
                  {status === 'loading' ? (
                    <>
                      <CircleNotch size={16} weight="bold" className="spin" aria-hidden="true" />
                      Preparing
                    </>
                  ) : 'Send the track'}
                </button>

                <p className="fine">
                  We listen to everything ourselves. No forwarding, no auto replies.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .wrap {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: clamp(32px, 5vw, 84px);
          align-items: start;
        }
        .accent { color: var(--blue-soft); }
        .commit {
          margin-top: clamp(32px, 4vw, 52px);
          list-style: none;
          border-top: 1px solid var(--line-soft);
        }
        .commit li {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 18px 0;
          border-bottom: 1px solid var(--line-soft);
        }
        .commit :global(.ic) { color: var(--blue-soft); flex-shrink: 0; margin-top: 2px; }
        .commit span { font-size: 13.5px; line-height: 1.6; color: var(--ink-2); }
        .commit b {
          display: block;
          font-size: 14px;
          font-weight: 800;
          color: var(--ink);
          margin-bottom: 3px;
        }
        :global(.panel) { padding: clamp(24px, 3vw, 38px); }
        .f { margin-bottom: 22px; }
        .f :global(textarea.field) { resize: vertical; min-height: 74px; line-height: 1.55; }
        .submit { width: 100%; margin-top: 8px; }
        .submit :global(.spin) { animation: spin 0.9s linear infinite; }
        .fine {
          margin-top: 16px;
          font-size: 12px;
          line-height: 1.6;
          color: var(--ink-3);
        }
        .done { display: grid; justify-items: start; gap: 14px; padding: clamp(6px, 2vw, 18px) 0; }
        .done :global(.ic) { color: var(--blue-soft); }
        .done-b { font-size: 14px; line-height: 1.65; color: var(--ink-2); max-width: 40ch; }
        .done-b a { color: var(--blue-soft); }
        @media (max-width: 900px) {
          .wrap { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}
