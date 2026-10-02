# Workspace design

The artist portal, label portal, local preview and authentication pages share `app/workspace.css` and `components/portal/WorkspaceFrame.tsx`.

- Satoshi is self-hosted in `public/fonts`, sourced from Fontshare's official Satoshi CSS API.
- Charcoal and warm off-white surfaces use one cobalt action color. Semantic status colors remain distinct from actions.
- Theme follows the system until a user chooses a workspace theme. The choice is stored locally and leaves the public landing page's appearance intact.
- GSAP introductions and login image motion use scoped cleanup, responsive matchMedia and reduced-motion preferences. Only the desktop login's brand panel may pin; forms remain in the document flow.
- `/preview` is development-only. Its profile, notifications, demo inbox and release forms reuse the real components with writes disabled. Feedback carousel entries are explicitly sample updates.
- Existing routes, authentication, API validation and release workflow remain in place. This redesign makes no remote database changes.

Local preview: `npm run dev -- --port 3001`, then open `/preview`, `/preview?workspace=admin` or `/login`.
