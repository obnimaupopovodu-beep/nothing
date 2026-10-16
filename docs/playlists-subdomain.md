# Playlists subdomain

The Spotify collections live at `https://playlists.uwbelieve.com/` in the same
Next.js project. The main landing page has no playlist section or navigation links.

## Local preview

Run `npm run dev`, then open `/playlists` on the local server. For host-based
routing, open `http://playlists.localhost:3000/` (use the port reported by Next.js).
The latter serves the playlist page at `/`, matching the production subdomain.

## Production setup

1. Add `playlists.uwbelieve.com` to the Domains settings of the existing Vercel project.
2. Add the DNS record Vercel specifies for that hostname at the DNS provider.
3. Deploy this revision to that project.

Host-based rewrites in `next.config.ts` serve the page without changing the URL.
On the public main domains, `/playlists` redirects to the subdomain. On the
subdomain, `/playlists` redirects to `/` to keep one public address.
Canonical metadata, robots.txt and sitemap.xml use the playlists subdomain.
The playlist page links back to the main website; the main website does not link
to playlists. No separate Vercel project or additional environment variables are required.
