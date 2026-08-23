import { useEffect, useState } from "react";

export function usePresence(open: boolean, duration = 150) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const t = window.setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, duration);
    return () => window.clearTimeout(t);
  }, [open, mounted, duration]);

  return { mounted, closing };
}
