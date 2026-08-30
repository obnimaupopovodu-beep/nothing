export type DemoSubmissionInput = {
  alias: string
  email: string
  scLink: string
  notes: string
}

export type DemoSubmission = DemoSubmissionInput & {
  id: string
  status: string
  createdAt: string
}

type SupabaseSubmissionRow = {
  id: string
  alias: string
  email: string
  sc_link: string
  notes: string | null
  status: string | null
  created_at: string
}

const TABLE = 'demo_submissions'

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY
  return { url, key, configured: Boolean(url && key) }
}

function getHeaders(key: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
}

function mapRow(row: SupabaseSubmissionRow): DemoSubmission {
  return {
    id: row.id,
    alias: row.alias,
    email: row.email,
    scLink: row.sc_link,
    notes: row.notes ?? '',
    status: row.status ?? 'new',
    createdAt: row.created_at,
  }
}

export function isDemoSubmissionsConfigured() {
  return getSupabaseConfig().configured
}

export async function createDemoSubmission(input: DemoSubmissionInput) {
  const { url, key } = getSupabaseConfig()
  if (!url || !key) {
    throw new Error('Supabase is not configured.')
  }

  const response = await fetch(`${url}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: {
      ...getHeaders(key),
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      alias: input.alias,
      email: input.email,
      sc_link: input.scLink,
      notes: input.notes,
      status: 'new',
    }),
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  const rows = (await response.json()) as SupabaseSubmissionRow[]
  return mapRow(rows[0])
}

export async function listDemoSubmissions() {
  const { url, key } = getSupabaseConfig()
  if (!url || !key) {
    return { configured: false, submissions: [] as DemoSubmission[] }
  }

  const query = new URLSearchParams({
    select: '*',
    order: 'created_at.desc',
  })

  const response = await fetch(`${url}/rest/v1/${TABLE}?${query}`, {
    headers: getHeaders(key),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  const rows = (await response.json()) as SupabaseSubmissionRow[]
  return { configured: true, submissions: rows.map(mapRow) }
}
