# Study contract

Machine-readable unit: `studies/<slug>/study.json`.
Human write-up: `studies/<slug>/idea.md`.
Mount surface: `studies/<slug>/src/StudyView.tsx` exporting `StudyView`.

The lab (`products/lab`) discovers studies with `import.meta.glob` on those
three files. Adding a study does not require editing a registry.

## `study.json`

```json
{
  "slug": "intent-cascade",
  "title": "菜单意图预测",
  "eyebrow": "Cursor intent · Safe triangle",
  "summary": "One or two sentences. The transferable rule, not the demo skin.",
  "status": "active",
  "tags": ["pointer", "menu", "geometry"]
}
```

| Field | Rule |
| --- | --- |
| `slug` | Matches the folder name. Kebab-case. Names the behavior. |
| `title` | Short Chinese or English title for the catalog card. |
| `eyebrow` | Optional kicker above the title. |
| `summary` | What the user should remember. |
| `status` | `active` \| `draft` \| `retired` |
| `tags` | Lowercase behavior tags, not product names. |

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
