import { PortalHeading } from '@/components/portal/PortalShell'
import { ProfileForm } from '@/components/portal/ProfileForm'
import { requireActor } from '@/lib/portal/auth'
export default async function ProfilePage() {
  const actor = await requireActor()
  const profile = actor.profile
  return (
    <>
      <PortalHeading
        kicker="Your identity"
        title="Artist profile"
        description="Set your public name, platform IDs and legal names for release credits."
      />
      <ProfileForm
        email={actor.user.email || ''}
        initial={{
          display_name: profile?.display_name || '',
          legal_first_name: profile?.legal_first_name || '',
          legal_last_name: profile?.legal_last_name || '',
          spotify_id: profile?.spotify_id || '',
          apple_music_id: profile?.apple_music_id || '',
        }}
      />
    </>
  )
}
