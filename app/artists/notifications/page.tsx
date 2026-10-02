import { PortalHeading } from '@/components/portal/PortalShell'
import { Notifications } from '@/components/portal/Notifications'
import { requireActor } from '@/lib/portal/auth'
export default async function NotificationsPage() {
  const actor = await requireActor()
  const { data, error } = await actor.client
    .from('label_notifications')
    .select('id,release_id,message,created_at,read_at')
    .eq('user_id', actor.user.id)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw new Error('Unable to load notifications.')
  return (
    <>
      <PortalHeading
        kicker="Stay in the loop"
        title="Notifications"
        description="Feedback, status changes, and the next steps for your music."
      />
      <Notifications items={data || []} />
    </>
  )
}
