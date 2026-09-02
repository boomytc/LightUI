import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  nextPattern,
  prevPattern,
  type GroupMode,
  type PatternMeta,
  type PatternId,
} from "../lib/machines.js";
import { BrowserFrame } from "./BrowserFrame.js";
import { CopyBlock } from "./CopyBlock.js";
import { ModeToggle } from "./ModeToggle.js";
import { DefaultCardsDemo } from "./demos/DefaultCardsDemo.js";
import { WhitespaceDemo } from "./demos/WhitespaceDemo.js";
import { FormSectionsDemo } from "./demos/FormSectionsDemo.js";
import { ActivityListDemo } from "./demos/ActivityListDemo.js";
import { ColorBandsDemo } from "./demos/ColorBandsDemo.js";
import { PriceCompareDemo } from "./demos/PriceCompareDemo.js";

function Demo({ id, mode }: { id: PatternMeta["id"]; mode: GroupMode }) {
  switch (id) {
    case "cards":
      return <DefaultCardsDemo mode={mode} />;
    case "whitespace":
      return <WhitespaceDemo mode={mode} />;
    case "form":
      return <FormSectionsDemo mode={mode} />;
    case "list":
      return <ActivityListDemo mode={mode} />;
    case "bands":
      return <ColorBandsDemo mode={mode} />;
    case "compare":
      return <PriceCompareDemo mode={mode} />;
  }
}

export function PatternStage({
  pattern,
  mode,
  onMode,
  onOpen,
}: {
  pattern: PatternMeta;
  mode: GroupMode;
  onMode: (mode: GroupMode) => void;
  onOpen: (id: PatternId) => void;
}) {
  const prev = prevPattern(pattern.id);
  const next = nextPattern(pattern.id);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-16">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest text-accent uppercase">
            减少卡片指南
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-mono text-3xl font-extrabold text-accent sm:text-4xl">
              {pattern.num}
            </span>
            <h1 className="text-3xl font-extrabold leading-none text-fg sm:text-4xl">
              {pattern.name}
            </h1>
          </div>
          <p className="mt-2 text-sm font-medium tracking-wide text-fg-muted">
            {pattern.en} · {pattern.relation}
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted">
            <span className="font-semibold text-fg">作用 · </span>
            {pattern.purpose}
            <span className="mx-2 text-border-strong">/</span>
            <span className="font-semibold text-fg">适合 · </span>
            {pattern.scenes.join("、")}
          </p>
        </div>
        <ModeToggle mode={mode} onChange={onMode} />
      </header>

      <BrowserFrame url={`lightui.study / group-taxonomy / ${pattern.id}`}>
        <Demo id={pattern.id} mode={mode} />
      </BrowserFrame>

      <p className="text-sm leading-relaxed text-fg-muted bg-surface-2 p-4 rounded-xl border border-border">
        <strong className="text-fg font-semibold">设计判定法则：</strong>
        {pattern.rule}
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <CopyBlock label="推荐 CSS 结构" text={pattern.css} />
        <CopyBlock label="给 AI 的局部 Prompt 约束" text={pattern.prompt} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => onOpen(prev)}
          className="pressable inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-fg hover:bg-surface-2"
        >
          <ArrowLeft className="size-3.5" />
          上一技法
        </button>
        <p className="text-xs text-fg-subtle">关系才是分组的答案</p>
        <button
          type="button"
          onClick={() => onOpen(next)}
          className="pressable inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-fg hover:bg-surface-2"
        >
          下一技法
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
