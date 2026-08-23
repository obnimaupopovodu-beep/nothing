export interface PlaylistConfig {
  /** Spotify playlist ID, if already known. Falls back to parsing `url` when omitted. */
  id?: string;
  url: string;
  /** Shown while Spotify data is loading or if a fetch fails. */
  fallbackTitle?: string;
  category?: string;
  description: string;
  /** Static copy shown before live track count is available. */
  fallbackTracks: string;
  mood: string;
  color: string;
  waveColor: string;
  accentRgb: string;
  tags: string[];
  coverUrl: string;
}

/**
 * Source of truth for every playlist rendered in PlaylistsSection.
 * Visual/design fields (mood, color, waveColor, accentRgb, tags, coverUrl)
 * are preserved from the existing component; `id`/`url` feed the Spotify
 * Web API integration in app/api/spotify/playlists/route.ts.
 */
export const playlists: PlaylistConfig[] = [
  {
    id: "1hw4cbGCBd9UDik4fhZZ9E",
    url: "https://open.spotify.com/playlist/1hw4cbGCBd9UDik4fhZZ9E",
    fallbackTitle: "Tiktok hits june 2026",
    category: "Trending",
    description: "fresh tiktok sounds and new trendy ones you might discover here",
    fallbackTracks: "49 tracks",
    mood: "Trending",
    color: "rgba(255, 80, 80, 0.10)",
    waveColor: "rgba(255, 100, 100, 0.66)",
    accentRgb: "255,100,100",
    tags: ["TikTok", "Viral", "June 2026"],
    coverUrl: "https://i.scdn.co/image/ab67706c0000da84b8927783aa3a6046deb59424",
  },
  {
    id: "5XcTJB2F5ISVTkV6VW830X",
    url: "https://open.spotify.com/playlist/5XcTJB2F5ISVTkV6VW830X",
    fallbackTitle: "Yo it's giving vibes",
    category: "Vibes",
    description: "A mood board in playlist form. lowkey, atmospheric, no skip zone.",
    fallbackTracks: "16 tracks",
    mood: "Vibes",
    color: "rgba(122, 176, 255, 0.10)",
    waveColor: "rgba(122, 176, 255, 0.66)",
    accentRgb: "122,176,255",
    tags: ["Chill", "Vibes", "Lowkey"],
    coverUrl: "https://i.scdn.co/image/ab67706c0000da84e3a767f5ecba81eee7a178a6",
  },
  {
    id: "6OqaK1OlgLzWQOKgBFJ0yz",
    url: "https://open.spotify.com/playlist/6OqaK1OlgLzWQOKgBFJ0yz",
    fallbackTitle: "HARDTEKK WHAAAT",
    category: "Hard & Fast",
    description: "Raw, distorted, relentless. Hardtekk at maximum pressure, not for the faint-hearted.",
    fallbackTracks: "47 tracks",
    mood: "Hard & Fast",
    color: "rgba(255, 210, 60, 0.10)",
    waveColor: "rgba(255, 210, 60, 0.68)",
    accentRgb: "255,210,60",
    tags: ["Hardtekk", "Hardcore", "Fast"],
    coverUrl: "https://i.scdn.co/image/ab67706c0000da84e1c409713b1183debe3afbea",
  },
  {
    id: "3e42evYodRnDigOVnk0ndd",
    url: "https://open.spotify.com/playlist/3e42evYodRnDigOVnk0ndd",
    fallbackTitle: "angelcore",
    category: "Ethereal",
    description: "Soft, dreamy, heavenly. Floaty textures and ethereal sounds for celestial minds.",
    fallbackTracks: "20 tracks",
    mood: "Ethereal",
    color: "rgba(214, 182, 255, 0.10)",
    waveColor: "rgba(214, 182, 255, 0.68)",
    accentRgb: "214,182,255",
    tags: ["Angelcore", "Dream", "Soft"],
    coverUrl:
      "https://mosaic.scdn.co/640/ab67616d00001e020dfc4abe47219f9094a8d6d0ab67616d00001e02695c129f5cf1179ce1b8c484ab67616d00001e02a84161d44069af42bf00fc4eab67616d00001e02ce94c7e86e1fbf3d10bb8c394",
  },
  {
    id: "2KW5AHpnw97X4Qp30Tf3Ju",
    url: "https://open.spotify.com/playlist/2KW5AHpnw97X4Qp30Tf3Ju",
    fallbackTitle: "keep on pushing🔒 | 2026",
    category: "Focus",
    description: "yo. looking for smt that will force you to push your best? stay here. you wont regret.",
    fallbackTracks: "93 tracks",
    mood: "Focus",
    color: "rgba(111, 255, 163, 0.10)",
    waveColor: "rgba(111, 255, 163, 0.66)",
    accentRgb: "111,255,163",
    tags: ["Focus", "Lock in", "2026"],
    coverUrl: "https://i.scdn.co/image/ab67706c0000da84a7a1dcd4fa61edc298656630",
  },
];
