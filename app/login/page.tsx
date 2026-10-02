import { AuthForm } from '@/components/portal/AuthForm'
import { supabaseConfig } from '@/lib/supabase/config'
import { safeNext } from '@/lib/portal/validation'
export const dynamic = 'force-dynamic'
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const query = await searchParams
  const workspace = query.workspace === 'admin' ? 'admin' : 'artists'
  const mode =
    typeof query.mode === 'string' && ['register', 'forgot', 'reset'].includes(query.mode)
      ? query.mode
      : 'login'
  return (
    <AuthForm
      workspace={workspace}
      next={safeNext(typeof query.next === 'string' ? query.next : '', `/${workspace}`)}
      initialMode={mode}
      configured={Boolean(supabaseConfig())}
      previewAvailable={process.env.NODE_ENV === 'development'}
      confirmationError={query.error === 'confirmation'}
      homeUrl={process.env.NODE_ENV === 'production' ? process.env.SITE_URL || '/' : '/'}
    />
  )
}
