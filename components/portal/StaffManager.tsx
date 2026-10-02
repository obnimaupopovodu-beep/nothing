'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Staff = { user_id: string; email: string; role: 'admin' | 'label_manager' }
export function StaffManager({ people, currentUser }: { people: Staff[]; currentUser: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  async function send(method: 'POST' | 'DELETE', payload: unknown) {
    setBusy(true); setError(''); setNotice('')
    try {
      const response = await fetch('/api/staff', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to update access.')
      setNotice('Label access updated.')
      router.refresh()
      return true
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update access.')
      return false
    } finally { setBusy(false) }
  }
  return <section className="portal-panel portal-padding">
    <h2>People with label access</h2>
    <p className="portal-muted">A person must create an account and confirm their email before you grant access. Managers review releases and demos. Admins can also manage the label team.</p>
    <form className="portal-form" onSubmit={(event) => {
      event.preventDefault()
      const form = event.currentTarget
      const values = new FormData(form)
      void send('POST', { email: values.get('email'), role: values.get('role') }).then((ok) => { if (ok) form.reset() })
    }}>
      <label>Email address<input className="portal-input" type="email" name="email" maxLength={254} required /></label>
      <label>Role<select className="portal-input" name="role" defaultValue="label_manager"><option value="label_manager">Label manager</option><option value="admin">Admin</option></select></label>
      <button className="portal-button" disabled={busy}>Grant access ↗</button>
    </form>
    {error && <p className="portal-alert" role="alert">{error}</p>}
    {notice && <p className="portal-success" role="status">{notice}</p>}
    {people.map((person) => <article className="portal-artist-row" key={`${person.user_id}-${person.role}`}>
      <span className="portal-avatar" aria-hidden="true">{person.email[0].toUpperCase()}</span>
      <div><h3>{person.email}</h3><p className="portal-muted">{person.role === 'admin' ? 'Admin' : 'Label manager'}</p></div>
      {person.user_id !== currentUser && <button className="portal-text-button" type="button" disabled={busy} onClick={() => void send('DELETE', { user_id: person.user_id, role: person.role })}>Remove</button>}
    </article>)}
  </section>
}
