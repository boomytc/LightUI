import { useEffect, useState } from "react";

export function navigate(path: string) {
  const url = new URL(path, window.location.origin);
  const next = `${url.pathname}${url.search}${url.hash}`;
  const here = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (here === next) return;
  window.history.pushState({}, "", next);
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
  const [hash, setHash] = useState(() => window.location.hash.replace(/^#/, ""));

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
