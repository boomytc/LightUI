# How to add a study

One folder per idea. Do not start a second implementation of the same idea
in another folder unless the first one is retired.

Read `docs/study-contract.md` together with this file.

## Name

Use a short kebab-case slug that names the *behavior*, not the product it
came from.

Good: `intent-cascade`, `magnetic-snap`, `undo-stack-ime`.
Bad: `amazon-menu`, `grok-demo`, `new-study`.

## Kind or new study

Same **question**, a new skin → add a kind to the existing study.
A new **question you must answer first** → open `studies/<slug>/`, set
`asks`, and hang `links` (`after` / `contrast`) on the graph.

The first question is not only “which widget machine is this.” It may be:

| Kind of question | What the user hits | Example |
| --- | --- | --- |
| Machine / taxonomy | Looks the same, commits / occupies / opens differently | 下拉框、导航栏、侧边栏、页签、控件 |
| Construction | Naive assembly shows a seam | 内凹角：挖孔还是缝回去 |
| Motion-follow | The motion is tied to the wrong property or unit | 扫光跟字走还是跟块走 |
| Continuous → discrete | Pointer / scroll maps onto the wrong grain | 视线落到格子；斜向穿越该不该换项 |

A later idea is another `studies/<slug>/`. It does not need a new top-level
lab tab (效果 / 几何 / 游戏) or a workspace-level component library.

| Looks like | Still the same question | Different question |
| --- | --- | --- |
| Another mega panel | Site IA columns in `nav-taxonomy` | What the panel **commits** → `dropdown-taxonomy` |
| Another left rail | Occupancy / expand in `sidebar-taxonomy` | Whether vertical is the primary nav at all → `nav-taxonomy` |
| Another slide-in | Off-canvas occupancy in `sidebar-taxonomy` | Small-screen hamburger from the edge → `nav-taxonomy` |
| Another inverted corner | Cut vs stitch in `inverted-notch` | A different hole (not a card chip) → new study |
| Another text shine | Glyph-follow in `glyph-sweep` | A box-level sheen → new study |
| Another look-at-pointer face | Quantize in `look-quantize` | A mascot / game product → leave it out |
| Another in-page tab row | Selection model in `tab-taxonomy` | Site nav placement → `nav-taxonomy` |
| Another form field | Fill vs pick in `control-taxonomy` | What a downward panel **commits** → `dropdown-taxonomy` |
| Another tidy form | What to disclose in `fill-taxonomy` | When to speak → `validation-taxonomy`; fill vs pick → `control-taxonomy` |
| Another centered dialog | Interrupt / attach in `overlay-taxonomy` | Small-screen hamburger → `nav-taxonomy`; off-canvas rail → `sidebar-taxonomy` |
| Another toast | Notice weight in `notify-taxonomy` | A blocking dialog → `overlay-taxonomy` |
| Another error message | When to speak in `validation-taxonomy` | Fill vs pick → `control-taxonomy`; what to disclose → `fill-taxonomy` |
| Another spinner | Measurable or not in `progress-taxonomy` | A result toast → `notify-taxonomy` |
| Another chart | What the data is for in `chart-taxonomy` | Dashboard drill → `dashboard-layers` |
| Another banner slider | How frames advance in `carousel-taxonomy` | A notice marquee → `notify-taxonomy` |
| Another page grid | Page skeleton in `layout-taxonomy` | Rail occupancy → `sidebar-taxonomy` |
| Another CTA | Action weight in `button-taxonomy` | Fill vs pick → `control-taxonomy` |
| Another hero block | First-glance job in `hero-taxonomy` | Login staging → `login-taxonomy` |
| Another login page | Staging in `login-taxonomy` | Page skeleton → `layout-taxonomy` |
| Another alignment tweak | Baseline vs box in `align-craft` | Page skeleton → `layout-taxonomy` |
| Another dashboard | Drill vs platter in `dashboard-layers` | Chart intent → `chart-taxonomy` |
| Another AI chat shell | Where the assistant lives in `assistant-chrome` | Page skeleton → `layout-taxonomy` |
| Another loading spinner | Layout placeholder in `pending-taxonomy` | Measurable wait → `progress-taxonomy` |
| Another card glow | Border path in `border-beam` | Glyph-follow → `glyph-sweep` |
| Another study timer | Count-up vs count-down in `timer-taxonomy` | Measurable work → `progress-taxonomy` |
| Another flashcard | Recall grade after flip in `recall-grade` | Advancing frames → `carousel-taxonomy` |
| Another cooler scrollbar | Cue vs track in `scroll-chrome` | Work progress → `progress-taxonomy`; section spy → `nav-taxonomy` |

Do not merge these into one encyclopedia because the fixtures look alike.
The graph keeps the questions apart. Isolated nodes are allowed; only add
`after` / `contrast` when the condition is real.

The teaching surface follows the question. A taxonomy may switch kinds. A
construction may be one object plus the wrong alternative. A single
behavior may be one playground with toggles. Do not require a seven-kind
switcher.

## Required files

```
studies/<slug>/
  AGENTS.md
  README.md
  idea.md
  study.json
  src/StudyView.tsx     export function StudyView
  src/StageView.tsx     export function StageView (fixture, no chrome)
  src/main.tsx          standalone shell only
```

Do not commit stills. `studies/<slug>/references/` is optional local
output and is gitignored. Capture from the stage with `make stills`.
The study itself is the idea, the machines, the playground, and the
stage.

`idea.md` is the human catalog unit. It should answer:

1. What breaks for the user if this idea is missing?
2. What is the actual rule (geometry, timing, state machine)?
3. Why is a naive alternative worse?

`study.json` is the machine catalog unit. The lab glob-loads it.
Set `created` and `updated` (`YYYY-MM-DD`). Bump `updated` when the
idea or playground changes. Set `asks` (the question) and `links`
(next questions / mix-ups). Do not write “和另外 N 则” in `idea.md`.

## Runtime

- Each study owns its own `package.json` (workspace package `@lightui/<slug>`).
- Bind playgrounds to `127.0.0.1` and give each Vite study a unique port.
  Lab is `5173`. Taken: `5174` intent-cascade, `5175` dropdown-taxonomy,
  `5176` sidebar-taxonomy, `5177` nav-taxonomy, `5178` inverted-notch,
  `5179` glyph-sweep, `5180` look-quantize, `5181` tab-taxonomy,
  `5182` control-taxonomy, `5183` overlay-taxonomy, `5184` notify-taxonomy,
  `5185` validation-taxonomy, `5186` progress-taxonomy, `5187` chart-taxonomy,
  `5188` carousel-taxonomy, `5189` layout-taxonomy, `5190` button-taxonomy,
  `5191` hero-taxonomy, `5192` login-taxonomy, `5193` align-craft,
  `5194` dashboard-layers, `5195` assistant-chrome, `5196` pending-taxonomy,
  `5197` border-beam, `5198` timer-taxonomy, `5199` recall-grade,
  `5200` scroll-chrome, `5201` bm25-explain,
  `5202` container-morph, `5203` drag-commit, `5204` guide-interrupt,
  `5205` chart-read, `5206` expand-inflow, `5207` page-append,
  `5208` fill-taxonomy.
  Next free: `5209`.
- Use **relative imports** inside the study. The lab compiles `StudyView`
  and `StageView` from outside the study root.
- Import visual tokens from `design/tokens.css`. Do not fork the palette.
- Keep demo fixtures next to the playground. Do not import another study.
- If two studies later share a true primitive, extract it then.

## After adding

```bash
make catalog
make test
make typecheck
make dev
```

Confirm the new card on `/studies` and the live view on `/s/<slug>`.

Public essays about a study belong in `writing/notes/`, not inside the
study folder. See `docs/writing.md`.
