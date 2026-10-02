'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
export function Notifications({
  items,
  preview = false,
}: {
  preview?: boolean
  items: {
    id: string
    release_id: string
    message: string
    created_at: string
    read_at: string | null
  }[]
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function mark() {
    if (preview) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/notifications', { method: 'POST' })
      if (!response.ok) throw new Error('Unable to mark notifications as read.')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Try again.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="portal-panel portal-padding">
      <div className="portal-section-title">
        <h2>Recent updates</h2>
        <button
          className="portal-text-button"
          disabled={preview || busy || !items.some((i) => !i.read_at)}
          onClick={mark}
        >
          Mark all as read ↗
        </button>
      </div>
      {error && (
        <p className="portal-alert" role="alert">
          {error}
        </p>
      )}
      {items.map((item) => (
        <Link
          href={
            preview
              ? `/preview?view=release&record=${item.release_id}`
              : `/artists/releases/${item.release_id}`
          }
          key={item.id}
          className={`portal-notification ${item.read_at ? '' : 'is-unread'}`}
        >
          <i />
          <span>
            <strong>{item.message}</strong>
            <small>{new Date(item.created_at).toISOString().slice(0, 10)}</small>
          </span>
          <b>↗</b>
        </Link>
      ))}
      {!items.length && <p className="portal-muted">Your release updates will appear here.</p>}
    </section>
  )
}
