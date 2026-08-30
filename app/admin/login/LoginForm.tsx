'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

type Status = 'idle' | 'loading' | 'error'

export function LoginForm() {
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus('loading')
    setError('')

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const result = await response.json().catch(() => null)
      setStatus('error')
      setError(result?.error ?? 'Unable to log in.')
      return
    }

    window.location.href = searchParams.get('next') || '/admin'
  }

  return (
    <form className="admin-login-form glass" onSubmit={submit}>
      <div>
        <label className="field-label" htmlFor="admin-username">Login</label>
        <input
          id="admin-username"
          className="field"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          className="field"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />
      </div>

      {error && <span className="field-error" role="alert">{error}</span>}

      <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
        {status === 'loading' ? 'Checking' : 'Enter admin'}
      </button>
    </form>
  )
}
