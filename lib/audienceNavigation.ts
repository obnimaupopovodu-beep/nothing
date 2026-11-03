const PREFIX = 'uwbelieve:audience-intro:'
export function rememberAudienceIntro(path: string) {
  if (path !== '/' && path !== '/for-artists') return
  try { sessionStorage.setItem(PREFIX + path, '1') } catch { /* In-memory navigation still works. */ }
}
export function audienceIntroSeen() {
  if (typeof window === 'undefined') return false
  try { return sessionStorage.getItem(PREFIX + location.pathname) === '1' } catch { return false }
}
