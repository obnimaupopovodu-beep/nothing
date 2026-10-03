export const RELEASE_PATH_EVENT = 'uwbelieve:release-path-selected'
export const RELEASE_PATH_NOTES = {
  Release: "I'm interested in direct release management and distribution for this track.",
  Promotion: "I'm interested in release promotion, social campaigns and playlist outreach for this track.",
  'Re-release': "I'm interested in re-releasing an existing track and giving it a new promotional push.",
} as const
export type ReleasePath = keyof typeof RELEASE_PATH_NOTES

export function applyReleasePathNote(current: string, path: ReleasePath) {
  // Replace the previous choice while preserving the artist's own notes.
  const personalNote = current.split('\n').filter(line =>
    !Object.values(RELEASE_PATH_NOTES).some(template => template === line.trim())
  ).join('\n').trim()
  return [RELEASE_PATH_NOTES[path], personalNote].filter(Boolean).join('\n\n')
}
