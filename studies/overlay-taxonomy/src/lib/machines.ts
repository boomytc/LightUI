export type OverlayKind = "modal" | "drawer" | "popover";

export type Interrupt = "block" | "weak" | "none";

export type Presence = { mounted: boolean; closing: boolean };

export const POPOVER_MAX = 7;

export function interruptKind(kind: OverlayKind): Interrupt {
  switch (kind) {
    case "modal":
      return "block";
    case "drawer":
      return "weak";
    case "popover":
      return "none";
  }
}

export function hasBackdrop(kind: OverlayKind): boolean {
  return kind === "modal" || kind === "drawer";
}

/** Popover has no scrim, so dismiss-on-backdrop is not applicable. */
export function backdropDismiss(kind: OverlayKind, dangerous = false): boolean {
  if (kind === "modal") return !dangerous;
  if (kind === "drawer") return true;
  return false;
}

export function anchorsToTrigger(kind: OverlayKind): boolean {
  return kind === "popover";
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
