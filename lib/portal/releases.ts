import 'server-only'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import type { Actor } from './auth'
import type { ReleaseInput, ReleaseStatus } from './validation'

export type ReleaseRow = {
  id: string
  owner_id: string
  title: string
  version: string
  release_type: 'single' | 'ep' | 'album'
  release_date: string | null
  genre: string
  notes: string
  status: ReleaseStatus
  revision: number
  artwork_path: string | null
  creation_source?: 'artist' | 'label'
  demo_submission_id: string | null
  created_at: string
  updated_at: string
}
export async function listReleases(actor: Actor, team = false) {
  const { data: memberships, error: membershipError } = team
    ? { data: null, error: null }
    : await actor.client.from('label_team_members').select('owner_id').eq('member_id', actor.user.id)
  if (membershipError) throw new Error('Unable to load artist teams.')
  const ownerIds = [actor.user.id, ...(memberships ?? []).map((member) => member.owner_id)]
  let query = actor.client
    .from('label_releases')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(200)
  query = team ? query.or('status.neq.draft,creation_source.eq.label') : query.in('owner_id', ownerIds)
  const { data, error } = await query
  if (error) throw new Error('Unable to load releases.')
  return data as ReleaseRow[]
}
export async function loadRelease(actor: Actor, id: string) {
  if (!z.uuid().safeParse(id).success) notFound()
  const { data: release, error } = await actor.client
    .from('label_releases')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error('Unable to load release.')
  if (!release) notFound()
  const [artists, tracks, events] = await Promise.all([
    actor.client
      .from('label_release_artists')
      .select('name,role,spotify_id,apple_music_id')
      .eq('release_id', id)
      .order('position'),
    actor.client
      .from('label_tracks')
      .select('*,label_credits(first_name,last_name,role,position)')
      .eq('release_id', id)
      .order('position'),
    actor.client
      .from('label_release_events')
      .select('id,kind,message,created_at')
      .eq('release_id', id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])
  if (artists.error || tracks.error || events.error)
    throw new Error('Unable to load release details.')
  const input: ReleaseInput = {
    title: release.title,
    version: release.version,
    release_type: release.release_type,
    release_date: release.release_date ?? '',
    genre: release.genre,
    notes: release.notes,
    artists: artists.data ?? [],
    tracks: (tracks.data ?? []).map((t) => ({
      title: t.title,
      version: t.version,
      explicit: t.explicit,
      language: t.language,
      audio_url: t.audio_url,
      credits: [...t.label_credits]
        .sort((a, b) => a.position - b.position)
        .map(({ first_name, last_name, role }) => ({ first_name, last_name, role })),
    })),
  }
  let artworkUrl: string | null = null
  if (release.artwork_path) {
    const { data } = await actor.client.storage
      .from('label-artwork')
      .createSignedUrl(release.artwork_path, 300)
    artworkUrl = data?.signedUrl ?? null
  }
  return { release: release as ReleaseRow, input, events: events.data ?? [], artworkUrl }
}
