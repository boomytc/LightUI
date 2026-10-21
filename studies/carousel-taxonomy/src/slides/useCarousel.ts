import { useCallback, useEffect, useState } from "react";
import { shouldAutoplay, stepIndex, wrapIndex } from "../lib/machines";

export function useCarousel({
  length,
  intervalMs,
  playing,
  hovering,
  reducedMotion,
  initial = 0,
}: {
  length: number;
  intervalMs: number;
  playing: boolean;
  hovering: boolean;
  reducedMotion: boolean;
  initial?: number;
}) {
  const [index, setIndex] = useState(() => wrapIndex(initial, length));

  useEffect(() => {
    setIndex(wrapIndex(initial, length));
  }, [initial, length]);

  const go = useCallback((n: number) => setIndex(wrapIndex(n, length)), [length]);

  const next = useCallback(() => {
    setIndex((i) => stepIndex(i, 1, length, "wrap"));
  }, [length]);

  const prev = useCallback(() => {
    setIndex((i) => stepIndex(i, -1, length, "wrap"));
  }, [length]);

  const auto = playing && shouldAutoplay(hovering, reducedMotion);

  useEffect(() => {
    if (!auto || length <= 1 || intervalMs <= 0) return;
    const id = window.setTimeout(() => {
      setIndex((i) => stepIndex(i, 1, length, "wrap"));
    }, intervalMs);
    return () => window.clearTimeout(id);
  }, [auto, intervalMs, length, index]);

  return { index, go, next, prev };
}
