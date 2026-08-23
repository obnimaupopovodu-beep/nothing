import { NextRequest, NextResponse } from "next/server";

import { fetchPlaylistRaw, normalizePlaylist, SpotifyApiError, SpotifyConfigError } from "@/lib/spotify/client";
import { extractPlaylistId } from "@/lib/spotify/playlist-id";
import type { PlaylistResult, PlaylistsApiResponse } from "@/lib/spotify/types";
import { isPlaylistError } from "@/lib/spotify/types";

export const dynamic = "force-dynamic";

const MAX_CONCURRENT_REQUESTS = 4;
const MAX_IDS_PER_REQUEST = 50;

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function run(): Promise<void> {
    while (cursor < items.length) {
      const currentIndex = cursor;
      cursor += 1;
      results[currentIndex] = await worker(items[currentIndex]);
    }
  }

  const workerCount = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: workerCount }, () => run()));

  return results;
}

async function resolvePlaylist(rawInput: string): Promise<PlaylistResult> {
  const id = extractPlaylistId(rawInput);

  if (!id) {
    return {
      id: rawInput,
      error: true,
      status: 400,
      message: "Could not parse a Spotify playlist ID from the provided value.",
    };
  }

  try {
    const raw = await fetchPlaylistRaw(id);
    return normalizePlaylist(raw);
  } catch (err) {
    if (err instanceof SpotifyConfigError) {
      return {
        id,
        error: true,
        status: 500,
        message: "Spotify integration is not configured on the server.",
      };
    }

    if (err instanceof SpotifyApiError) {
      return {
        id,
        error: true,
        status: err.status,
        message: err.message,
        retryAfter: err.retryAfter,
      };
    }

    return {
      id,
      error: true,
      status: 500,
      message: "Unexpected error while fetching this playlist.",
    };
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<PlaylistsApiResponse | { error: string }>> {
  const idsParam = request.nextUrl.searchParams.get("ids");

  if (!idsParam || !idsParam.trim()) {
    return NextResponse.json({ error: 'Missing required "ids" query parameter.' }, { status: 400 });
  }

  const rawValues = Array.from(
    new Set(
      idsParam
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );

  if (rawValues.length === 0) {
    return NextResponse.json(
      { error: 'The "ids" query parameter must contain at least one playlist id or URL.' },
      { status: 400 }
    );
  }

  if (rawValues.length > MAX_IDS_PER_REQUEST) {
    return NextResponse.json(
      { error: `Too many playlist ids requested. Maximum is ${MAX_IDS_PER_REQUEST}.` },
      { status: 400 }
    );
  }

  const playlists = await mapWithConcurrency(rawValues, MAX_CONCURRENT_REQUESTS, resolvePlaylist);

  const headers = new Headers();
  const rateLimited = playlists.find((item) => isPlaylistError(item) && item.status === 429 && item.retryAfter);
  if (rateLimited && isPlaylistError(rateLimited) && rateLimited.retryAfter) {
    headers.set("Retry-After", String(rateLimited.retryAfter));
  }
  headers.set("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=60");

  return NextResponse.json({ playlists }, { status: 200, headers });
}
