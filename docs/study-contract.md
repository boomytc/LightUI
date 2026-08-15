# Study contract

Machine-readable unit: `studies/<slug>/study.json`.
Human write-up: `studies/<slug>/idea.md`.
Mount surface: `studies/<slug>/src/StudyView.tsx` exporting `StudyView`.
Generated stills and films are not part of the contract.

The lab (`products/lab`) discovers studies with `import.meta.glob` on those
three files. Adding a study does not require editing a registry.

## `study.json`

```json
{
  "slug": "intent-cascade",
  "title": "菜单意图预测",
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
Do not fold nav / sidebar / dropdown into one catalog because the fixtures look alike.

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

## Discovery paths (from `products/lab/src/lib/catalog.ts`)

```
../../../../studies/*/study.json
../../../../studies/*/idea.md
../../../../studies/*/src/StudyView.tsx
```
