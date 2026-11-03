# Optional release metadata and artwork requests

Apply `supabase/migrations/20261103132629_optional_release_metadata_and_artwork_request.sql` in the existing Supabase project SQL Editor before deploying this app version. The cloud database has not been changed by this local implementation.

- Empty release date is stored as SQL NULL. A supplied artist date must still be in the future.
- Empty genre is accepted as undecided.
- Artwork: “Ask label to make one” is saved in label_releases.artwork_requested, defaults to false on existing releases, and is shown to staff in the release review. An uploaded image may remain as a reference; checking the box does not delete it.
- Existing RLS, ownership checks, artist-team permissions, revision checks and direct-release grants are preserved.

Verification: npm run typecheck; npm run test:platform.
