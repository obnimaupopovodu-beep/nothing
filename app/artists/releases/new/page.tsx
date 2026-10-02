import { PortalHeading } from '@/components/portal/PortalShell'
import { ReleaseEditor } from '@/components/portal/ReleaseEditor'
import { requireActor } from '@/lib/portal/auth'
import { emptyRelease } from '@/lib/portal/validation'
export default async function NewReleasePage() {
  const actor = await requireActor()
  const initial = structuredClone(emptyRelease)
  initial.artists[0].name = actor.profile?.display_name || ''
  initial.artists[0].spotify_id = actor.profile?.spotify_id || ''
  initial.artists[0].apple_music_id = actor.profile?.apple_music_id || ''
  initial.tracks[0].credits[0].first_name = actor.profile?.legal_first_name || ''
  initial.tracks[0].credits[0].last_name = actor.profile?.legal_last_name || ''
  return (
    <>
      <PortalHeading
        kicker="Create / Release"
        title="A new record"
        description="Start with the essentials. You can save and come back at any time."
      />
      <ReleaseEditor initial={initial} />
    </>
  )
}
