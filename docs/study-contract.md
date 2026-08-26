# Study contract

Machine-readable unit: `studies/<slug>/study.json`.
Human write-up: `studies/<slug>/idea.md`.
Mount surface: `studies/<slug>/src/StudyView.tsx` exporting `StudyView`.
Stage: `studies/<slug>/src/StageView.tsx` exporting `StageView`.
Generated stills are not part of the contract.

The lab (`products/lab`) discovers studies with `import.meta.glob`.
Adding a study does not require editing a registry.

## `study.json`

```json
{
  "slug": "intent-cascade",
  "title": "多级菜单",
  "eyebrow": "Cursor intent · Safe triangle",
  "summary": "One or two sentences. The transferable rule, not the demo skin.",
  "asks": "斜向穿越该不该换项？",
  "asksEn": "Should a diagonal crossing switch the item?",
  "links": [
    { "slug": "other-slug", "rel": "after", "when": "若改成 hover 跟手", "whenEn": "if it became hover-tracking" }
  ],
  "status": "active",
  "created": "2026-08-15",
  "updated": "2026-08-15",
  "tags": ["pointer", "menu", "geometry"]
}
```

| Field | Rule |
| --- | --- |
| `slug` | Matches the folder name. Kebab-case. Names the behavior. |
| `title` | Short Chinese or English title for the catalog card. |
| `eyebrow` | Optional kicker above the title. |
| `summary` | What the user should remember. |
| `asks` | The question this study answers. The node in the judgment graph. |
| `links` | Outbound edges. `after` is the next question; `contrast` is a mix-up. `when` is the condition. |
| `status` | `active` \| `draft` \| `retired` |
| `created` | First day the study existed. `YYYY-MM-DD`. |
| `updated` | Last day the idea or playground changed. Bump it when you edit. `YYYY-MM-DD`. |
| `tags` | Lowercase behavior tags, not product names. |

Do not keep a neighbor census in `idea.md` (“和另外 N 则”). The lab assembles the graph from `asks` + `links`. An edge names the next question, not a headcount.

Same question, new skin → add a kind. New question → new study, then `links`.
Do not fold nav / sidebar / dropdown / notch / sweep / look / tab / control /
overlay / notify / validation / fill / progress / chart / carousel / layout / button /
hero / login / align / dashboard-layers / assistant / pending / beam / timer /
recall / scroll into one catalog because the fixtures look alike.

A study’s first question may be a machine (taxonomy), a construction
(cut vs stitch), a motion that follows type or scroll, or continuous
input quantized to discrete state. `StudyView` follows that question;
it is not required to be a kind switcher.

The lab sorts `active` first, then `updated` descending, then `created`, then slug. Use the calendar day, not a clock time.

## `StudyView`

```tsx
export function StudyView() {
  // self-contained teaching surface: playground + the controls it needs
}
```

- Relative imports only (`../lib/...`). The lab compiles this file from
  outside the study root; a study-local `@/` alias will not resolve.
- Do not mount a second site header. The lab and the standalone shell
  each provide chrome.
- Bind standalone `vite` to `127.0.0.1`.

## `StageView`

```tsx
export function StageView() {
  // one kind, one locked state, no lab chrome
}
```

The stage is how this repo presents a fixture: one kind, one complete
state, no site header, no「说清楚」, no sibling modules. Lab mounts it at
`/s/<slug>/stage` with that study’s query and does not put that URL
in the site nav. Standalone playgrounds use `?stage=1` with the same
query. Stills are captured from this URL (`make stills`), not from the
teaching page.

Lock is per-study. Taxonomy widgets often use `kind` + `state=closed|open`.
A construction may lock `exploded`. A sweep may lock a parked beam. A look
map may lock a cell. Do not freeze the global contract to `closed|open`.

`src/lib/stage-query.ts` is a small helper copied into each study that
reads query params. Do not import it across studies. If you change a
study’s own query, update that copy and `scripts/capture-stage.py`.

## Discovery paths (from `products/lab/src/lib/catalog.ts`)

```
../../../../studies/*/study.json
../../../../studies/*/idea.md
../../../../studies/*/src/StudyView.tsx
../../../../studies/*/src/StageView.tsx
```
