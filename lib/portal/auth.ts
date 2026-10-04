import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { supabaseConfig } from '@/lib/supabase/config'

export const getActor = cache(async () => {
  if (!supabaseConfig()) return null
  const client = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await client.auth.getUser()
  if (error || !user || user.is_anonymous) return null
  const { error: profileError } = await client.rpc('label_ensure_profile')
  if (profileError) throw new Error('The platform database is not ready. Please contact the label.')
  const { error: claimError } = await client.rpc('label_claim_demo_submissions')
  if (claimError) throw new Error('Unable to reconnect your demo submissions. Please contact the label.')
  const [{ data: profile }, { data: roles, error: rolesError }] = await Promise.all([
    client.from('label_profiles').select('*').eq('id', user.id).single(),
    client.from('label_roles').select('role').eq('user_id', user.id),
  ])
  if (rolesError) throw new Error('Unable to verify workspace access.')
  const staff = Boolean(roles?.some((r) => r.role === 'admin' || r.role === 'label_manager'))
  const admin = Boolean(roles?.some((r) => r.role === 'admin'))
  return {
    client,
    user,
    profile: profile as {
      id: string
      display_name: string
      legal_first_name: string
      legal_last_name: string
      spotify_id: string
      apple_music_id: string
    } | null,
    staff,
    admin,
  }
})
export type Actor = NonNullable<Awaited<ReturnType<typeof getActor>>>
export async function requireActor(workspace: 'artists' | 'admin' = 'artists') {
  const actor = await getActor()
  if (!actor) redirect(`/login?workspace=${workspace}`)
  if (workspace === 'admin' && !actor.staff) {
    const artistHome = process.env.NODE_ENV === 'production' && process.env.ARTIST_HOSTNAME
      ? `https://${process.env.ARTIST_HOSTNAME}/`
      : '/artists'
    redirect(`${artistHome}?notice=staff-only`)
  }
  return actor
}
