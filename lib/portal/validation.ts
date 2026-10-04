import { z } from 'zod'

export const statuses = [
  'draft',
  'submitted',
  'under_review',
  'changes_requested',
  'approved',
  'delivered',
] as const
export type ReleaseStatus = (typeof statuses)[number]
export const statusLabels: Record<ReleaseStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'In review',
  changes_requested: 'Changes requested',
  approved: 'Approved',
  delivered: 'Delivered',
}
const text = (max: number) => z.string().trim().max(max)
export const artistSchema = z
  .object({
    name: text(120),
    role: z.enum(['primary', 'featured']),
    spotify_id: text(100),
    apple_music_id: text(100),
  })
  .strict()
export const creditSchema = z
  .object({
    first_name: text(100),
    last_name: text(100),
    role: z.enum([
      'composer',
      'lyricist',
      'producer',
      'mixing_engineer',
      'mastering_engineer',
      'performer',
      'remixer',
    ]),
  })
  .strict()
export const trackSchema = z
  .object({
    title: text(200),
    version: text(120),
    explicit: z.boolean(),
    language: text(60),
    audio_url: text(2048).refine((value) => !value || /^https:\/\/[^\s]+$/i.test(value), 'Use a secure HTTPS link.'),
    credits: z.array(creditSchema).max(50),
  })
  .strict()
export const releaseSchema = z
  .object({
    title: text(200),
    version: text(120),
    release_type: z.enum(['single', 'ep', 'album']),
    release_date: z.union([z.literal(''), z.iso.date()]),
    genre: text(100),
    notes: text(4000),
    artists: z.array(artistSchema).max(20),
    tracks: z.array(trackSchema).min(1).max(40),
  })
  .strict()
export type ReleaseInput = z.infer<typeof releaseSchema>
export const emptyRelease: ReleaseInput = {
  title: '',
  version: '',
  release_type: 'single',
  release_date: '',
  genre: '',
  notes: '',
  artists: [{ name: '', role: 'primary', spotify_id: '', apple_music_id: '' }],
  tracks: [
    {
      title: '',
      version: '',
      explicit: false,
      language: 'Instrumental',
      audio_url: '',
      credits: [{ first_name: '', last_name: '', role: 'composer' }],
    },
  ],
}
export function submissionIssues(
  value: ReleaseInput,
  today = new Date().toISOString().slice(0, 10),
  allowPastDate = false
) {
  const issues: string[] = []
  if (!value.title) issues.push('Add a release title.')
  if (!value.release_date || (!allowPastDate && value.release_date <= today))
    issues.push(allowPastDate ? 'Choose a release date.' : 'Choose a future release date.')
  if (!value.genre) issues.push('Choose a genre.')
  if (!value.artists.some((a) => a.role === 'primary' && a.name))
    issues.push('Add at least one primary artist.')
  if (value.artists.some((a) => !a.name)) issues.push('Complete or remove empty artist entries.')
  if (value.release_type === 'single' && value.tracks.length !== 1)
    issues.push('A single must contain exactly one track.')
  value.tracks.forEach((track, index) => {
    if (!track.title) issues.push(`Track ${index + 1}: add a title.`)
    if (!track.language) issues.push(`Track ${index + 1}: add a language or Instrumental.`)
    if (!track.audio_url) issues.push(`Track ${index + 1}: add a WAV or FLAC download link.`)
    if (!track.credits.some((c) => c.role === 'composer' && c.first_name && c.last_name))
      issues.push(`Track ${index + 1}: add a composer with their legal first and last names.`)
    if (track.credits.some((c) => !c.first_name || !c.last_name))
      issues.push(`Track ${index + 1}: complete or remove empty credits.`)
  })
  return issues
}
export function safeNext(value: string | null | undefined, fallback = '/artists') {
  return value && /^\/(artists|admin)(\/|$)/.test(value) && !/[\\\r\n]/.test(value)
    ? value
    : fallback
}
