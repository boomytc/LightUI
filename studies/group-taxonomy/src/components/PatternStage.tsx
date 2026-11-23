import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  nextPattern,
  prevPattern,
  type GroupMode,
  type PatternId,
  type PatternMeta,
} from "../lib/machines.js";
import { loc, pick, useLocale, type Localized } from "../lib/site-locale.js";
import { BrowserFrame } from "./BrowserFrame.js";
import { CopyBlock } from "./CopyBlock.js";
import { ModeToggle } from "./ModeToggle.js";
import { DefaultCardsDemo } from "./demos/DefaultCardsDemo.js";
import { WhitespaceDemo } from "./demos/WhitespaceDemo.js";
import { FormSectionsDemo } from "./demos/FormSectionsDemo.js";
import { ActivityListDemo } from "./demos/ActivityListDemo.js";
import { ColorBandsDemo } from "./demos/ColorBandsDemo.js";
import { PriceCompareDemo } from "./demos/PriceCompareDemo.js";

const MODE_CAPTIONS: Record<
  PatternMeta["id"],
  { cards: Localized; grouped: Localized }
> = {
  cards: {
    cards: loc(
      "三块内容各套一张卡，阅读被外框切开。",
      "Each of the three blocks sits in its own card, cutting the reading flow.",
    ),
    grouped: loc(
      "同一页上的连续叙述：标题定层，留白推进。",
      "One continuous page: headings establish hierarchy, whitespace sets the rhythm.",
    ),
  },
  whitespace: {
    cards: loc(
      "Why / How / Result 被切成三张便利贴。",
      "Why / How / Result are sliced into three separate sticky notes.",
    ),
    grouped: loc(
      "细线加间距，一条阅读轴顺完。",
      "Hairlines and spacing carry the reader down a single axis.",
    ),
  },
  form: {
    cards: loc(
      "六个字段六张卡，焦点散在格子里。",
      "Six fields in six cards scatter focus across isolated boxes.",
    ),
    grouped: loc(
      "按任务用标题分区，字段本身扁平。",
      "Task headings organize the flow while individual fields stay flat.",
    ),
  },
  list: {
    cards: loc(
      "每条动态一张卡，视线在网格间跳。",
      "One card per event forces the eye to zig-zag across a grid.",
    ),
    grouped: loc(
      "单列列表，时间与状态沿一条路径扫下。",
      "A single-column list aligns timestamps and status down one scan line.",
    ),
  },
  bands: {
    cards: loc(
      "九个入口九张卡，主题边界看不清。",
      "Nine cards for nine links hide where one topic ends and the next begins.",
    ),
    grouped: loc(
      "三条通栏色带划区，行内项目不再套框。",
      "Three full-width bands mark the themes; inner links need no boxes.",
    ),
  },
  compare: {
    cards: loc(
      "三张孤立定价卡，横向对不齐。",
      "Three isolated pricing cards fracture row-by-row comparison.",
    ),
    grouped: loc(
      "共享底板加竖线，参数在同一张表上比。",
      "One shared surface with vertical hairlines keeps specs aligned across tiers.",
    ),
  },
};

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
  const locale = useLocale();
  const prev = prevPattern(pattern.id);
  const next = nextPattern(pattern.id);
  const caption = pick(MODE_CAPTIONS[pattern.id][mode], locale);

  return (
    <div className="flex flex-col gap-8 pb-8">
      <header>
        <div>
          <p className="font-mono text-xs font-semibold tracking-wider text-accent">
            {pattern.num}
          </p>
          <h1 className="mt-1 text-[1.75rem] leading-tight font-semibold tracking-tight text-fg sm:text-[2rem]">
            {pick(pattern.name, locale)}
          </h1>
          <p className="mt-1 text-sm text-fg-subtle">{pattern.en}</p>
        </div>
        <div className="spec-strip mt-6">
          <div>
            <p className="text-[0.65rem] font-medium tracking-wider text-fg-subtle uppercase">
              {locale === "en" ? "Relation" : "关系"}
            </p>
            <p className="mt-1 text-sm font-medium text-fg">{pick(pattern.relation, locale)}</p>
          </div>
          <div>
            <p className="text-[0.65rem] font-medium tracking-wider text-fg-subtle uppercase">
              {locale === "en" ? "Divider" : "隔断"}
            </p>
            <p className="mt-1 text-sm font-medium text-fg">{pick(pattern.cut, locale)}</p>
          </div>
          <div>
            <p className="text-[0.65rem] font-medium tracking-wider text-fg-subtle uppercase">
              {locale === "en" ? "When" : "何时"}
            </p>
            <p className="mt-1 text-sm font-medium text-fg">{pick(pattern.when, locale)}</p>
          </div>
        </div>
      </header>

      <div>
        <BrowserFrame
          url={`lightui.study / group-taxonomy / ${pattern.id}`}
          toolbar={<ModeToggle mode={mode} onChange={onMode} />}
        >
          <div key={pattern.id} className="pattern-swap">
            <Demo id={pattern.id} mode={mode} />
          </div>
        </BrowserFrame>
        <p
          key={`${pattern.id}-${mode}`}
          className="pattern-swap mt-3 text-sm text-fg-muted"
        >
          {caption}
        </p>
      </div>

      <p className="border-l-2 border-accent pl-4 text-sm leading-relaxed text-fg-muted">
        <span className="font-medium text-fg">{locale === "en" ? "Rule · " : "判定 · "}</span>
        {pick(pattern.rule, locale)}
      </p>

      <div className="grid gap-8 border-t border-border pt-6 lg:grid-cols-2 lg:gap-10">
        <CopyBlock label={locale === "en" ? "Recommended CSS" : "推荐 CSS 结构"} text={pattern.css} />
        <CopyBlock
          label={locale === "en" ? "Local AI Prompt" : "给 AI 的局部 Prompt"}
          text={pick(pattern.prompt, locale)}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => onOpen(prev)}
          className="pressable inline-flex items-center gap-1.5 text-xs font-medium text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="size-3.5" />
          {locale === "en" ? "Previous pattern" : "上一技法"}
        </button>
        <p className="text-xs text-fg-subtle">
          {locale === "en" ? "Best for " : "适合 "}
          {pattern.scenes.map((s) => pick(s, locale)).join(locale === "en" ? ", " : "、")}
        </p>
        <button
          type="button"
          onClick={() => onOpen(next)}
          className="pressable inline-flex items-center gap-1.5 text-xs font-medium text-fg-muted hover:text-fg"
        >
          {locale === "en" ? "Next pattern" : "下一技法"}
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
