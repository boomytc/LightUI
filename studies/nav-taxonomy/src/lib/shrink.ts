export const SHRINK_ENTER = 40;
export const SHRINK_EXIT = 16;

export function nextShrunk(
  prev: boolean,
  scrollTop: number,
  enter = SHRINK_ENTER,
  exit = SHRINK_EXIT,
): boolean {
  return prev ? scrollTop > exit : scrollTop > enter;
}
