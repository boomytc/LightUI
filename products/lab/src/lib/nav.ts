import { useEffect, useState } from "react";

export type LabHistoryState = { lab: true; from: string };
export type NavigationKind = "push" | "replace" | "pop";

const scrollPositions = new Map<string, number>();
let pendingNavKind: NavigationKind | null = null;

function currentHref(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function safeDecodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export function saveCurrentScroll() {
  if (typeof window === "undefined") return;
  scrollPositions.set(currentHref(), window.scrollY);
}

export function getSavedScroll(href?: string): number | undefined {
  if (typeof window === "undefined") return undefined;
  return scrollPositions.get(href ?? currentHref());
}

export function consumeNavigationKind(): NavigationKind {
  const kind = pendingNavKind ?? "pop";
  pendingNavKind = null;
  return kind;
}

export function routePath(href: string): string {
  const path = (href.split("#")[0] ?? href).split("?")[0] ?? href;
  return path.replace(/\/+$/, "") || "/";
}

export function readFrom(state: unknown): string | null {
  if (!state || typeof state !== "object") return null;
  const rec = state as { lab?: unknown; from?: unknown };
  if (rec.lab !== true || typeof rec.from !== "string" || rec.from.length === 0) return null;
  return rec.from;
}

export function backHref(from: string | null, fallback: string): string {
  if (!from) return fallback;
  if (parseRoute(routePath(from)).name === "missing") return fallback;
  return from;
}

export function canPopHistory(from: string | null, fallback: string, current: string): boolean {
  const href = backHref(from, fallback);
  return Boolean(from && href === from && href !== current);
}

export function navigate(path: string) {
  const nextUrl = new URL(path, window.location.origin);
  const next = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
  const here = currentHref();
  if (here === next) return;
  if (nextUrl.pathname !== window.location.pathname) {
    saveCurrentScroll();
    pendingNavKind = "push";
  }
  try {
    window.history.pushState({ lab: true, from: here } satisfies LabHistoryState, "", next);
  } catch {
    /* ignore SecurityError */
  }
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function back(fallback: string) {
  const from = readFrom(window.history.state);
  if (canPopHistory(from, fallback, currentHref())) {
    pendingNavKind = null;
    window.history.back();
    return;
  }
  const nextUrl = new URL(fallback, window.location.origin);
  const next = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
  if (currentHref() === next) return;
  if (nextUrl.pathname !== window.location.pathname) {
    pendingNavKind = "replace";
  }
  try {
    window.history.replaceState({ lab: true, from: "" } satisfies LabHistoryState, "", next);
  } catch {
    /* ignore SecurityError */
  }
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function usePath(): string {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return path;
}

function safeDecodeHash(raw: string): string {
  const stripped = raw.replace(/^#/, "");
  if (!stripped) return "";
  try {
    return decodeURIComponent(stripped);
  } catch {
    return stripped;
  }
}

export function useHash(): string {
  const [hash, setHash] = useState(() =>
    typeof window === "undefined" ? "" : safeDecodeHash(window.location.hash),
  );

  useEffect(() => {
    const sync = () => setHash(safeDecodeHash(window.location.hash));
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  return hash;
}

export function replaceHash(hash: string | null | undefined) {
  if (typeof window === "undefined") return;
  const normalized = hash ? `#${encodeURIComponent(hash)}` : "";
  const next = `${window.location.pathname}${window.location.search}${normalized}`;
  if (currentHref() === next) return;
  try {
    window.history.replaceState(window.history.state, "", next);
  } catch {
    /* ignore SecurityError under rapid updates */
  }
  window.dispatchEvent(new Event("hashchange"));
}

export function useSearchParams(): URLSearchParams {
  const [params, setParams] = useState(() =>
    typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search),
  );

  useEffect(() => {
    const sync = () => setParams(new URLSearchParams(window.location.search));
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  return params;
}

export function updateSearchParams(
  updates: Record<string, string | null | undefined>,
  options?: { replace?: boolean },
) {
  if (typeof window === "undefined") return;
  const current = new URLSearchParams(window.location.search);
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === "") {
      current.delete(key);
    } else {
      current.set(key, value);
    }
  }
  const search = current.toString();
  const next = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;
  const here = currentHref();
  if (here === next) return;

  try {
    if (options?.replace) {
      window.history.replaceState(window.history.state, "", next);
    } else {
      window.history.pushState({ lab: true, from: here } satisfies LabHistoryState, "", next);
    }
  } catch {
    /* ignore SecurityError when browser throttles history updates */
  }
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export type Route =
  | { name: "home" }
  | { name: "studies" }
  | { name: "study"; slug: string }
  | { name: "stage"; slug: string }
  | { name: "notes" }
  | { name: "note"; slug: string }
  | { name: "graph" }
  | { name: "missing"; path: string };

export function parseRoute(path: string): Route {
  const clean = path.replace(/\/+$/, "") || "/";
  if (clean === "/") return { name: "home" };
  if (clean === "/studies") return { name: "studies" };
  if (clean === "/notes") return { name: "notes" };
  if (clean === "/graph") return { name: "graph" };

  const stage = /^\/s\/([^/]+)\/stage$/.exec(clean);
  if (stage?.[1]) return { name: "stage", slug: safeDecodeSegment(stage[1]) };

  const study = /^\/s\/([^/]+)$/.exec(clean);
  if (study?.[1]) return { name: "study", slug: safeDecodeSegment(study[1]) };

  const note = /^\/notes\/([^/]+)$/.exec(clean);
  if (note?.[1]) return { name: "note", slug: safeDecodeSegment(note[1]) };

  return { name: "missing", path: safeDecodeSegment(path) };
}
