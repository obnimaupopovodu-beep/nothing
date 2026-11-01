import { PortalShell, PortalHeading } from '@/components/portal/PortalShell'
import { requireActor } from '@/lib/portal/auth'
import { ArtistDirectory } from '@/components/portal/ArtistDirectory'
import { artistReleaseModes, type ArtistReleaseMode } from '@/lib/portal/validation'
export default async function ArtistsPage() {
  const actor = await requireActor('admin')
  const { data, error } = await actor.client
    .from('label_profiles')
    .select('id,display_name,spotify_id,apple_music_id,created_at')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) throw new Error('Unable to load artists.')
  const profiles = data ?? []
  const { data: permissions, error: permissionsError } = profiles.length
    ? await actor.client.from('label_artist_release_permissions').select('artist_id,direct_release_mode').in('artist_id', profiles.map((profile) => profile.id))
    : { data: [], error: null }
  if (permissionsError) throw new Error('Unable to load artist release permissions.')
  const modes = new Map<string, ArtistReleaseMode>((permissions ?? []).map((permission) => {
    if (!artistReleaseModes.includes(permission.direct_release_mode)) throw new Error('Invalid artist release permissions.')
    return [permission.artist_id, permission.direct_release_mode]
  }))
  return (
    <PortalShell actor={actor} workspace="admin">
      <PortalHeading
        kicker="Label / People"
        title="Artists"
        description="Artist profiles and release permissions. Use the settings icon to enable direct releases for an artist."
      />
      <ArtistDirectory profiles={profiles.map((profile) => ({ ...profile, releaseMode: modes.get(profile.id) ?? 'submission_required' }))} />
    </PortalShell>
  )
}
