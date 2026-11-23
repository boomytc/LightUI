import { useEffect, useRef } from "react";
import { Link } from "./components/Link";
import { Page } from "./components/Page";
import { Shell } from "./components/Shell";
import { loadStudy } from "./lib/catalog";
import { messages } from "./lib/i18n";
import { studyTitle } from "./lib/localize";
import { consumeNavigationKind, getSavedScroll, parseRoute, usePath, type Route } from "./lib/nav";
import { loadNote } from "./lib/notes";
import { usePrefs, type Locale } from "./lib/prefs";
import { Graph } from "./pages/Graph";
import { Home } from "./pages/Home";
import { NotePage } from "./pages/NotePage";
import { Notes } from "./pages/Notes";
import { StagePage } from "./pages/StagePage";
import { Studies } from "./pages/Studies";
import { StudyPage } from "./pages/StudyPage";

function pageTitle(route: Route, locale: Locale): string {
  const copy = messages(locale);
  switch (route.name) {
    case "home":
      return "LightUI";
    case "studies":
      return `${copy.studiesTitle} · LightUI`;
    case "graph":
      return `${copy.graphPageTitle} · LightUI`;
    case "notes":
      return `${copy.notesTitle} · LightUI`;
    case "study": {
      const study = loadStudy(route.slug);
      return study ? `${studyTitle(study.meta, locale)} · LightUI` : `LightUI`;
    }
    case "stage": {
      const study = loadStudy(route.slug);
      return study
        ? `${studyTitle(study.meta, locale)} (${copy.tabStage}) · LightUI`
        : `LightUI`;
    }
    case "note": {
      const note = loadNote(route.slug, locale);
      return note ? `${note.title} · LightUI` : `LightUI`;
    }
    case "missing":
      return `404 · LightUI`;
  }
}

export function App() {
  const path = usePath();
  const { locale } = usePrefs();
  const route = parseRoute(path);
  const initialMount = useRef(true);

  useEffect(() => {
    document.title = pageTitle(parseRoute(path), locale);
  }, [path, locale]);

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    const navKind = consumeNavigationKind();
    if (navKind === "pop") {
      const saved = getSavedScroll();
      if (typeof saved === "number") {
        requestAnimationFrame(() => {
          window.scrollTo({ top: saved, left: 0, behavior: "instant" });
        });
      }
      return;
    }
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [path]);

  if (route.name === "stage") {
    return <StagePage slug={route.slug} />;
  }

  return (
    <Shell study={route.name === "study"}>
      <div key={path} className="lab-page">
        {route.name === "home" ? <Home /> : null}
        {route.name === "studies" ? <Studies /> : null}
        {route.name === "graph" ? <Graph /> : null}
        {route.name === "study" ? <StudyPage slug={route.slug} /> : null}
        {route.name === "notes" ? <Notes /> : null}
        {route.name === "note" ? <NotePage slug={route.slug} /> : null}
        {route.name === "missing" ? <NotFound path={route.path} /> : null}
      </div>
    </Shell>
  );
}

function NotFound({ path }: { path: string }) {
  const { locale } = usePrefs();
  const copy = messages(locale);
  return (
    <Page as="main" className="py-16">
      <div className="max-w-lg space-y-5">
        <p className="font-mono text-[12px] font-medium text-fg-subtle">404</p>
        <p className="text-[15px] text-fg-muted">{copy.missingPage(path)}</p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href="/"
            className="inline-flex h-9 items-center rounded-lg bg-fg px-4 text-[13px] font-medium text-surface no-underline shadow-xs transition-opacity hover:opacity-90"
          >
            {copy.commandActionHome}
          </Link>
          <Link
            href="/studies"
            className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-4 text-[13px] font-medium text-fg no-underline shadow-xs transition-colors hover:bg-surface-2"
          >
            {copy.homeSeeWorks}
          </Link>
        </div>
      </div>
    </Page>
  );
}
