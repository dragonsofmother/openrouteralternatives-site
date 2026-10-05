# openrouteralternatives.eu

A source-driven comparison table of OpenRouter alternatives: AI gateways, model routers
and multi-provider AI APIs, compared by model coverage, provider diversity, OpenAI API
compatibility, EU jurisdiction, data residency, infrastructure, deployment and company
characteristics.

Production domain: <https://openrouteralternatives.eu>
Repository: <https://github.com/openrouteralternatives/openrouteralternatives-site>

## Editorial contract

The site publishes **no overall score**, **no ranking** and names no single "best"
alternative. Two rules follow from that and are enforced in code rather than by
convention:

1. **Nothing is ordered without a stated, measurable criterion.** The table opens in
   alphabetical order. The gateway name and jurisdiction columns do not sort at all. Every
   other sortable column declares exactly one direction with `sortDescFirst` in
   [`components/comparison/columns.tsx`](components/comparison/columns.tsx) — largest or
   deepest first for measured quantities, the taxonomy order for labelled ones — and the
   table never reverses it, so a sort can never be flipped to promote rows that hold no
   value. Model count is always the second order: applying any filter orders the matching
   rows by it, largest first, and it breaks ties under every column sort. Rows without a
   value stay at the bottom whatever the column.
2. **Uncertainty is displayed, never smoothed over.** Every value is a
   `Field<T>` ([`types/field.ts`](types/field.ts)) carrying a `DataStatus`. A field with
   no supported value has `value: null` and renders its status — `Not recorded`,
   `Not disclosed`, `Not applicable` — with a tooltip explaining what that means. No
   component substitutes a placeholder number.

## Look

A terminal. One monospace face (JetBrains Mono), square corners, no shadows, hairline
and dashed rules, a shell prompt for a wordmark, bracketed navigation and command-line
flags for the filters. Two palettes share that grammar and are switched by the theme
toggle (class on `<html>`, system preference as the default): paper and ink with a deep
green accent, and a phosphor display. All tokens live in [`app/globals.css`](app/globals.css);
the evidence vocabulary prints as glyphs (● measured, ○ official, ◇ catalogue, — not
published) defined on `METRIC_STATUS` in [`lib/taxonomy.ts`](lib/taxonomy.ts).

The link preview card (`og:image` and `twitter:image`) is rendered once at build time by
[`app/opengraph-image.tsx`](app/opengraph-image.tsx) from
[`lib/social-image.tsx`](lib/social-image.tsx): the dark palette, six gateway marks from
`public/logos`, and JetBrains Mono from [`app/fonts`](app/fonts) (SIL Open Font License, text
alongside). It is served at `/opengraph-image`.

## Stack

Next.js 16 (App Router, React 19) · TypeScript strict · Tailwind CSS v4 ·
TanStack Table v9 · Radix primitives · Lucide icons. Fully static: no database, no
backend API, no runtime data fetching. The one external read is the repository's star
count for the header button, fetched once at build time; `GITHUB_TOKEN` is optional and
only lifts the API rate limit.

## Site structure

Two routes.

The **homepage** carries, in order: a short introduction with the catalogue snapshot
date and a link to `/why`, the comparison table with its filters and data-status legend,
the methodology that explains how to read the table (definitions always visible, longer
explanations in disclosure blocks), and how to contribute.

The table shows ten columns by default — gateway, jurisdiction, EU residency, models,
certifications, employees, providers / routes, OpenAI compatibility, modalities, and
deployment with zero data retention — sized in proportion to one another so they fill a
laptop screen without horizontal scrolling. Funding, observability, ownership, pricing,
gateway location and social reach are recorded and shown in every expanded row.

**`/why`** sets out why the project exists: why a gateway at all, why choosing one is a
jurisdiction decision rather than a hosting decision, the US legal authorities involved
with links to the primary texts, and how that reasoning became table columns.

Routes from earlier revisions (`/compare`, `/gateways`, `/categories`, `/blog` and their
children) redirect permanently to the homepage in [`next.config.ts`](next.config.ts).

## Layout

```
app/                    routes; every page is statically generated
  page.tsx              introduction, comparison table, methodology, contribute
  why/                  why the project exists: gateways, jurisdiction and the US legal authorities involved
  sitemap.ts robots.ts not-found.tsx error.tsx loading.tsx
components/
  comparison/           table, columns, filters, expanded row, mobile cards, data legend
  gateways/             logo
  home/                 hero, methodology, contribute
  layout/ ui/           header, footer, page header, primitives
data/                   the only place facts live
  gateways.ts           canonical dataset
  sources.ts            source hierarchy shown in the methodology section
  why.ts                copy for the homepage intro and the /why page, including the cited legal texts
  changelog.ts          dated record of dataset and site changes (history, not a public page)
  site.ts               site constants, navigation and footer links
lib/                    filtering, formatting, metrics, SEO, table config, taxonomy
types/                  shared types
scripts/
  audit-dataset.ts      dataset integrity audit (npm run audit)
  firecrawl/            research tooling for refreshing gateway data (see its README)
  measure/              enumerates public model endpoints with the counting rule (npm run measure:models)
  **/*.test.ts          unit tests for the scripts' pure logic (npm test)
research/firecrawl/     output of the Firecrawl scripts; raw captures are git-ignored
research/measurements/  dated model-endpoint enumerations, one JSON per gateway per run
public/logos/           locally stored gateway marks with a provenance table
content/                editorial notes that are not rendered data
```

`data/` holds facts, `lib/` holds logic, `components/` holds presentation. No gateway
information is hard-coded in JSX; the table, its expanded rows and the mobile cards all
read the same canonical records.

## Working with the dataset

### Adding a gateway

Append a `createGateway({ ... })` entry to [`data/gateways.ts`](data/gateways.ts). Only
the fields you can source need to be written; [`lib/create-gateway.ts`](lib/create-gateway.ts)
fills the rest with `needs-verification`, so an unfilled field can never be mistaken for a
researched one. The table row, its expanded detail and the mobile card follow
automatically.

### Recording a new model measurement

Model counts are dated observations, not attributes. Append a `measured(...)` observation
to the metric's history rather than editing an existing figure:

```ts
models: metric(
  measured(1102, "2026-09-22", { scope: "llm", sourceIds: ["models-endpoint"] }),
  [measured(1038, "2026-09-15", { scope: "llm", sourceIds: ["models-endpoint"] })],
),
```

The table reads the newest entry and keeps the earlier ones on the record. Add a matching
entry to [`data/changelog.ts`](data/changelog.ts) so the superseded figure stays on record.

### OpenAI compatibility

`openaiCompatible` is a `Field<"yes" | "partial" | "no" | "unknown">`. It is recorded only
from the vendor's documentation or from an endpoint this project exercised, with a source
id on the record, and it is shown as a label in its own table column. It is never used to
rank anything. A record whose documentation has not been checked keeps `value: null`,
which renders as "Unknown" with a not-recorded status — a different statement from a
documented `"unknown"`.

### Routes and endpoints

`routes` (model × provider combinations) and `endpoints` (individually addressable API
entries, using the vendor's own definition) are two `Metric` fields like `models` and
`providers`. They sit beneath the provider count in the "Providers / routes" column:
`routesOrEndpoints()` in [`lib/gateway.ts`](lib/gateway.ts) picks whichever carries a
figure, labelled, and the expanded row shows the second one where a vendor publishes both.
Neither is ever computed from the other or from modalities.

### Funding and observability

`funding` is a `Field<Funding>` — the number of disclosed financing rounds, the investors
named in them and, where the company states one, the total raised. It describes the
operating company, so Kong's rounds are Kong Inc.'s and a hyperscaler product records
`not-applicable`. Funding that could not be publicly verified is `not-published`
("Not publicly listed"), never zero; a disputed round count keeps the `conflicting` status
with both figures in the note. Investors render as a line in the expanded table row; there
is no funding column.

`observability` is a `Field<"none" | "basic" | "limited" | "detailed" | "advanced">`, read
from vendor documentation against the five-level scale defined in the methodology section
and in `OBSERVABILITY` in [`lib/taxonomy.ts`](lib/taxonomy.ts). It is shown in the
expanded row and the mobile card, and it is never used to rank anything.

### Applying a research pass

The September 17, 2026 verified research is the current source of truth for vendor
figures and company attributes. Where it publishes a figure, that figure is the metric's
`current` observation; this project's own endpoint measurements stay in `history`. Where
it publishes none, the measurement remains current. Counts copied from vendor pages are
shown as floors rounded down to the nearest ten (72 → "70+", exact value kept for
sorting); integration counts of customer-configured gateways carry the `documented`
status and are shown and labelled. Sorting is semantic and single-direction throughout:
model and route counts sort on their numeric value (a floor such as 700+ on 700),
employees on the band's lower bound, deployment on the number of documented options, and
residency, OpenAI compatibility, ownership and pricing on the orders declared in
[`lib/taxonomy.ts`](lib/taxonomy.ts).

## Refreshing data with Firecrawl

[`scripts/firecrawl/`](scripts/firecrawl/README.md) collects each gateway's public pages
through the Firecrawl API and extracts structured *candidates* with verbatim evidence and
source URLs. The scripts read `FIRECRAWL_API_KEY` from the environment or `.env` (see
`.env.example`), write to `research/firecrawl/`, and never touch `data/gateways.ts`.
Every candidate is verified against its cited page by a person before it is recorded in
the canonical dataset.

```bash
npm run firecrawl:targets   # list the URLs that would be collected, no API call
npm run firecrawl:discover  # find pricing, legal, docs and security pages the dataset does not cite
npm run firecrawl:extract   # Markdown + schema-guided candidates per gateway, one request per page
npm run firecrawl:collect   # Markdown only, when no extraction is wanted
npm run firecrawl:diff      # candidate vs dataset, field by field, no API call
npm run measure:models      # enumerate public model endpoints with the counting rule (not Firecrawl)
```

## Keeping bias out

Every vendor is evaluated with the same published methodology, and the protections are
structural rather than promised: nothing on the site is ranked, the default table order
is alphabetical, every sort runs in one declared direction with unrecorded values at the
bottom, measured and provider-stated counts are always labelled apart, and no gateway is
excluded from a filter it qualifies for. `npm run audit` enforces the structural parts of
the dataset.

## Data status in the current revision

Three research passes are recorded in [`data/changelog.ts`](data/changelog.ts):

- **September 8, 2026** — the project's original catalogue baseline.
- **September 15, 2026** — validated company research: registry-confirmed
  entities, jurisdictions, size bands, ownership changes and certifications.
- **September 15, 2026** — catalogues re-counted directly from public
  endpoints, and two acquisitions confirmed against the acquirers' own
  announcements.

### Evidence, not blanks

Quantitative values are `Metric` objects ([types/metric.ts](types/metric.ts)),
not bare numbers. Each carries a `MetricStatus` saying what kind of evidence it
is, and a value with no number still carries its reason:

| Status | Shown as | Means |
| --- | --- | --- |
| `measured` | `360` · Measured | Counted by this project from a public endpoint on the date shown |
| `official` | `700+` · Official | A figure the provider publishes about itself |
| `catalogue` | `286` · Catalogue | From an official catalogue that is not a headline number |
| `secondary` | `500+` · Reported | A reputable third party, where no primary source exists |
| `not_published` | `—` · Not published | The provider publishes no comparable figure |
| `variable` | `Variable` · Configured by you | Availability depends on what the customer configures |
| `not_comparable` | `N/A` · Different metric | A figure exists but counts routes, endpoints or something else |
| `conflicting` | `Multiple` · Multiple figures | Credible sources disagree, and the disagreement is preserved |

### Counting rules the code enforces

- **Models, routes, endpoints and providers are four different quantities.**
  Portkey's published 1,600+ counts endpoints, so it is recorded as
  `endpoints` and its model count reads "Different metric". Requesty's 684 are
  endpoints; its 545 deduplicated models are counted separately.
- **Measured and provider-stated figures are labelled apart.** A vendor's own
  number is never shown as a measurement, and a measurement is never replaced
  by a vendor's number.
- **History is never overwritten.** Superseded measurements and a provider's
  own figure both stay in `history` on the record.

Unresolved fields are classified rather than lumped together. Run
`npm run audit` for the split and [content/data-todo.md](content/data-todo.md)
for what would close each one.

## Brand assets

`public/logos/` holds a mark for every gateway in the dataset, each taken from the vendor's
own website and listed with its origin in [`public/logos/README.md`](public/logos/README.md).
`GatewayLogo` renders a stable monogram for any record with `logo: null`, so no entry
depends on hotlinking a third party's image, and `npm run audit` fails if a record points
at a file that does not exist.

## Commands

```bash
npm run dev                # development server
npm run build              # production build
npm run start              # serve the production build
npm run typecheck          # tsc --noEmit
npm run lint               # eslint
npm run audit              # dataset integrity + unresolved-field classification
npm test                   # unit tests for the research scripts (node --test via tsx)
npm run firecrawl:targets  # Firecrawl: list collectable URLs (no API call)
npm run firecrawl:discover # Firecrawl: map each site for uncited pricing, legal, docs and security pages
npm run firecrawl:collect  # Firecrawl: capture pages to research/firecrawl/raw
npm run firecrawl:extract  # Firecrawl: capture pages and write candidates to research/firecrawl/candidates
npm run firecrawl:diff     # compare candidates with data/gateways.ts (no API call)
npm run measure:models     # enumerate public model endpoints into research/measurements
```

## Accessibility and performance notes

Pages are server components; client JavaScript is limited to the table interactions,
mobile navigation and theme toggle. Status is never conveyed by colour alone — every badge
carries text, and every icon-only control has an accessible label. The comparison table
uses `aria-sort` on sortable headers, `aria-expanded` on row toggles, a sticky header and
sticky first column, and becomes one card per gateway below the `lg` breakpoint rather
than a squeezed table. Methodology details use native disclosure elements, so they need no
JavaScript.
