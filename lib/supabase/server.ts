import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { supabaseConfig, sessionCookieOptions } from './config'

export async function createSupabaseServerClient() {
  const config = supabaseConfig()
  if (!config) throw new Error('Platform is not configured. Please contact the label.')
  const jar = await cookies()
  return createServerClient(config.url, config.key, {
    cookieOptions: sessionCookieOptions,
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (values) => {
        // Middleware refreshes cookies before Server Components render.
        try {
          values.forEach(({ name, value, options }) =>
            jar.set(name, value, { ...options, ...sessionCookieOptions })
          )
        } catch {
          /* Server Component cookies are read only. */
        }
      },
    },
  })
}

export function createSupabaseServiceClient() {
  const config = supabaseConfig()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!config || !key)
    throw new Error('Artwork uploads are not configured. Please contact the label.')
  return createClient(config.url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
