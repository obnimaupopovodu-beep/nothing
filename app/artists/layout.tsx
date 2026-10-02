import { PortalShell } from '@/components/portal/PortalShell'
import { requireActor } from '@/lib/portal/auth'
export const dynamic = 'force-dynamic'
export default async function ArtistLayout({ children }: { children: React.ReactNode }) {
  const actor = await requireActor()
  return <PortalShell actor={actor}>{children}</PortalShell>
}
