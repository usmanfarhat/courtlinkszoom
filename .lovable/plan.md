# Plan

### 1. Homepage search (`src/routes/index.tsx`)

- Remove the "Search Registry" button entirely.
- Keep the form's `onSubmit` Enter-to-open behavior when `filtered.length === 1`.
- Adjust the search bar layout so the input fills the row cleanly without the trailing button.
- Replae the result count indicator on the right with static total count of courthouses, populated once when the data loads.

### 2. Courtroom expand animation (`src/routes/courthouse.$slug.tsx`)

- Replace the manual `openRooms` Set + conditional render with the existing shadcn `Accordion` (`type="multiple"`), which already ships with `accordion-down` / `accordion-up` keyframes for smooth height + opacity transitions.
- Each courtroom becomes an `AccordionItem`; the trigger holds the courtroom name and chevron, the content holds the Zoom / Sign Up Sheet / Comments grid.
- Styling preserved (divided list, hover background, padding).

### 3. Sorting (`src/lib/courthouses.functions.ts`)

- Use a natural-order comparator (`localeCompare` with `numeric: true, sensitivity: "base"`) so values starting with digits sort 0–9 before A–Z, and multi-digit numbers sort naturally (e.g. `2` before `10`).
- Apply to courthouses array and to each courthouse's `courtrooms` array before returning.

### 4. Remove auto-numbering (`src/routes/courthouse.$slug.tsx`)

- Delete the `<span className="font-mono text-xs text-brand-muted w-10 shrink-0">{idx+1}</span>` element from each courtroom row.

### 5. Edit the header bar

- Delete the global search bar from the header on every page.
- Delete the "Source data" link from the header, footer, and everywhere else.



No other files affected. No data-shape or routing changes.