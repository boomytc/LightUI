# Sandbox bridge

A generated UI that can write the host page directly will also flash unstyled markup, open arbitrary URLs, and stretch the layout with a single number. An iframe keeps the generated document out of the host. The bridge is the only remaining path, so the host has to be the one that orders fields, clamps height, and refuses calls.

## What breaks

1. **Markup arrives before styles.** The user sees an unstyled fragment, then a jump when CSS lands.
2. **The sandbox picks the height.** `Infinity` or tens of thousands of pixels push the rest of the page away.
3. **A callback wrapper is not a whitelist.** Any script in the frame can `postMessage`. Hiding functions inside the frame does not stop that.

## Rule

The stream grows in this order: `initialHeight`, `placeholderMessages`, `css`, `html`, `jsFunctions`, `jsExpressions`. `html` and `jsExpressions` are arrays of strings. Each field gets a `*Complete` flag when its JSON value ends. `generating` stays true until the source text ends.

What the user sees follows the flags, not whatever later keys already sit in the buffer:

| Phase | Condition | What shows |
| --- | --- | --- |
| Placeholder | `css` is not complete | Placeholder lines, at `initialHeight` (or 200 if it has not arrived) |
| Preview | `css` is complete, `html` is not | Joined HTML so far, no scripts |
| Live | `html` is complete | The document stays. Inject `jsFunctions` once it is complete. Run only closed expressions |

The host does not measure the sandbox DOM. The frame reports its content box through `ResizeObserver`. The host accepts the report only when `event.source` is that iframe's `contentWindow`, the value is finite, and it clamps to 50–4000. The iframe `sandbox` is `allow-scripts` without `allow-same-origin`, so `event.origin` is `"null"` and is not proof of trust.

Only two calls come back:

- `sendPrompt({ text })` — string, trimmed length 1–4000, no extra keys.
- `openLink({ url })` — parseable URL whose protocol is `https:`.

Anything else is refused and does not become a host side effect.

## Why the naive version is worse

Painting HTML as soon as it shows up in the buffer flashes unstyled UI. Trusting `scrollHeight` while the frame is `height: 100%` cannot shrink. Adding `allow-same-origin` to a srcdoc frame puts it on the host origin. A polite wrapper inside the sandbox is not the boundary — the host check is.
