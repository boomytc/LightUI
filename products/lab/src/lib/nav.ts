import { useEffect, useState } from "react";

export type LabHistoryState = { lab: true; from: string };

function currentHref(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function resolveHref(path: string): string {
  const url = new URL(path, window.location.origin);
  return `${url.pathname}${url.search}${url.hash}`;
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
  const next = resolveHref(path);
  const here = currentHref();
  if (here === next) return;
  window.history.pushState({ lab: true, from: here } satisfies LabHistoryState, "", next);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function back(fallback: string) {
  const from = readFrom(window.history.state);
  if (canPopHistory(from, fallback, currentHref())) {
    window.history.back();
    return;
  }
  const next = resolveHref(fallback);
  if (currentHref() === next) return;
  window.history.replaceState({ lab: true, from: "" } satisfies LabHistoryState, "", next);
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

export function useHash(): string {
  const [hash, setHash] = useState(() => (typeof window === "undefined" ? "" : window.location.hash.replace(/^#/, "")));

  useEffect(() => {
    const sync = () => setHash(window.location.hash.replace(/^#/, ""));
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  return hash;
}

export function useSearchParams(): URLSearchParams {
  const [params, setParams] = useState(() => (typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search)));

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

  if (options?.replace) {
    window.history.replaceState(window.history.state, "", next);
  } else {
    window.history.pushState({ lab: true, from: here } satisfies LabHistoryState, "", next);
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
  if (stage?.[1]) return { name: "stage", slug: stage[1] };

  const study = /^\/s\/([^/]+)$/.exec(clean);
  if (study?.[1]) return { name: "study", slug: study[1] };

  const note = /^\/notes\/([^/]+)$/.exec(clean);
  if (note?.[1]) return { name: "note", slug: note[1] };

  return { name: "missing", path };
}
