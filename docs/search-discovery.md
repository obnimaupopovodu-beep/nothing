# Search and AI discovery

## What changed
- Public, server-rendered artist profiles under `/music/artists/[slug]`, independent of the private `/artists` workspace.
- Profiles cover performers credited in the public catalog, including collaborators. Catalog appearances do not imply an exclusive label contract or a complete discography.
- Artists, releases, public directory and homepage are connected with HTML links.
- Every artist and recording has a canonical URL and a stable JSON-LD entity identifier. Artist profiles provide ProfilePage, MusicGroup, recording lists and breadcrumbs. Release pages provide MusicRecording, linked artists and breadcrumbs.
- Sitemap includes the public directory, eight artist profiles and ten current release pages, generated from catalog data.
- Existing wildcard robots policy allows public crawling for Googlebot, Bingbot, OAI-SearchBot and PerplexityBot, preserving all private exclusions. No blanket AI-specific override was added.

## Editing artist facts
Edit `components/data/artistProfiles.ts`. Keys are stage names lowercased with punctuation and spaces removed (FXRNVN → fxrnvn). Add an artist-approved biography, official artist profile URLs in `sameAs`, and confirmed alternative stage names in `aliases`. Empty biographies fall back to factual catalog descriptions. Country, legal names, release dates and other unverified facts are not invented.

Release titles, descriptions, covers and streaming links remain in `components/data/catalog.ts`. Profiles and sitemap automatically follow catalog additions. Keep existing artist names/URLs stable when adding releases.

## Publishing and indexing
1. Deploy the code to uwbelieve.com. Local changes cannot affect public search results.
2. Submit https://uwbelieve.com/sitemap.xml in Google Search Console and Bing Webmaster Tools. Verify domain ownership using their supplied token; do not use a fabricated token.
3. Request indexing for `/music/artists/fxrnvn` and other priority pages.
4. Check the published URLs return 200 without login, CAPTCHA or bot protection challenges. Check real hosting/firewall logs; local robots tests do not prove the production firewall permits crawlers. Preserve protection for account and API routes.
5. Link the public artist pages from verified artist/label social profiles and keep identities and credits consistent across platforms.
6. Monitor indexing, search impressions and referrals. Crawling, indexing, ranking and AI citations are separate decisions; none is guaranteed by metadata or structured data.

## Verification
Production build compiled and generated artist/release pages. HTTP tests without JavaScript verified all 18 detail pages, JSON-LD parsing, canonicals, FXRNVN track names, homepage profile links, sitemap uniqueness/private exclusions, crawler robots policies and unknown-artist 404. TypeScript and direct ESLint checks passed. The existing Next 15 / ESLint 9 build-hook warning remains; direct lint checks were run separately. No live site, firewall, database or search-console account was changed.

Official references:
- https://developers.openai.com/api/docs/bots
- https://docs.perplexity.ai/docs/resources/perplexity-crawlers
- https://developers.google.com/search/docs/appearance/ai-features
