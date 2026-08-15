# How to add a study

One folder per idea. Do not start a second implementation of the same idea
in another folder unless the first one is retired.

Read `docs/study-contract.md` together with this file.

## Name

Use a short kebab-case slug that names the *behavior*, not the product it
came from.

Good: `intent-cascade`, `magnetic-snap`, `undo-stack-ime`.
Bad: `amazon-menu`, `grok-demo`, `new-study`.

## Required files

```
studies/<slug>/
  AGENTS.md
  README.md
  idea.md
  study.json
  src/StudyView.tsx     export function StudyView
  src/main.tsx          standalone shell only
  references/           optional evidence
```

`idea.md` is the human catalog unit. It should answer:

1. What breaks for the user if this idea is missing?
2. What is the actual rule (geometry, timing, state machine)?
3. Why is a naive alternative worse?
4. Where did it come from, and what did we refuse to copy?

`study.json` is the machine catalog unit. The lab glob-loads it.

## Runtime

- Each study owns its own `package.json` (workspace package `@lightui/<slug>`).
- Bind playgrounds to `127.0.0.1`.
- Use **relative imports** inside the study. The lab compiles `StudyView`
  from outside the study root.
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
