import "server-only";

import type { SpotifyPlaylistRaw, PlaylistSpotifyData } from "./types";
import { isSpotifyPlaylistRaw, isSpotifyTokenResponse } from "./types";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";
const PLAYLIST_FIELDS =
  "id,name,description,external_urls,images,owner(id,display_name,external_urls),followers.total,tracks.total,snapshot_id";

const TOKEN_SAFETY_MARGIN_MS = 60_000;
const PLAYLIST_CACHE_TTL_MS = 5 * 60 * 1000;

export class SpotifyConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpotifyConfigError";
  }
}

export class SpotifyApiError extends Error {
  readonly status: number;
  readonly retryAfter: number | null;

  constructor(message: string, status: number, retryAfter: number | null = null) {
    super(message);
    this.name = "SpotifyApiError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;
let inflightTokenRequest: Promise<string> | null = null;

function getCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new SpotifyConfigError(
      "Spotify credentials are not configured. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your environment."
    );
  }

  return { clientId, clientSecret };
}

async function requestNewToken(): Promise<string> {
  const { clientId, clientSecret } = getCredentials();
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new SpotifyApiError("Failed to authenticate with Spotify.", res.status);
  }

  const json: unknown = await res.json();
  if (!isSpotifyTokenResponse(json)) {
    throw new SpotifyApiError("Unexpected response shape from Spotify token endpoint.", 500);
  }

  const expiresAt = Date.now() + json.expires_in * 1000 - TOKEN_SAFETY_MARGIN_MS;
  cachedToken = { accessToken: json.access_token, expiresAt };
  return json.access_token;
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.accessToken;
  }

  if (!inflightTokenRequest) {
    inflightTokenRequest = requestNewToken().finally(() => {
      inflightTokenRequest = null;
    });
  }

  return inflightTokenRequest;
}

interface PlaylistCacheEntry {
  data: SpotifyPlaylistRaw;
  expiresAt: number;
}

const playlistCache = new Map<string, PlaylistCacheEntry>();

export async function fetchPlaylistRaw(playlistId: string): Promise<SpotifyPlaylistRaw> {
  const cached = playlistCache.get(playlistId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const token = await getAccessToken();
  const url = `${API_BASE}/playlists/${encodeURIComponent(playlistId)}?fields=${encodeURIComponent(
    PLAYLIST_FIELDS
  )}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (res.status === 429) {
    const retryAfterHeader = res.headers.get("Retry-After");
    const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : null;
    throw new SpotifyApiError("Rate limited by Spotify.", 429, Number.isFinite(retryAfter) ? retryAfter : null);
  }

  if (res.status === 404) {
    throw new SpotifyApiError("Playlist not found or not public.", 404);
  }

  if (res.status === 400) {
    throw new SpotifyApiError("Invalid playlist request.", 400);
  }

  if (!res.ok) {
    throw new SpotifyApiError(`Spotify API responded with status ${res.status}.`, res.status >= 500 ? 500 : res.status);
  }

  const json: unknown = await res.json();
  if (!isSpotifyPlaylistRaw(json)) {
    throw new SpotifyApiError("Unexpected response shape from Spotify playlist endpoint.", 500);
  }

  playlistCache.set(playlistId, { data: json, expiresAt: Date.now() + PLAYLIST_CACHE_TTL_MS });
  return json;
}

export function normalizePlaylist(raw: SpotifyPlaylistRaw): PlaylistSpotifyData {
  const image = raw.images && raw.images.length > 0 ? raw.images[0] : null;

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? null,
    spotifyUrl: raw.external_urls.spotify,
    imageUrl: image?.url ?? null,
    owner: raw.owner
      ? {
          id: raw.owner.id,
          displayName: raw.owner.display_name ?? null,
          spotifyUrl: raw.owner.external_urls?.spotify ?? null,
        }
      : null,
    tracksCount: raw.tracks.total,
    savesCount: typeof raw.followers?.total === "number" ? raw.followers.total : null,
    snapshotId: raw.snapshot_id ?? null,
    fetchedAt: new Date().toISOString(),
  };
}
