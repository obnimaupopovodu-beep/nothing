import { notFound } from 'next/navigation'
import { PortalShell, PortalHeading } from '@/components/portal/PortalShell'
import { StaffManager } from '@/components/portal/StaffManager'
import { requireActor } from '@/lib/portal/auth'
export const dynamic = 'force-dynamic'
export default async function LabelTeamPage() {
  const actor = await requireActor('admin')
  if (!actor.admin) notFound()
  const { data, error } = await actor.client.rpc('label_list_staff')
  if (error) throw new Error('Unable to load label team.')
  return <PortalShell actor={actor} workspace="admin">
    <PortalHeading kicker="Label / Access" title="Label team" description="Give each teammate their own account and keep access in one place." />
    <StaffManager people={data ?? []} currentUser={actor.user.id} />
  </PortalShell>
}
