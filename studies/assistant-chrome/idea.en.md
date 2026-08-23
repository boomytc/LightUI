# Assistant

The assistant is not a default full-page chat. First decide **where it lives**: chat, a side panel, a plugin, a float, a canvas, or nowhere visible.

## The problem

“Ship an AI product” describes the look: add a dialog. What actually breaks is an **assistant that occupies the wrong place for the task**:

- The page already has an editor, then the whole page becomes chat, so the work surface is gone
- The selection *is* the context, but the rail opens a full chat stream
- An old product only needed a capability, but the layout and a sidebar changed
- A document you are reading is pushed into another full-screen app
- Ideas need to spread out, but they are stuffed into a timeline of bubbles
- Classify / archive work that needs no discussion grows a resident chrome

One chat window for all of these either rips out the host, turns a toolbar into a dialog, or makes invisible work look like a resident assistant.

## The rule

Ask where the assistant lives first. Skin comes after. This is not how the page is laid out, and not whether a dialog interrupts.

| Leaf | Lives in | Machine |
| --- | --- | --- |
| Chat | A full-page message list | `occupiesPage`; Enter must not send while IME is composing |
| Side panel | Work on the left, a suggestion card on the right | `needsSelection`; the selection is the context; apply / undo |
| Plugin | The host does not move; a toolbar appears on select | `needsSelection`; save the Range |
| Float | A draggable mini window; the skeleton does not change | Keep reading; the ball drags |
| Canvas | Nodes on an infinite canvas | `occupiesPage`; output is nodes, not a chat window |
| Invisible | A shortcut; no resident chrome | `chromeVisible` is false |

The three pairs people mix up:

- **Where the assistant lives is not the page skeleton.** The skeleton is how this page is laid out. Whether the assistant lives in chat, a rail, a plugin, a float, a canvas, or nowhere visible is a different question.
- **A selection toolbar is not a dialog.** A plugin appears on the selection; the host page does not change. A dialog is about interrupt and whether it sticks to a trigger.
- **A suggestion card is not a chat stream.** The panel is one note plus apply / undo. A full-page message list is chat.

To specify one of these, say three things:

1. **Name** — not “make a chat”
2. **Scene** — ideas still loose, change the selection, add capability to an old product, ask one question across a page, spread ideas, or write back in the background
3. **Rules** — occupies the page or not, needs a selection or not, chrome visible or not, Enter while composing or not

Those three, in one sentence, are the “Say it this way” card.

## Versus always a chat window

| | Always chat | Split by where it lives |
| --- | --- | --- |
| Not sure yet | Fine | A full-page list; Enter while composing commits the IME, it does not send |
| Code, a document | The selection is gone; advice becomes chat | Work on the left, one suggestion card on the right; apply / undo |
| An old product | New layout, a new rail | A toolbar on select; save the Range |
| A document you are reading | Jump into another app | A draggable mini window; the skeleton stays |
| Brainstorm | Timeline bubbles | Nodes and edges on a canvas |
| Sort an album | Extra chrome | A shortcut; results write back in place |

## The machines

The calls live in DOM-free modules: `occupiesPage(kind)` (true for chat and canvas), `needsSelection(kind)` (true for plugin and panel), `chromeVisible(kind)` (false for invisible), `shouldSendOnEnter(composing)` (false while composing; `keyCode` 229 does not send either).
