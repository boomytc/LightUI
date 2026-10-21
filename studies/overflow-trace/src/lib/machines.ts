export const CAUSES = [
  "width",
  "negative",
  "text",
  "fixed",
  "absolute",
] as const;
export type Cause = (typeof CAUSES)[number];
export type Mode = "bug" | "hide" | "fix";
export type Bounds = { left: number; right: number };
export function escapes(
  container: Bounds,
  child: Bounds,
  tolerance = 1,
): boolean {
  return (
    child.left < container.left - tolerance ||
    child.right > container.right + tolerance
  );
}
