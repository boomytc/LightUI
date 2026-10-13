import { useState } from "react";
import { CompareBoard } from "./components/CompareBoard";
import { DegradeBoard } from "./components/DegradeBoard";
import { RecordingPanel } from "./components/RecordingPanel";
import { pick, useLocale, loc } from "./lib/site-locale";
import "./route/route.css";

const MODES = ["compare", "degrade"] as const;
type Mode = (typeof MODES)[number];

export function StudyView() {
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("compare");
  const copy = {
    kicker: loc("呈现路由", "Render route"),
    title: loc("同一轮回答，三种表面。不合法就不挂。", "One turn, three surfaces. An illegal one does not mount."),
    lede: loc(
      "模型声明纯文本、契约里的组件，或一份沙盒文档。宿主只校验这份声明：名字要在目录里，props 要对上 schema，JSON 没写完就先不提交。",
      "The model declares plain text, a contract component, or a sandbox document. The host only checks that declaration: the name has to be in the catalog, the props have to match the schema, and unclosed JSON commits nothing.",
    ),
    compare: loc("对照", "Compare"),
    degrade: loc("降级", "Degrade"),
  };

  return (
    <div className="page-width min-w-0 pt-6 pb-16">
      <header className="max-w-3xl">
        <p className="route-kicker">{pick(copy.kicker, locale)}</p>
        <h1 className="mt-2 text-[1.7rem] leading-tight font-semibold tracking-tight text-fg sm:text-[2rem]">
          {pick(copy.title, locale)}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">{pick(copy.lede, locale)}</p>
      </header>

      <div className="mt-5">
        <RecordingPanel locale={locale} />
      </div>

      <div className="mt-5 flex gap-2" role="tablist" aria-label={pick(copy.kicker, locale)}>
        {MODES.map((id) => {
          const selected = mode === id;
          const label = id === "compare" ? copy.compare : copy.degrade;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`route-chip${selected ? " is-on" : ""}`}
              onClick={() => setMode(id)}
            >
              {pick(label, locale)}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {mode === "compare" ? <CompareBoard locale={locale} /> : <DegradeBoard locale={locale} />}
      </div>
    </div>
  );
}
