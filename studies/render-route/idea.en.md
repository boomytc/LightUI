# Render route

If every answer lands in one text box, a reader cannot tell a sentence from a catalog component or from a document that has to stay isolated from the host. A name that is not in the catalog, props that fail the schema, and JSON that has not closed yet get mounted anyway.

## Rule

Each turn arrives as one route object. The host commits one of three surfaces:

1. **Plain text.** Explanation, facts, writing. It is not promoted into a component.
2. **Native component.** The name must exist in the current `lightui.genui` contract, and the props must satisfy that component's schema. v0 has only `Text`: `content` is a string, and extra fields are rejected.
3. **iframe sandbox.** Layout or interaction the contract cannot express goes into a document without the host's origin. This study only presents that document.

The basis is the model's declared `surface`, plus the host check. When all three surfaces are legal, the host keeps the declaration and leaves the reason on screen. It does not pick a prettier one.

Degradation happens before mount:

- A component name missing from the contract is not mounted. The host commits the text fallback.
- Props that fail the schema are not mounted. The host commits the text fallback and lists the schema errors.
- A streaming fragment commits nothing until the JSON closes. Seeing `native` or `Text` inside that fragment does not mount a component early.

## Why the naive alternatives are worse

All-text makes an editable estimate look like a sentence, so there is nothing to operate. Rendering every name lets an unknown component or bad props crash or go blank. Mounting during the stream treats a half packet as a surface, then tears it down. Overriding a legal choice splits the reason from the picture, and the turn no longer shows why that surface was the one.
