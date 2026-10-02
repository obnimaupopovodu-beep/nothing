import { PortalShell, PortalHeading } from '@/components/portal/PortalShell'
import { requireActor } from '@/lib/portal/auth'
export default async function ArtistsPage() {
  const actor = await requireActor('admin')
  const { data, error } = await actor.client
    .from('label_profiles')
    .select('id,display_name,spotify_id,apple_music_id,created_at')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) throw new Error('Unable to load artists.')
  return (
    <PortalShell actor={actor} workspace="admin">
      <PortalHeading
        kicker="Label / People"
        title="Artists"
        description="Artist profiles connected to the same release platform."
      />
      <section className="portal-panel portal-padding">
        {data?.map((profile) => (
          <article key={profile.id} className="portal-artist-row">
            <span className="portal-avatar">{(profile.display_name || 'A')[0]}</span>
            <div>
              <h3>{profile.display_name || 'Profile not completed'}</h3>
              <p className="portal-muted">
                Spotify: {profile.spotify_id || 'Not added'} · Apple Music:{' '}
                {profile.apple_music_id || 'Not added'}
              </p>
            </div>
            <span className="portal-muted">
              Joined {new Date(profile.created_at).toISOString().slice(0, 10)}
            </span>
          </article>
        ))}
        {!data?.length && (
          <p className="portal-muted">Artists will appear here after their first sign-in.</p>
        )}
      </section>
    </PortalShell>
  )
}
