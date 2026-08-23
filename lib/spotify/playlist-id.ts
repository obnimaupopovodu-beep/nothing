/**
 * Extracts a Spotify playlist ID from any of the accepted input formats:
 *  - https://open.spotify.com/playlist/{id}
 *  - https://open.spotify.com/playlist/{id}?si=...
 *  - spotify:playlist:{id}
 *  - {id}
 *
 * Returns null if no valid 22-character base62 playlist ID can be found.
 */
const PLAYLIST_ID_PATTERN = /^[A-Za-z0-9]{22}$/;

export function extractPlaylistId(value: string): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const uriMatch = trimmed.match(/^spotify:playlist:([A-Za-z0-9]{22})$/);
  if (uriMatch) return uriMatch[1];

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const segments = url.pathname.split("/").filter(Boolean);
      const playlistIndex = segments.indexOf("playlist");
      const candidate = playlistIndex !== -1 ? segments[playlistIndex + 1] : undefined;
      if (candidate && PLAYLIST_ID_PATTERN.test(candidate)) {
        return candidate;
      }
      return null;
    } catch {
      return null;
    }
  }

  if (PLAYLIST_ID_PATTERN.test(trimmed)) {
    return trimmed;
  }

  return null;
}
