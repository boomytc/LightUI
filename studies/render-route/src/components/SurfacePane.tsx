import { committedNative, paintSurface, type RouteResult } from "../lib/machines";
import { surfaceLabel } from "../lib/explain";
import type { Locale } from "../lib/site-locale";
import { mountNative } from "./native-mount";

export function SurfacePane({
  result,
  locale,
  title,
  badge,
  chosen = false,
}: {
  result: RouteResult;
  locale: Locale;
  title: string;
  badge?: string;
  chosen?: boolean;
}) {
  const paint = paintSurface(result);
  const native = committedNative(result);
  const mounted = native ? mountNative(native.name, native.props) : null;

  return (
    <article
      data-pane={title}
      data-paint={paint}
      data-chosen={chosen ? "true" : "false"}
      className={`route-pane${chosen ? " is-chosen" : ""}`}
    >
      <header className="flex items-start justify-between gap-2">
        <h3 className="text-[14px] font-semibold text-fg">{title}</h3>
        {badge ? (
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
            {badge}
          </span>
        ) : null}
      </header>
      <div className="min-w-0 flex-1">
        {paint === "none" ? (
          <p className="text-[13px] leading-relaxed text-fg-muted">{surfaceLabel("none", locale)}</p>
        ) : null}
        {paint === "text" ? <p className="text-[15px] leading-relaxed text-fg">{result.text}</p> : null}
        {paint === "native" && native ? (
          <div className="grid gap-3">
            <pre className="route-code">{JSON.stringify({ component: native.name, props: native.props }, null, 2)}</pre>
            <div data-native-mount={native.name} className="rounded-md bg-surface-2 px-3 py-3">
              {mounted}
            </div>
          </div>
        ) : null}
        {paint === "iframe" && result.document ? (
          <div className="route-window">
            <p className="route-window-bar">
              {locale === "en" ? "sandbox · allow-scripts · no host origin" : "sandbox · allow-scripts · 无宿主同源"}
            </p>
            <iframe
              className="route-frame"
              title={title}
              sandbox="allow-scripts"
              referrerPolicy="no-referrer"
              srcDoc={result.document}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}
