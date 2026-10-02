'use client'
import Link from 'next/link'
import { WorkspaceFrame } from '@/components/portal/WorkspaceFrame'
export default function ArtistError({ reset }: { reset: () => void }) {
  return (
    <WorkspaceFrame>
      <main className="portal-error">
        <p className="portal-eyebrow">Workspace unavailable</p>
        <h1>Let’s reconnect.</h1>
        <p>We couldn’t load your workspace. Try again or contact the label.</p>
        <button className="portal-button" onClick={reset}>
          Try again ↗
        </button>
        <Link href="/login">Back to sign in</Link>
      </main>
    </WorkspaceFrame>
  )
}
