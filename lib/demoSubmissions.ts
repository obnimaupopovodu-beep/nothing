import 'server-only'
import { randomUUID } from 'node:crypto'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { supabaseConfig } from '@/lib/supabase/config'
export type DemoSubmissionInput = { alias: string; email: string; scLink: string; notes: string }
const ALLOWED_STATUSES = ['new', 'approved', 'rejected'] as const
export type DemoSubmissionStatus = (typeof ALLOWED_STATUSES)[number]
export function isValidDemoSubmissionStatus(value: string): value is DemoSubmissionStatus {
  return (ALLOWED_STATUSES as readonly string[]).includes(value)
}
export type DemoSubmission = DemoSubmissionInput & { id: string; status: string; createdAt: string }
type Row = {
  id: string
  alias: string
  email: string
  sc_link: string
  notes: string | null
  status: string
  created_at: string
}
export class DemoSubmissionError extends Error {
  constructor(
    message: string,
    public status = 500
  ) {
    super(message)
    this.name = 'DemoSubmissionError'
  }
}
function map(row: Row): DemoSubmission {
  return {
    id: row.id,
    alias: row.alias,
    email: row.email,
    scLink: row.sc_link,
    notes: row.notes || '',
    status: row.status,
    createdAt: row.created_at,
  }
}
export function isDemoSubmissionsConfigured() {
  return Boolean(supabaseConfig())
}
export async function createDemoSubmission(input: DemoSubmissionInput) {
  const config = supabaseConfig()
  if (!config) throw new DemoSubmissionError('Demo submissions are temporarily unavailable.', 503)
  // The public role can insert, but cannot read any submitted contact information.
  const client = createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const row: Row = {
    id: randomUUID(),
    alias: input.alias,
    email: input.email,
    sc_link: input.scLink,
    notes: input.notes,
    status: 'new',
    created_at: new Date().toISOString(),
  }
  const { error } = await client.from('demo_submissions').insert(row)
  if (error) {
    console.error('[demo] Insert failed', { code: error.code })
    throw new DemoSubmissionError('Unable to save demo submission.', 503)
  }
  return map(row)
}
export async function listDemoSubmissions(client: SupabaseClient) {
  const { data, error } = await client
    .from('demo_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) throw new DemoSubmissionError('Unable to load demo submissions.', 503)
  return { configured: true, submissions: (data as Row[]).map(map) }
}
export async function updateDemoSubmissionStatus(
  client: SupabaseClient,
  id: string,
  status: DemoSubmissionStatus
) {
  const { data, error } = await client
    .from('demo_submissions')
    .update({ status })
    .eq('id', id)
    .select('*')
    .maybeSingle()
  if (error) throw new DemoSubmissionError('Unable to update demo submission.', 503)
  if (!data) throw new DemoSubmissionError('Submission not found.', 404)
  return map(data as Row)
}
export async function deleteDemoSubmission(client: SupabaseClient, id: string) {
  const { error } = await client.from('demo_submissions').delete().eq('id', id)
  if (error) throw new DemoSubmissionError('Unable to delete demo submission.', 503)
}
