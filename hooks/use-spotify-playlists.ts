"use client";

import { useEffect, useState } from "react";

import type { PlaylistResult, PlaylistsApiResponse } from "@/lib/spotify/types";

interface UseSpotifyPlaylistsResult {
  /** Keyed by the Spotify playlist ID that was actually resolved and requested. */
  data: Record<string, PlaylistResult>;
  isLoading: boolean;
  /** Set only for request-level failures (network/parse). Per-playlist errors live in `data`. */
  error: string | null;
}

/**
 * Fetches live Spotify metadata for a batch of playlist ids/URLs from the
 * internal `/api/spotify/playlists` route (never calls Spotify directly).
 * A single request covers all ids; one failing playlist never blocks the rest.
 */
export function useSpotifyPlaylists(idsOrUrls: string[]): UseSpotifyPlaylistsResult {
  const [data, setData] = useState<Record<string, PlaylistResult>>({});
  const [isLoading, setIsLoading] = useState<boolean>(idsOrUrls.length > 0);
  const [error, setError] = useState<string | null>(null);

  const key = idsOrUrls.join(",");

  useEffect(() => {
    if (!key) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetch(`/api/spotify/playlists?ids=${encodeURIComponent(key)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Spotify data request failed with status ${res.status}.`);
        }
        return (await res.json()) as PlaylistsApiResponse;
      })
      .then((json) => {
        const map: Record<string, PlaylistResult> = {};
        for (const item of json.playlists) {
          map[item.id] = item;
        }
        setData(map);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load Spotify data.");
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [key]);

  return { data, isLoading, error };
}
