export type DemoSubmissionInput = {
  alias: string
  email: string
  scLink: string
  notes: string
}

const ALLOWED_STATUSES = ['new', 'approved', 'rejected'] as const
export type DemoSubmissionStatus = (typeof ALLOWED_STATUSES)[number]

export function isValidDemoSubmissionStatus(value: string): value is DemoSubmissionStatus {
  return (ALLOWED_STATUSES as readonly string[]).includes(value)
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

export class DemoSubmissionError extends Error {
  status: number

  constructor(message: string, status = 500) {
    super(message)
    this.name = 'DemoSubmissionError'
    this.status = status
  }
}

export function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.SUPABASE_ANON_KEY
  const key = serviceRoleKey ?? anonKey
  const keySource = serviceRoleKey ? 'service_role' : anonKey ? 'anon' : 'none'
  return { url, key, keySource, configured: Boolean(url && key) }
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

function logSupabaseFailure(action: string, response: Response, keySource: string, url: string, body: string) {
  console.error(`[demoSubmissions] Supabase ${action} failed`, {
    status: response.status,
    statusText: response.statusText,
    keySource,
    supabaseUrl: url,
    body,
  })
}

export async function createDemoSubmission(input: DemoSubmissionInput) {
  const { url, key, keySource } = getSupabaseConfig()
  if (!url || !key) {
    console.error('[demoSubmissions] Supabase not configured', {
      hasUrl: Boolean(url),
      hasKey: Boolean(key),
    })
    throw new DemoSubmissionError('Supabase is not configured yet.', 503)
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
    const details = await response.text()

    // Server-side only: never sent to the client. This is the actual
    // Supabase/PostgREST error body, which tells us exactly what's wrong
    // (bad apikey, RLS policy name, missing table, etc.) instead of a
    // generic message.
    logSupabaseFailure('insert', response, keySource, url, details)

    if (response.status === 404) {
      throw new DemoSubmissionError('Supabase table demo_submissions was not found.', 500)
    }

    if (response.status === 401 || response.status === 403) {
      throw new DemoSubmissionError('Supabase key or table policy does not allow saving demos.', 500)
    }

    throw new DemoSubmissionError(
      details || 'Supabase rejected the demo submission.',
      500
    )
  }

  const rows = (await response.json()) as SupabaseSubmissionRow[]
  return mapRow(rows[0])
}

export async function listDemoSubmissions() {
  const { url, key, keySource } = getSupabaseConfig()
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
    const details = await response.text()
    logSupabaseFailure('list', response, keySource, url, details)
    throw new Error(details)
  }

  const rows = (await response.json()) as SupabaseSubmissionRow[]
  return { configured: true, submissions: rows.map(mapRow) }
}

export async function updateDemoSubmissionStatus(id: string, status: DemoSubmissionStatus) {
  const { url, key, keySource } = getSupabaseConfig()
  if (!url || !key) {
    throw new DemoSubmissionError('Supabase is not configured yet.', 503)
  }

  const response = await fetch(`${url}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      ...getHeaders(key),
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    const details = await response.text()
    logSupabaseFailure('status update', response, keySource, url, details)

    if (response.status === 401 || response.status === 403) {
      throw new DemoSubmissionError('Supabase key or table policy does not allow updating demos.', 500)
    }

    throw new DemoSubmissionError(details || 'Supabase rejected the status update.', 500)
  }

  const rows = (await response.json()) as SupabaseSubmissionRow[]
  if (!rows[0]) {
    throw new DemoSubmissionError('Submission not found.', 404)
  }

  return mapRow(rows[0])
}

export async function deleteDemoSubmission(id: string) {
  const { url, key, keySource } = getSupabaseConfig()
  if (!url || !key) {
    throw new DemoSubmissionError('Supabase is not configured yet.', 503)
  }

  const response = await fetch(`${url}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      ...getHeaders(key),
      Prefer: 'return=minimal',
    },
  })

  if (!response.ok) {
    const details = await response.text()
    logSupabaseFailure('delete', response, keySource, url, details)

    if (response.status === 401 || response.status === 403) {
      throw new DemoSubmissionError('Supabase key or table policy does not allow deleting demos.', 500)
    }

    throw new DemoSubmissionError(details || 'Supabase rejected the delete request.', 500)
  }
}
