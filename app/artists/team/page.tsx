import { PortalHeading } from '@/components/portal/PortalShell'
import { TeamManager } from '@/components/portal/TeamManager'
import { requireActor } from '@/lib/portal/auth'
export const dynamic = 'force-dynamic'
export default async function ArtistTeamPage() {
  const actor = await requireActor()
  const [owned, shared] = await Promise.all([
    actor.client.from('label_team_members').select('member_id,email,role').eq('owner_id', actor.user.id).order('created_at'),
    actor.client.from('label_team_members').select('owner_id,role').eq('member_id', actor.user.id).order('created_at'),
  ])
  if (owned.error || shared.error) throw new Error('Unable to load your artist teams.')
  const owners = (await Promise.all((shared.data ?? []).map(async ({ owner_id, role }) => {
    const { data } = await actor.client.from('label_profiles').select('display_name').eq('id', owner_id).maybeSingle()
    return { owner_id, role, name: data?.display_name || 'Artist' }
  })))
  return <>
    <PortalHeading kicker="Your circle" title="Artist team" description="Give collaborators their own accounts and control who can edit your releases." />
    <TeamManager members={owned.data ?? []} />
    {owners.length > 0 && <section className="portal-panel portal-padding">
      <h2>Shared with you</h2>
      {owners.map((owner) => <article className="portal-artist-row" key={owner.owner_id}>
        <span className="portal-avatar" aria-hidden="true">{owner.name[0].toUpperCase()}</span>
        <div><h3>{owner.name}</h3><p className="portal-muted">{owner.role === 'editor' ? 'Editor' : 'Viewer'} access to this artist’s releases</p></div>
      </article>)}
    </section>}
  </>
}
