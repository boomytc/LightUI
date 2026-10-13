import { useState } from "react";
import { catalogFromRegistry } from "../lib/catalog";
import { hostExplanation } from "../lib/explain";
import { componentNames, paintSurface, routeBuffer } from "../lib/machines";
import { DEGRADE_CASES, PARTIAL_STEPS, degradeById, type DegradeId } from "../lib/samples";
import { pick, type Locale } from "../lib/site-locale";
import { SurfacePane } from "./SurfacePane";

export function DegradeBoard({ locale, lock }: { locale: Locale; lock?: string }) {
  const catalog = catalogFromRegistry();
  const locked = lock !== undefined;
  const initial = isDegradeId(lock) ? lock : "unknown";
  const [caseId, setCaseId] = useState<DegradeId>(initial);
  const [step, setStep] = useState(1);
  const item = locked ? degradeById(lock) : (DEGRADE_CASES.find((entry) => entry.id === caseId) ?? DEGRADE_CASES[0]);
  const partial = item.id === "partial";
  const activeStep = partial ? (locked ? 1 : step) : 0;
  const buffer = partial ? (PARTIAL_STEPS[activeStep] ?? item.buffer) : item.buffer;
  const result = routeBuffer(buffer, catalog);
  const paint = paintSurface(result);
  const names = componentNames(catalog);

  function selectCase(id: DegradeId) {
    setCaseId(id);
    setStep(1);
  }

  return (
    <div
      data-route-board="error"
      data-error={item.id}
      data-status={result.status}
      data-error-code={result.errorCode ?? ""}
      data-degradation={result.degradation ?? ""}
      className="grid gap-4"
    >
      {locked ? null : (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={locale === "en" ? "Errors" : "错误"}>
          {DEGRADE_CASES.map((entry) => {
            const selected = entry.id === item.id;
            return (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`route-chip${selected ? " is-on" : ""}`}
                onClick={() => selectCase(entry.id)}
              >
                {pick(entry.title, locale)}
              </button>
            );
          })}
        </div>
      )}

      <p className="text-[13px] leading-relaxed text-fg-muted">{pick(item.detail, locale)}</p>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="route-pane">
          <header className="flex items-center justify-between gap-2">
            <h3 className="text-[14px] font-semibold text-fg">{locale === "en" ? "Arrived" : "到达的包"}</h3>
            {partial ? (
              <span className="font-mono text-[11px] text-fg-subtle">
                {activeStep + 1}/{PARTIAL_STEPS.length}
              </span>
            ) : null}
          </header>
          <pre className="route-code" data-buffer={partial ? "partial" : "complete"}>
            {buffer}
          </pre>
          {partial && !locked ? (
            <div className="flex gap-2">
              <button
                type="button"
                className="route-chip"
                disabled={activeStep === 0}
                onClick={() => setStep((value) => Math.max(0, value - 1))}
              >
                {locale === "en" ? "Previous slice" : "上一段"}
              </button>
              <button
                type="button"
                className="route-chip"
                disabled={activeStep >= PARTIAL_STEPS.length - 1}
                onClick={() => setStep((value) => Math.min(PARTIAL_STEPS.length - 1, value + 1))}
              >
                {locale === "en" ? "Next slice" : "下一段"}
              </button>
            </div>
          ) : null}
        </section>

        <div data-paint={paint} data-step={partial ? activeStep : undefined}>
          <SurfacePane
            result={result}
            locale={locale}
            title={locale === "en" ? "Host commit" : "宿主提交"}
            chosen={result.status === "committed"}
            notice={result.status === "error" ? hostExplanation(result, names, locale) : undefined}
            badge={
              result.status === "pending"
                ? locale === "en"
                  ? "Held"
                  : "先不挂"
                : result.status === "error"
                  ? locale === "en"
                    ? "Error"
                    : "错误"
                  : result.status === "degraded"
                    ? locale === "en"
                      ? "Degraded"
                      : "已降级"
                    : locale === "en"
                      ? "Committed"
                      : "本轮提交"
            }
          />
          {result.status === "error" ? null : (
            <p className="mt-3 text-[13px] leading-relaxed text-fg">
              {hostExplanation(result, names, locale)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function isDegradeId(value: string | undefined): value is DegradeId {
  return value === "unknown" || value === "props" || value === "partial";
}
