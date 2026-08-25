export type OverlayKind = "modal" | "drawer" | "popover" | "tooltip" | "sheet";

export type Interrupt = "block" | "weak" | "none";

export type Presence = { mounted: boolean; closing: boolean };

export type Appear = "center" | "side" | "bottom" | "anchor";

export const POPOVER_MAX = 7;

export const TOOLTIP_DELAY_MS = 280;

export const KIND_IDS: readonly OverlayKind[] = ["modal", "drawer", "popover", "tooltip", "sheet"];

export function interruptKind(kind: OverlayKind): Interrupt {
  switch (kind) {
    case "modal":
      return "block";
    case "drawer":
    case "sheet":
      return "weak";
    case "popover":
    case "tooltip":
      return "none";
  }
}

export function hasBackdrop(kind: OverlayKind): boolean {
  return kind === "modal" || kind === "drawer" || kind === "sheet";
}

/** Popover and tooltip have no scrim, so dismiss-on-backdrop is not applicable. */
export function backdropDismiss(kind: OverlayKind, dangerous = false): boolean {
  if (kind === "modal") return !dangerous;
  if (kind === "drawer" || kind === "sheet") return true;
  return false;
}

export function anchorsToTrigger(kind: OverlayKind): boolean {
  return kind === "popover" || kind === "tooltip";
}

/** Tooltip is a sentence. It must not take pointer or focus. */
export function isInteractive(kind: OverlayKind): boolean {
  return kind !== "tooltip";
}

export function appearsFrom(kind: OverlayKind): Appear {
  if (kind === "modal") return "center";
  if (kind === "drawer") return "side";
  if (kind === "sheet") return "bottom";
  return "anchor";
}

export function restoreFocus(): { open: false; restoreFocus: true } {
  return { open: false, restoreFocus: true };
}

export function tooManyForPopover(n: number): boolean {
  return n > POPOVER_MAX;
}

/**
 * Exit animation without React. `now` is ms since the last open→false edge.
 * While `now < duration` the layer stays mounted and `closing` is true.
 */
export function presence(
  open: boolean,
  mounted: boolean,
  now: number,
  duration: number,
): Presence {
  if (open) return { mounted: true, closing: false };
  if (!mounted) return { mounted: false, closing: false };
  if (now >= duration) return { mounted: false, closing: false };
  return { mounted: true, closing: true };
}
