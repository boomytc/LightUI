import { useEffect, useState } from "react";

/** Desktop: hover opens. Touch: tap toggles. */
export function useFinePointer() {
  const [fine, setFine] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFine(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return fine;
}
