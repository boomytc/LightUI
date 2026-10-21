export type Box = { left: number; width: number };

export type StepKind = "done" | "current" | "todo";

export type FolderLayer = { z: number; raised: boolean };

/** Indicator is the text span, not the equal-width cell. */
export function textIndicator(
  listLeft: number,
  textLeft: number,
  textWidth: number,
  scrollLeft = 0,
): Box {
  return {
    left: textLeft - listLeft + scrollLeft,
    width: Math.max(0, textWidth),
  };
}

/**
 * First measure (or a zero-width box) must not animate from 0.
 * After that, only `left` / `width` may transition.
 */
export function indicatorTransition(prev: Box | null): "none" | "left, width" {
  if (!prev || prev.width <= 0) return "none";
  return "left, width";
}

export function stepKind(index: number, current: number): StepKind {
  if (index < current) return "done";
  if (index === current) return "current";
  return "todo";
}

/** Drop the panel’s top-left radius only when the first card tab is current. */
export function cardPanelRadius(
  selectedIndex: number,
  radiusPx: number,
): { topLeft: number; topRight: number } {
  return {
    topLeft: selectedIndex === 0 ? 0 : radiusPx,
    topRight: radiusPx,
  };
}

/**
 * Idle paper stays under the panel. The current tab sits above the panel
 * so it can share the list fill without being clipped.
 */
export function folderLayer(index: number, selected: number, count: number): FolderLayer {
  return {
    z: index === selected ? count + 2 : index + 1,
    raised: index === selected,
  };
}

export function folderPanelZ(count: number): number {
  return count + 1;
}

export function bevelInset(height: number, degrees: number): number {
  const rad = (degrees * Math.PI) / 180;
  return height * Math.tan(rad);
}

/** Arrow keys wrap among sibling tabs; unrelated keys do not change selection. */
export function nextTabIndex(key:string,index:number,count:number):number|null {
  if (count<=0) return null;
  if(key==="ArrowRight")return (index+1)%count;
  if(key==="ArrowLeft")return (index-1+count)%count;
  if(key==="Home")return 0;
  if(key==="End")return count-1;
  return null;
}
