export interface SpotifyImage {
  url: string;
  width: number | null;
  height: number | null;
}

export interface SpotifyOwnerRaw {
  id: string;
  display_name: string | null;
  external_urls?: { spotify?: string };
}

export interface SpotifyPlaylistRaw {
  id: string;
  name: string;
  description: string | null;
  external_urls: { spotify: string };
  images?: SpotifyImage[] | null;
  owner?: SpotifyOwnerRaw | null;
  followers?: { total: number };
  tracks: { total: number };
  snapshot_id?: string;
}

export interface PlaylistOwner {
  id: string;
  displayName: string | null;
  spotifyUrl: string | null;
}

export interface PlaylistSpotifyData {
  id: string;
  name: string;
  description: string | null;
  spotifyUrl: string;
  imageUrl: string | null;
  owner: PlaylistOwner | null;
  tracksCount: number;
  savesCount: number | null;
  snapshotId: string | null;
  fetchedAt: string;
}

export interface PlaylistErrorResult {
  id: string;
  error: true;
  status: number;
  message: string;
  retryAfter?: number | null;
}

export type PlaylistResult = PlaylistSpotifyData | PlaylistErrorResult;

export interface PlaylistsApiResponse {
  playlists: PlaylistResult[];
}

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export function isPlaylistError(result: PlaylistResult): result is PlaylistErrorResult {
  return (result as PlaylistErrorResult).error === true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isSpotifyTokenResponse(value: unknown): value is SpotifyTokenResponse {
  return (
    isRecord(value) &&
    typeof value.access_token === "string" &&
    typeof value.token_type === "string" &&
    typeof value.expires_in === "number"
  );
}

/**
 * Validates only the fields required to render a card: id, name, the public
 * Spotify URL, and a track count. Everything else (images, owner, followers,
 * description, snapshot_id) is genuinely optional in Spotify's API responses
 * for some playlists (e.g. algorithmic or ownerless entries) and must not
 * cause the whole playlist to be rejected — normalizePlaylist() defaults
 * those fields safely instead.
 */
export function isSpotifyPlaylistRaw(value: unknown): value is SpotifyPlaylistRaw {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string" || typeof value.name !== "string") return false;

  const externalUrls = value.external_urls;
  if (!isRecord(externalUrls) || typeof externalUrls.spotify !== "string") return false;

  const tracks = value.tracks;
  if (!isRecord(tracks) || typeof tracks.total !== "number") return false;

  return true;
}
