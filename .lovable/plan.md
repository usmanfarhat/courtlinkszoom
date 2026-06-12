## What I'll build

A public, no-login Ontario courthouse directory that pulls live from your Google Sheet on every load. Visitors browse courthouses, expand to see courtrooms with Zoom links and sign-up sheets, search across everything, click links to open them, or copy non-link text (like dial-in numbers) with one tap.

Source sheet columns detected: `Courthouse`, `Courtroom`, `Zoom`, `Sign Up Sheet`, `Comments`. Cells contain either URLs or plain text (e.g. Zoom dial-in numbers, meeting IDs, or "No").

## Pages

- `/` — Home. Hero, global search, full courthouse list grouped by city with courtroom counts. Click a courthouse to expand inline (or jump to its detail page).
- `/courthouse/$slug` — Detail page for one courthouse. It will contain a header-like details container with key emails and phone numbers. Leave it static for now. We will fetch this data later from another data source. Followed by the header, show a search bar to act as a filter for the list of courtrooms associated with the courthouse. Then, show a list of the courtrooms associated with the courthouse which will get filtered through the searchbar and would otherwise be scrollable and clickable. Each courtroom should be expandable, showing its Zoom, Sign Up Sheet, and Comments columns. Each cell auto-detects link vs. text: links open in a new tab; text gets a copy button. Per-courthouse search.
- 404 + error boundaries on all routes.

## Data flow

- Server function fetches the published CSV (`/export?format=csv&gid=629952750`) from the sheet, parses it with `papaparse`, normalizes rows, and groups by courthouse. Cached for 5 minutes server-side so the site stays fast but reflects sheet edits quickly.
- Loaders prime TanStack Query; components read with `useSuspenseQuery`. A "Refresh" button bypasses the cache on demand.
- No database, no auth. You edit the sheet, the site updates within minutes.

## Features

- Global search only for courthouse, then local search only for courtrooms.
- Smart cells: if value starts with `http`, render as external link with icon; otherwise show as monospace text with a copy-to-clipboard button (toasts on copy). Multi-line cells (Zoom + dial-in + meeting ID) render each line separately so each can be copied independently.
- "No" / empty values render as a muted dash, not a button.
- Two ad slots (header banner + sidebar/footer) as styled placeholder cards, easy for you to swap for real ad code later.
- Sticky header with logo, search, and a "View source sheet" link.

Sort cities alphabetically, show courtroom counts.

- Fully responsive; mobile-first list view, desktop two-column layout.
- SEO meta per route, sitemap-friendly courthouse URLs.

## Design

You asked for a stronger identity. I'll generate 3 rendered design directions (locked typography/palette/layout decisions, varied composition and energy) and let you pick one before I build. Direction will lean editorial and trustworthy — appropriate for a legal-adjacent tool — not the generic Softr template look.

## Tech

- TanStack Start routes: `index.tsx`, `courthouse.$slug.tsx`, plus 404/error components.
- `src/lib/courthouses.functions.ts` — `createServerFn` that fetches + parses the CSV with `papaparse`.
- `src/lib/cell-format.ts` — utility that splits a cell into typed segments (link | text | empty).
- shadcn components: Input, Button, Card, Table, Badge, Toast, Skeleton.
- No Lovable Cloud, no secrets needed (sheet is public).

## Open items I'll assume unless you say otherwise

- Sheet stays publicly viewable (required for the CSV export endpoint).
- 5-minute cache is fine; visitors can force-refresh.
- Ad slots stay as static placeholders for now.