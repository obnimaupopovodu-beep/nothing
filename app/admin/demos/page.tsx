import { PortalShell, PortalHeading } from '@/components/portal/PortalShell'
import { requireActor } from '@/lib/portal/auth'
import { listDemoSubmissions } from '@/lib/demoSubmissions'
import { AdminSubmissionsList } from '../AdminSubmissionsList'
export default async function DemosPage() {
  const actor = await requireActor('admin')
  const { submissions } = await listDemoSubmissions(actor.client)
  return (
    <PortalShell actor={actor} workspace="admin">
      <PortalHeading
        kicker="Label / Discovery"
        title="Demo inbox"
        description="Tracks submitted through the landing page and artist accounts, ready for a first listen."
      />
      <AdminSubmissionsList initialSubmissions={submissions} />
    </PortalShell>
  )
}
