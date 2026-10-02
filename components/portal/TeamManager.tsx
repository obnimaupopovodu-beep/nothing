'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Member = { member_id: string; email: string; role: string }
export function TeamManager({ members }: { members: Member[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  async function send(method: 'POST' | 'DELETE', payload: unknown) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch('/api/team', {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to update your team.')
      setMessage(method === 'POST' ? 'Access updated.' : 'Team member removed.')
      router.refresh()
      return true
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update your team.')
      return false
    } finally { setBusy(false) }
  }
  return <section className="portal-panel portal-padding">
    <h2>People with access</h2>
    <p className="portal-muted">Ask a teammate to create an artist account and confirm their email first. Editors can update drafts, upload artwork and submit releases. Viewers can follow progress.</p>
    <form className="portal-form" onSubmit={(event) => {
      event.preventDefault()
      const form = event.currentTarget
      const values = new FormData(form)
      void send('POST', { email: values.get('email'), role: values.get('role') }).then((ok) => { if (ok) form.reset() })
    }}>
      <label>Email address<input className="portal-input" type="email" name="email" maxLength={254} required /></label>
      <label>Access<select className="portal-input" name="role" defaultValue="editor"><option value="editor">Editor</option><option value="viewer">Viewer</option></select></label>
      <button type="submit" className="portal-button" disabled={busy || members.length >= 25}>Add to team ↗</button>
    </form>
    {error && <p className="portal-alert" role="alert">{error}</p>}
    {message && <p className="portal-success" role="status">{message}</p>}
    {members.map((member) => <article className="portal-artist-row" key={member.member_id}>
      <span className="portal-avatar" aria-hidden="true">{member.email[0].toUpperCase()}</span>
      <div><h3>{member.email}</h3><p className="portal-muted">{member.role === 'editor' ? 'Editor' : 'Viewer'}</p></div>
      <button type="button" className="portal-text-button" disabled={busy} onClick={() => void send('DELETE', { member_id: member.member_id })}>Remove</button>
    </article>)}
    {!members.length && <p className="portal-muted">Only you can access your releases for now.</p>}
  </section>
}
