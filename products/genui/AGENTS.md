# Generative UI (`products/genui`)

Product root for agent-facing native components. This package is a skeleton:
one example component, a registry, and the v0 contract. No sandbox bridge,
no component kit, no second theme.

## Commands

```bash
npm test
npm run typecheck
npm run build
```

From the workspace root these run as part of `make test` and `make typecheck`.

## Public entry

Other packages may import `@lightui/genui`, which resolves to `src/index.ts`.
`package.json` `exports` exposes that path only.

Do not import `src/components/*`, `src/registry.ts`, `contract/*`, or any
`@lightui/genui/...` subpath. Studies and `products/lab` follow the same rule.
`npm test` and `npm run typecheck` fail when a scanned file breaks it.

This package does not import `studies/*` or `products/lab`.

## Contract

`contract/v0/` is what LightAgent reads. Version rules: `contract/README.md`.

- `components.json` — native components. Keep `src/registry.ts` aligned by
  editing both. The registry must not import the JSON.
- `render-route.json` — in-place route errors (`unknown_component`,
  `invalid_props`). Implementation: `src/render-route.ts`.
- `sandbox.json` — sandbox activity (field order, callbacks, height, trust).
  Implementation: `src/sandbox.ts`.

None of those TypeScript files import the JSON. `src/contract.test.ts` and
`src/protocol.test.ts` fail on drift. The human statement is
`docs/protocol-v0.md`.

## Styles

Reference variables from the workspace `design/tokens.css` (`var(--color-fg)`,
`var(--font-sans)`, and the rest of that file). Do not add `@theme`, a palette,
or a local stylesheet that redefines tokens.

## Out of scope here

The render-route and sandbox-bridge playgrounds stay in `studies/`. This
package holds their shared protocol and checks, not the pages. CopilotKit /
OpenIntelligentUI runtimes stay out.
