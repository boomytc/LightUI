import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useLocale } from "./site-locale";

export type LocatorSignal = {
  metric: string;
  value: string;
  hint?: string;
  ratio?: number;
};

type LocatorSignalContextValue = {
  signal: LocatorSignal | null;
  report: (signal: LocatorSignal) => void;
};

const LocatorSignalContext = createContext<LocatorSignalContextValue>({
  signal: null,
  report: () => {},
});

function sameSignal(a: LocatorSignal | null, b: LocatorSignal) {
  return Boolean(
    a &&
      a.metric === b.metric &&
      a.value === b.value &&
      a.hint === b.hint &&
      a.ratio === b.ratio,
  );
}

export function LocatorSignalProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: LocatorSignal | null;
}) {
  const [signal, setSignal] = useState<LocatorSignal | null>(initial ?? null);
  const report = useCallback((next: LocatorSignal) => {
    setSignal((prev) => (sameSignal(prev, next) ? prev : next));
  }, []);
  const value = useMemo(() => ({ signal, report }), [signal, report]);
  return (
    <LocatorSignalContext.Provider value={value}>{children}</LocatorSignalContext.Provider>
  );
}

export function useLocatorSignal() {
  return useContext(LocatorSignalContext);
}

export function useReportLocator() {
  return useContext(LocatorSignalContext).report;
}

export function useLocatorCopy() {
  const locale = useLocale();
  const t = useCallback((zh: string, en: string) => (locale === "en" ? en : zh), [locale]);
  return { locale, t };
}
