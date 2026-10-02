'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { WorkspaceFrame } from './WorkspaceFrame'
export function AuthForm({
  workspace,
  next,
  initialMode,
  configured,
  confirmationError,
  previewAvailable = false,
  homeUrl = '/',
}: {
  workspace: string
  next: string
  initialMode: string
  configured: boolean
  confirmationError: boolean
  previewAvailable?: boolean
  homeUrl?: string
}) {
  const [mode, setMode] = useState(initialMode)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(
    confirmationError
      ? 'This confirmation link expired or is invalid. Sign in or request a new link.'
      : ''
  )
  const [message, setMessage] = useState('')
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
          workspace,
          next,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      if (data.next) window.location.assign(data.next)
      else setMessage(data.message)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to connect. Try again.')
    } finally {
      setBusy(false)
    }
  }
  const title =
    mode === 'register'
      ? 'Make room for your next record.'
      : mode === 'forgot'
        ? 'Find your way back.'
        : mode === 'reset'
          ? 'A fresh start.'
          : 'Your sound.\nYour space.'
  return (
    <WorkspaceFrame className="portal-auth">
      <div className="portal-auth-story">
        <Link href={homeUrl} className="portal-brand">
          uwbelieve
        </Link>
        <p className="portal-eyebrow">
          {workspace === 'admin' ? 'Label workspace' : 'Artist workspace'}
        </p>
        <h1>
          {title.split('\n').map((line) => (
            <span className="portal-auth-line" key={line}>
              <span>{line}</span>
            </span>
          ))}
        </h1>
        <div className="portal-auth-visual" aria-hidden="true">
          <Image
            src="/images/workspace-vinyl.webp"
            alt=""
            width={1000}
            height={1000}
            sizes="(max-width: 800px) 240px, 340px"
            priority
          />
        </div>
        <p>From the first idea to release day.</p>
        <Link href={homeUrl}>Back to the label ↗</Link>
        <div className="portal-auth-marquee" aria-hidden="true">
          <div>
            {[0, 1].map((copy) => (
              <span key={copy}>
                Your sound <i /> Your credits <i /> Your next record <i />
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="portal-auth-content">
        <div className="portal-auth-box">
          <p className="portal-eyebrow">
            {workspace === 'admin' ? 'For the label' : 'For the artist'}
          </p>
          <h2>
            {mode === 'register'
              ? 'Create your account'
              : mode === 'forgot'
                ? 'Reset password'
                : mode === 'reset'
                  ? 'Choose a new password'
                  : 'Sign in'}
          </h2>
          <p className="portal-muted">
            {mode === 'register'
              ? 'One account. Every release, in one place.'
              : mode === 'forgot'
                ? 'We’ll email you a link to reset your password.'
                : 'Continue to your workspace.'}
          </p>
          {!configured && (
            <p className="portal-alert" role="status">
              The platform is being connected. Please try again later or contact the label.
            </p>
          )}
          <form onSubmit={submit} className="portal-form">
            {mode !== 'reset' && (
              <label>
                Email address
                <input
                  className="portal-input"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                />
              </label>
            )}
            {mode !== 'forgot' && (
              <label>
                Password
                <input
                  className="portal-input"
                  name="password"
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  minLength={mode === 'login' ? 1 : 12}
                  maxLength={128}
                  required
                />
                {mode !== 'login' && <small>Use at least 12 characters.</small>}
              </label>
            )}
            {error && (
              <p className="portal-alert" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="portal-success" role="status">
                {message}
              </p>
            )}
            <button className="portal-button" disabled={busy || !configured}>
              {busy
                ? 'Please wait…'
                : mode === 'register'
                  ? 'Create account ↗'
                  : mode === 'forgot'
                    ? 'Send reset link ↗'
                    : mode === 'reset'
                      ? 'Save password ↗'
                      : 'Enter workspace ↗'}
            </button>
          </form>
          <div className="portal-auth-links">
            {mode === 'login' ? (
              <>
                <button
                  onClick={() => {
                    setMode('forgot')
                    setError('')
                    setMessage('')
                  }}
                >
                  Forgot password?
                </button>
                {workspace !== 'admin' && (
                  <button
                    onClick={() => {
                      setMode('register')
                      setError('')
                      setMessage('')
                    }}
                  >
                    Create an artist account ↗
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => {
                  setMode('login')
                  setError('')
                  setMessage('')
                }}
              >
                Return to sign in
              </button>
            )}
          </div>
          {previewAvailable && (
            <Link href="/preview" className="portal-preview-link">
              Explore local workspace preview ↗
            </Link>
          )}
          <p className="portal-auth-note">A workspace for artists who move things forward.</p>
        </div>
      </div>
    </WorkspaceFrame>
  )
}
