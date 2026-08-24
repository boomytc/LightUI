import { ArrowLeft } from "lucide-react";
import { loadStudy } from "../lib/catalog";
import { messages } from "../lib/i18n";
import { studyTitle } from "../lib/localize";
import { back, backHref, parseRoute, readFrom, routePath, usePath } from "../lib/nav";
import { usePrefs, type Locale } from "../lib/prefs";

export function BackLink({ fallback, className }: { fallback: string; className?: string }) {
  usePath();
  const { locale } = usePrefs();
  const copy = messages(locale);
  const href = backHref(readFrom(window.history.state), fallback);
  const label = labelFor(href, copy, locale);

  return (
    <a
      href={href}
      className={
        className ??
        "inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[13px] text-fg-muted no-underline hover:bg-surface-2 hover:text-fg"
      }
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        back(fallback);
      }}
    >
      <ArrowLeft className="size-3.5" />
      {label}
    </a>
  );
}

function labelFor(href: string, copy: ReturnType<typeof messages>, locale: Locale): string {
  const route = parseRoute(routePath(href));
  if (route.name === "home") return copy.backHome;
  if (route.name === "studies") return copy.backWorks;
  if (route.name === "graph") return copy.navGraph;
  if (route.name === "notes" || route.name === "note") return copy.notesIndex;
  if (route.name === "study") {
    const study = loadStudy(route.slug);
    return study ? studyTitle(study.meta, locale) : copy.backWorks;
  }
  return copy.backWorks;
}
