import { useState } from "react";
import { catalogFromRegistry } from "../lib/catalog";
import { hostExplanation, surfaceLabel } from "../lib/explain";
import { componentNames, paintSurface, routeTurn, type Surface } from "../lib/machines";
import { COMPARE_SAMPLES, draftsFor, sampleByChosen } from "../lib/samples";
import { pick, type Locale } from "../lib/site-locale";
import { SurfacePane } from "./SurfacePane";

const ORDER: Surface[] = ["text", "native", "iframe"];

export function CompareBoard({ locale, lock }: { locale: Locale; lock?: string }) {
  const catalog = catalogFromRegistry();
  const locked = lock !== undefined;
  const [sampleId, setSampleId] = useState(sampleByChosen(lock ?? "text").id);
  const sample = locked
    ? sampleByChosen(lock)
    : (COMPARE_SAMPLES.find((item) => item.id === sampleId) ?? COMPARE_SAMPLES[0]);
  const drafts = draftsFor(sample, locale);
  const columns = {
    text: routeTurn(drafts.text, catalog),
    native: routeTurn(drafts.native, catalog),
    iframe: routeTurn(drafts.iframe, catalog),
  };
  const decision = columns[sample.chosen];
  const paint = paintSurface(decision);

  return (
    <div data-route-board="compare" data-sample={sample.id} className="grid gap-4">
      {locked ? null : (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={locale === "en" ? "Requests" : "请求"}>
          {COMPARE_SAMPLES.map((item) => {
            const selected = item.id === sample.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`route-chip${selected ? " is-on" : ""}`}
                onClick={() => setSampleId(item.id)}
              >
                {pick(item.title, locale)}
              </button>
            );
          })}
        </div>
      )}

      <blockquote className="rounded-xl border border-border bg-surface-2 px-4 py-3 text-[14px] leading-relaxed text-fg">
        <p className="route-kicker mb-1">{locale === "en" ? "Request" : "请求"}</p>
        {pick(sample.request, locale)}
      </blockquote>

      <div
        data-status={decision.status}
        data-chosen-surface={paint}
        className="rounded-xl border border-border bg-surface px-4 py-3 shadow-card"
      >
        <p className="route-kicker">
          {locale === "en" ? "This turn" : "这一轮"} · {catalog.protocol} {catalog.version}
        </p>
        <p className="mt-1 text-[15px] font-semibold text-fg">{surfaceLabel(paint, locale)}</p>
        <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">{pick(sample.reason, locale)}</p>
        <p className="mt-2 text-[13px] leading-relaxed text-fg">{hostExplanation(decision, componentNames(catalog), locale)}</p>
        <p className="mt-2 font-mono text-[11px] text-fg-subtle">
          {componentNames(catalog)
            .map((name) => {
              const schema = catalog.components.find((component) => component.name === name);
              const fields = Object.entries(schema?.props.properties ?? {})
                .map(([key, field]) => `${key}: ${field.type}`)
                .join(", ");
              return `${name} { ${fields} }`;
            })
            .join(" · ")}
        </p>
      </div>

      <div className="route-grid">
        {ORDER.map((surface) => (
          <SurfacePane
            key={surface}
            result={columns[surface]}
            locale={locale}
            title={surfaceLabel(surface, locale)}
            chosen={surface === sample.chosen}
            badge={
              surface === sample.chosen
                ? locale === "en"
                  ? "Committed"
                  : "本轮提交"
                : locale === "en"
                  ? "Same request"
                  : "同一请求"
            }
          />
        ))}
      </div>
    </div>
  );
}
