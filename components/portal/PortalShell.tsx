import Link from 'next/link'
import type { Actor } from '@/lib/portal/auth'
import { WorkspaceFrame, WorkspaceNav } from './WorkspaceFrame'
export function PortalShell({
  actor,
  workspace = 'artists',
  children,
  preview = false,
}: {
  actor: Pick<Actor, 'user' | 'profile' | 'staff'> & { admin?: boolean }
  workspace?: 'artists' | 'admin'
  children: React.ReactNode
  preview?: boolean
}) {
  const team = workspace === 'admin'
  const publicHome = process.env.NODE_ENV === 'production' ? process.env.SITE_URL || '/' : '/'
  const otherWorkspace = process.env.NODE_ENV === 'production'
    ? team
      ? process.env.ARTIST_HOSTNAME ? `https://${process.env.ARTIST_HOSTNAME}/` : '/artists'
      : process.env.ADMIN_HOSTNAME ? `https://${process.env.ADMIN_HOSTNAME}/` : '/admin'
    : team ? '/artists' : '/admin'
  const links = team
    ? [
        ['Overview', '/admin'],
        ['Release queue', '/admin/releases'],
        ['Artists', '/admin/artists'],
        ['Demo inbox', '/admin/demos'],
        ...(actor.admin ? [['Label team', '/admin/team']] : []),
      ]
    : [
        ['Overview', '/artists'],
        ['My releases', '/artists/releases'],
        ['Artist team', '/artists/team'],
        ['Artist profile', '/artists/profile'],
        ['Notifications', '/artists/notifications'],
      ]
  return (
    <WorkspaceFrame className="portal">
      <header className="portal-topbar">
        <Link href={publicHome} className="portal-brand" aria-label="uwbelieve home">
          uwbelieve
        </Link>
        <WorkspaceNav links={links} preview={preview} workspace={workspace} />
        <div className="portal-topbar-account">
          <span className="portal-avatar" aria-hidden="true">
            {(actor.profile?.display_name || actor.user.email || 'A').slice(0, 1).toUpperCase()}
          </span>
          <div>
            <strong>{actor.profile?.display_name || 'Your account'}</strong>
            <small>{team ? 'Label workspace' : 'Artist workspace'}</small>
          </div>
        </div>
      </header>
      <main className="portal-main">
        <div className="portal-utility">
          {preview ? (
            <p className="portal-preview-banner">
              <span />
              Design preview <small>Sample data · Saving is disabled</small>
            </p>
          ) : (
            <span className="portal-muted">{team ? 'Label workspace' : 'Artist workspace'}</span>
          )}
          <div>
            {actor.staff && (
              <Link
                className="portal-switch"
                href={
                  preview
                    ? `/preview?workspace=${team ? 'artists' : 'admin'}`
                    : otherWorkspace
                }
              >
                Switch to {team ? 'artist' : 'label'} ↗
              </Link>
            )}
            {!preview && (
              <form action="/api/auth/logout" method="post">
                <button className="portal-text-button" type="submit">
                  Sign out
                </button>
              </form>
            )}
          </div>
        </div>
        {children}
        <footer className="portal-footer">
          <Link href={publicHome}>uwbelieve ↗</Link>
          <span>Independent sound. Shared direction.</span>
        </footer>
      </main>
    </WorkspaceFrame>
  )
}
export function PortalHeading({
  kicker,
  title,
  description,
  action,
}: {
  kicker: string
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <header className="portal-heading">
      <div>
        <p className="portal-eyebrow">{kicker}</p>
        <h1>
          {title}
          <span>.</span>
        </h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  )
}
export function EmptyState({
  title,
  detail,
  action,
}: {
  title: string
  detail: string
  action?: React.ReactNode
}) {
  return (
    <section className="portal-empty">
      <div className="portal-empty-orbit" aria-hidden="true">
        <i />
      </div>
      <h2>{title}</h2>
      <p>{detail}</p>
      {action}
    </section>
  )
}
