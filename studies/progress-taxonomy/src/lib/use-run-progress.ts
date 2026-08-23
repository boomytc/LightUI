import { useEffect, useState } from "react";

/** One-shot 0→1. Stops at 1. Never loops a fake percent. */
export function useRunProgress({
  playing,
  reduced = false,
  duration = 2000,
  restartKey = 0,
}: {
  playing: boolean;
  reduced?: boolean;
  duration?: number;
  restartKey?: number;
}) {
  const [value, setValue] = useState(0);
  const [done, setDone] = useState(false);
  const [seenKey, setSeenKey] = useState(restartKey);

  if (seenKey !== restartKey) {
    setSeenKey(restartKey);
    setValue(0);
    setDone(false);
  }

  useEffect(() => {
    if (!playing) return;
    if (reduced) {
      setValue(1);
      setDone(true);
      return;
    }
    let frame = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      setValue(eased);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setValue(1);
        setDone(true);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, reduced, duration, restartKey]);

  return { value, done };
}
