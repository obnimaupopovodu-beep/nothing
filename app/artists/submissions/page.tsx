import { PortalHeading } from '@/components/portal/PortalShell'
import { ArtistSubmissions } from '@/components/portal/ArtistSubmissions'
import { requireActor } from '@/lib/portal/auth'
import { listArtistDemoSubmissions } from '@/lib/demoSubmissions'

export default async function ArtistSubmissionsPage() {
  const actor = await requireActor()
  const submissions = await listArtistDemoSubmissions(actor.client, actor.user.id)
  return <>
    <PortalHeading kicker="Your music / First listen" title="Your demos" description="One place for first listens, feedback and the next step for approved tracks." />
    <ArtistSubmissions initialSubmissions={submissions} email={actor.user.email || ''} initialAlias={actor.profile?.display_name || ''} showForm />
  </>
}
