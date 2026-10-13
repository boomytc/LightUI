# LightUI protocol v0

Human-readable statement of two agreements LightAgent and LightUI share.
The files LightAgent reads are under `products/genui/contract/v0/`. Do not
treat this note as a second contract, and do not generate those JSON files
from the TypeScript implementation.

Protocol id: `lightui.genui`. Version directory: `v0`.

Native components stay in `components.json`. The route envelope and the
sandbox payload are not components.

## Render route errors

File: `products/genui/contract/v0/render-route.json`.

One turn is one route object (`surface`, `reason`, `text`, `component`,
`props`, `document`). That object is an envelope. It is not registered as a
native component, and it is not mounted.

After the JSON has closed, a native surface is checked against the catalog:

| Result | Code | What the host does |
| --- | --- | --- |
| The component name is not in the catalog | `unknown_component` | Show the code in place |
| Props fail that component's schema | `invalid_props` | Show the code in place |

Both results stay on the error. The host does not fall back to another
route and does not degrade the turn to plain text.

A partial JSON packet is not an error. The host waits until the value
closes, then validates. A fragment that already contains `native`, `Text`,
or a component name does not mount anything.

## Sandbox activity

File: `products/genui/contract/v0/sandbox.json`.

One payload streams six fields, in this order:

| Order | Field | Value | Host flag when the JSON value closes |
| --- | --- | --- | --- |
| 1 | `initialHeight` | number | `initialHeightComplete` |
| 2 | `placeholderMessages` | string array | `placeholderMessagesComplete` |
| 3 | `css` | string | `cssComplete` |
| 4 | `html` | string array | `htmlComplete` |
| 5 | `jsFunctions` | string | `jsFunctionsComplete` |
| 6 | `jsExpressions` | string array | `jsExpressionsComplete` |

`html` and `jsExpressions` are string arrays. `placeholderMessages` is a
string array as well. `css` and `jsFunctions` are single strings.

`generating` is a host flag, not an extra payload field. It stays true
while the source is still open, including after every `*Complete` flag is
set, and becomes false when the source ends.

Finished payloads reject unknown fields. Callbacks are a separate whitelist,
also `additionalProperties: false`:

| Function | Arguments | Accept | Reject |
| --- | --- | --- | --- |
| `sendPrompt` | `{ text }` only | `text` is a string whose trimmed length is 1–4000 | Empty, too long, non-string, or any other field |
| `openLink` | `{ url }` only | `url` trims to an absolute URL with protocol `https:` | Any other protocol, unparseable URL, or any other field |

A call whose name is not in that table is rejected. Unknown fields on a
callback message are rejected. The host does not treat the rejection as a
successful call.

Height reports are not measurements the host takes from the sandbox DOM.
A report that is not a finite number is discarded. Any other finite number
is ceiled, then clamped to 50–4000.

A sandbox message is trusted when `event.source` is that iframe's
`contentWindow`. `event.origin` is not the check (`allow-scripts` without
`allow-same-origin` makes the origin `"null"`). A nonce may be required in
addition to the window check. A nonce does not replace it.

## Implementation

`@lightui/genui` exports the types and the checks. Studies import that
package entry only. The playgrounds stay in `studies/render-route` and
`studies/sandbox-bridge`.
