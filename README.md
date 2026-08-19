# Student Management Dashboard

A school administration dashboard for managing classes, rosters and student records, built on the provided starter and its local mock API (MSW).

An administrator can review the school at a glance, open a class, search its roster through the API, inspect a student on a dedicated URL, enrol an existing student, and remove one behind a confirmation step.

---

## Setup

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

No backend or database is required: the mock API runs in the browser as a Service Worker (`public/mockServiceWorker.js`), started before the app renders.

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (includes a TypeScript pass) |
| `npm start` | Serves the production build |
| `npm test` | Runs the test suite once |
| `npm run test:watch` | Test suite in watch mode |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

> `axios` is imported by `src/lib/api.ts` in the starter but was missing from `package.json`; it is now a declared dependency.

---

## Technologies

**Required:** React 19, Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Axios, Git.

**Added, with reasons:**

| Library | Why |
| --- | --- |
| **TanStack Query** | Server state here is cached, refetched and invalidated by mutations. Query handles caching, in-flight/error state, request cancellation and post-mutation invalidation, which would otherwise be hand-rolled `useEffect` code in every view. |
| **shadcn/ui + Base UI** | Already in the starter (`src/components/ui`). Reused rather than replaced: `Button`, `Dialog`, `Table`, `Input`. |
| **Vitest + Testing Library + MSW (node)** | Tests run against the project's own MSW handlers, so they verify the real request/response contract. |

**Deliberately not added:** Zustand (the only cross-page state is one persisted class id — a 90-line external store covers it), React Hook Form / Zod (the single "form" is a one-field picker; a schema layer would be ceremony without a payoff).

---

## Implementation

### Layered structure

```
src/
├── app/                    Routes. Server components resolve params, then hand off to a view.
├── components/
│   ├── ui/                 Starter primitives (untouched apart from usage)
│   ├── common/             Cross-cutting: state panels, toasts, confirm dialog, pagination, search
│   ├── layout/             App shell, navigation pane, theme toggle
│   ├── dashboard/ classes/ students/    Feature components
├── hooks/queries/          TanStack Query hooks + a key factory
├── services/               Axios calls, one function per endpoint. No React.
├── lib/                    Pure helpers: formatting, pagination, error normalisation, stores
├── types/api.ts            The API contract
└── test/                   Test setup, MSW node server, render helper
```

The rule that drives it: **components never touch axios, and services never touch React.** A component calls a hook, the hook calls a service, the service is the only thing that knows about URLs and response envelopes. Swapping the mock API for a real one is a change inside `src/services`.

### Data fetching and state

- **One axios instance** (`src/lib/api.ts`) with a response interceptor that converts every failure into an `ApiError` carrying a `kind` (`not_found` / `conflict` / `validation` / `network` / `server`) and a message safe to show an administrator. No component ever inspects an axios error shape.
- **Query keys** live in one factory (`src/hooks/queries/query-keys.ts`), so a mutation invalidates `queryKeys.classes.all` instead of string-matching keys at the call site.
- **Retries are conditional.** A 404 or 409 is the server's final answer, so it is surfaced immediately; only network and 5xx failures are retried.
- **Client state stays in React**, and the two persisted preferences (selected class, sidebar state) use `useSyncExternalStore` over a tiny localStorage store. Reading storage in an effect would cause a second render and a hydration mismatch; an external store renders the server snapshot during hydration and switches once.

### Search

Roster search is **server-side**, as required: the term is debounced (300 ms), passed to `GET /classes/:classId/students?search=`, and each distinct term is cached under its own query key. Previous rows stay on screen while a new term is in flight (`placeholderData`), so the table does not collapse into a spinner on every keystroke. The term is mirrored into `?q=` so a filtered view can be linked or restored.

### Enrolment and removal

Both mutations show a pending state, disable the buttons involved, report the outcome in a toast, and invalidate the roster so the list updates from the server rather than from a guess.

Duplicate enrolment is handled twice over: students already on the roster are listed but disabled and labelled "Already enrolled", and if the API still returns `409` (someone else got there first) the message is shown and the roster is refetched so the row greys out. Removal is destructive, so it goes through a confirmation dialog that cannot be dismissed mid-request.

### Loading, error and empty states

Every async surface has all three, and empty is split by cause — "no students in this class yet" (offering enrolment) reads differently from "no students match your search" (offering to clear it). Errors show the API's message, the status code, and a retry button. Lists use skeletons that match the row layout rather than a bare spinner.

### Accessibility

Semantic landmarks and a skip link; the navigation pane marks the active route with `aria-current="page"` plus a shape change, not colour alone; the mobile drawer is a labelled `role="dialog"` that locks the page behind it, closes on Escape, takes focus on open and returns it to the trigger on close; the student picker is a `radiogroup`; status changes are announced through `aria-live` regions; every icon-only control has an accessible name; focus is visible throughout; `prefers-reduced-motion` is respected.

### Responsive

The roster is a table above `md` and a stacked card list below it, where six columns would either overflow or shrink past readability. Navigation is a fixed pane on desktop (collapsible to an icon rail) and an overlay drawer on small screens. Light and dark themes are both supported, with the theme applied before first paint to avoid a flash.

---

## Completed features

- [x] **Dashboard** — total students, total classes, active students (with share), students not in any class, and access to every class.
- [x] **Class overview** — class name, ID, enrolled count, and the roster with full name, student ID, gender, age and enrollment status.
- [x] **Search** — server-side, by name or student ID, debounced, URL-synced, with a distinct no-results state.
- [x] **Student details** — own URL (`/students/STU-004`), works on direct navigation and reload, showing every field the API returns plus the derived class and age.
- [x] **Enrol a student** — searchable picker, loading state, success/error feedback, list refresh, duplicate prevention.
- [x] **Remove a student** — confirmation dialog, loading state, success/error feedback, list refresh.
- [x] **Navigation** — Dashboard, Classes and Students; clear active state; distinct from content; desktop pane with collapse and mobile drawer with open/close.
- [x] **Loading, error, empty and disabled states** throughout, with retry where it makes sense.
- [x] **API integration** — all seven endpoints, no hardcoded application data.
- [x] **Optional: pagination** — on the roster (8/page) and the directory (10/page), URL-synced.
- [x] **Optional: state persistence** — the selected class survives navigation and reload, and is linked from the navigation pane.
- [x] **Optional: accessibility** — see above.
- [x] **Tests** — 50 across helpers, services (against the real handlers) and UI flows.

### Extras beyond the brief

A student directory at `/students` (parent route for student details), light/dark theme, a collapsible desktop navigation pane, and a boot screen that waits for the mock worker so a hard reload of a deep URL cannot race it.

---

## Assumptions

1. **A student belongs to at most one class.** The API has no student → class field, so membership is derived by finding the class whose `studentIds` contains the student. The data set has no student in two classes.
2. **Directory search is client-side, roster search is server-side.** `GET /students` accepts no `search` parameter (only `GET /classes/:classId/students` does), so the enrolment picker and `/students` filter the fetched list in the browser. The requirement to use the API's search applies to the class roster, which does.
3. **Pagination is client-side.** No endpoint accepts page/limit parameters. Slicing happens in `src/lib/paginate.ts`; moving to server-side pagination means changing one query hook, since the UI consumes a `Page<T>` shape either way.
4. **The mock API is the API.** MSW runs in `next dev` and in a production build alike, so the app is runnable from a single `npm run dev` as the brief requires.
5. **No authentication.** The brief describes a single administrator; the user chip in the header is static.

---

## Testing

```bash
npm test
```

50 tests in 6 files:

| Area | What it covers |
| --- | --- |
| `src/lib/format.test.ts` | Name/date/age formatting, including the timezone bug a `toLocaleDateString` approach would introduce |
| `src/lib/paginate.test.ts` | Page slicing, out-of-range clamping, empty collections, ellipsis windows |
| `src/lib/api-error.test.ts` | Status → error-kind mapping, server messages preserved, network failures, retry classification |
| `src/services/classes.service.test.ts` | Every endpoint against the project's MSW handlers: envelopes, server-side search by name and ID, 404s, duplicate-enrolment 409 |
| `src/components/common/pagination.test.tsx` | Disabled edges, `aria-current`, page reporting |
| `src/components/classes/class-detail-view.test.tsx` | Full flows: roster render, search → no results → clear, remove with confirm and with cancel, enrol with a disabled already-enrolled option |

The suite drives the same MSW handlers the browser uses, so a change to the API contract fails the tests rather than only the app.

---

## Limitations

- **No end-to-end browser tests.** Flows are covered at component level in jsdom. A Playwright run would additionally cover real Service Worker registration and CSS-dependent behaviour (the roster's table/card switch is a media query, invisible to jsdom).
- **Class membership is derived, not authoritative.** If a student ever appeared in two classes, the student page would show the first match.
- **The roster's "enrolled" count comes from `GET /classes/:classId`,** while the table's count comes from the roster response. They agree, but they are two sources.
- **Recovery from a failed Service Worker start requires a reload** — the boot screen offers the button rather than retrying silently, since a failed registration usually needs the dev server restarted.

## Further improvements

1. **Server-driven pagination and directory search** the moment the API supports them: both are one hook change, with the UI untouched.
2. **Optimistic updates** for enrol/remove, with rollback on failure, so the roster reacts instantly instead of after a refetch.
3. **Playwright smoke tests** on the four main routes, plus an axe pass in CI.
4. **Sorting and filtering** on the roster (status, age, name) once there are enough students per class for it to matter.
5. **Bulk actions** — enrolling one student at a time is fine for four; a term rollover would want multi-select.
6. **A CI workflow** running lint, typecheck, test and build on every push. All four pass locally today.

---

## Notes on the starter

Two starter issues surfaced while building and are fixed here:

1. `axios` was imported but not declared in `package.json`.
2. `MSWProvider` started the worker inside an effect with no guard. React Strict Mode runs effects twice in development, and the second `worker.start()` throws *"cannot configure an already enabled network"* — which would drop an already-booted app onto an error screen. The start promise is now cached at module scope.
