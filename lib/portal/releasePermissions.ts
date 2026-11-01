import 'server-only'
import type { Actor } from './auth'
import { artistReleaseModes, type ArtistReleaseMode } from './validation'

export async function getArtistReleaseMode(actor: Actor): Promise<ArtistReleaseMode> {
  const { data, error } = await actor.client
    .from('label_artist_release_permissions')
    .select('direct_release_mode')
    .eq('artist_id', actor.user.id)
    .maybeSingle()
  if (error) throw new Error('Unable to load release permissions. Please contact the label.')
  const mode = data?.direct_release_mode ?? 'submission_required'
  if (!artistReleaseModes.includes(mode)) throw new Error('Invalid release permissions.')
  return mode
}
