export type KindId =
  | "chat"
  | "panel"
  | "plugin"
  | "float"
  | "canvas"
  | "invisible";

export type StageState = "default" | "open";

export const KIND_IDS: readonly KindId[] = [
  "chat",
  "panel",
  "plugin",
  "float",
  "canvas",
  "invisible",
];

/** IME Enter on many browsers. */
export const IME_KEYCODE = 229;

export function isKindId(value: string): value is KindId {
  return (KIND_IDS as readonly string[]).includes(value);
}

/** Chat and canvas take the page. The others sit on a host. */
export function occupiesPage(kind: KindId): boolean {
  return kind === "chat" || kind === "canvas";
}

/** Plugin and panel take the current selection as context. */
export function needsSelection(kind: KindId): boolean {
  return kind === "plugin" || kind === "panel";
}

/** Invisible has no resident chrome. */
export function chromeVisible(kind: KindId): boolean {
  return kind !== "invisible";
}

/**
 * Enter must not send while IME is composing.
 * `composing` is `isComposing`; keyCode 229 is the IME Enter.
 */
export function shouldSendOnEnter(composing: boolean, keyCode?: number): boolean {
  if (composing) return false;
  if (keyCode === IME_KEYCODE) return false;
  return true;
}

/** Plugin stills lock `open` so the selection toolbar is visible. */
export function stageState(raw: string, kind: KindId = "chat"): StageState {
  if (kind === "plugin" && raw === "open") return "open";
  return "default";
}
