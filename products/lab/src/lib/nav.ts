import { useEffect, useState } from "react";

export function navigate(path: string) {
  if (window.location.pathname === path) return;
  window.history.pushState({}, "", path);
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

export type Route =
  | { name: "home" }
  | { name: "studies" }
  | { name: "study"; slug: string }
  | { name: "notes" }
  | { name: "note"; slug: string }
  | { name: "about" }
  | { name: "missing"; path: string };

export function parseRoute(path: string): Route {
  const clean = path.replace(/\/+$/, "") || "/";
  if (clean === "/") return { name: "home" };
  if (clean === "/studies") return { name: "studies" };
  if (clean === "/notes") return { name: "notes" };
  if (clean === "/about") return { name: "about" };

  const study = /^\/s\/([^/]+)$/.exec(clean);
  if (study?.[1]) return { name: "study", slug: study[1] };

  const note = /^\/notes\/([^/]+)$/.exec(clean);
  if (note?.[1]) return { name: "note", slug: note[1] };

  return { name: "missing", path };
}
