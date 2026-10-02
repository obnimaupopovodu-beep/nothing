'use client'
import Link from 'next/link'
import { useState } from 'react'
import { MagnifyingGlass, VinylRecord, ArrowUpRight } from '@phosphor-icons/react'
import type { ReleaseRow } from '@/lib/portal/releases'
import { statusLabels, type ReleaseStatus } from '@/lib/portal/validation'
export function StatusBadge({ status }: { status: ReleaseStatus }) {
  return <span className={`portal-status status-${status}`}>{statusLabels[status]}</span>
}
export function ReleaseList({
  releases,
  team = false,
  preview = false,
}: {
  releases: ReleaseRow[]
  team?: boolean
  preview?: boolean
}) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const visible = releases.filter(
    (r) =>
      (filter === 'all' || r.status === filter) &&
      `${r.title} ${r.genre}`.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <section className="portal-panel">
      <div className="portal-list-tools">
        <label className="portal-search">
          <MagnifyingGlass size={19} aria-hidden="true" />
          <input
            aria-label="Search releases"
            className="portal-input"
            placeholder="Search your records…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          aria-label="Filter by status"
          className="portal-input"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="portal-records">
        <div className="portal-record-head">
          <span>Record</span>
          <span>Release date</span>
          <span>Status</span>
          <span />
        </div>
        {visible.map((release) => (
          <Link
            href={
              preview
                ? `/preview?workspace=${team ? 'admin' : 'artists'}&view=release&record=${release.id}`
                : `${team ? '/admin' : '/artists'}/releases/${release.id}`
            }
            key={release.id}
            className="portal-record"
          >
            <span className="portal-record-title">
              <span className="portal-record-icon">
                <VinylRecord size={30} weight="thin" aria-hidden="true" />
              </span>
              <span>
                <strong>{release.title || 'Untitled release'}</strong>
                <small>
                  {release.release_type.toUpperCase()} · {release.genre || 'Genre pending'}
                </small>
              </span>
            </span>
            <span className="portal-record-date">{release.release_date || 'Not scheduled'}</span>
            <StatusBadge status={release.status} />
            <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
        ))}
        {!visible.length && (
          <p className="portal-muted portal-padding">No releases match this filter.</p>
        )}
      </div>
    </section>
  )
}
