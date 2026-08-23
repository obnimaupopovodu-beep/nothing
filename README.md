This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Spotify integration

The playlists section (`components/sections/PlaylistsSection.tsx`) enriches each configured playlist with live data from the Spotify Web API: real cover art, name, curator, track count, and saves/followers. All requests happen server-side through `/api/spotify/playlists`, the browser never talks to Spotify directly and never sees your credentials.

### 1. Create a Spotify Developer App

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Click **Create app**, fill in a name/description, and accept the terms (a redirect URI is required by the form but unused by this integration, any valid URL works, e.g. `http://localhost:3000`).
3. Open the app, click **Settings**, and copy the **Client ID** and **Client Secret**.

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```

`.env.local` is git-ignored and must never be committed.

### 3. Run the app

```bash
npm install
npm run dev
```

If credentials are missing or invalid, playlist cards show a small "Data temporarily unavailable" state instead of crashing, and the "Open in Spotify" link keeps working using the URLs already configured in `lib/spotify/playlists-config.ts`.

### Where to edit the playlist list

Playlists are defined in [`lib/spotify/playlists-config.ts`](./lib/spotify/playlists-config.ts) as a typed array (`PlaylistConfig[]`). Add, remove, or reorder entries there, each accepts any of these `url`/`id` formats:

```text
https://open.spotify.com/playlist/{id}
https://open.spotify.com/playlist/{id}?si=...
spotify:playlist:{id}
{id}
```

### Limitations

- Only metadata for **public** playlists is available through the Client Credentials flow.
- "Saves" / "Followers" shown on each card is Spotify's `followers.total` field, the number of users who saved the playlist. It is **not** listens, streams, or unique listeners.
- Spotify's API does not expose the list of users who saved a playlist, only the count.
- Data is fetched fresh per request to `/api/spotify/playlists` but cached on the server for about 5 minutes, and the access token is cached until shortly before it expires.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Remember to add `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` as environment variables in your Vercel project settings, they are required in production too.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
