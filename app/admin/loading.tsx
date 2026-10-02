export default function Loading() {
  return (
    <div className="workspace-theme">
      <div className="portal-loading" role="status" aria-label="Loading your workspace">
        <p>Loading your workspace…</p>
        <div aria-hidden="true">
          <div className="portal-skeleton portal-skeleton-title" />
          <div className="portal-skeleton" />
          <div className="portal-skeleton" />
          <div className="portal-skeleton" />
        </div>
      </div>
    </div>
  )
}
