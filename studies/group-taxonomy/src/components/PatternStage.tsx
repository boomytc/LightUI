import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  nextPattern,
  prevPattern,
  type GroupMode,
  type PatternId,
  type PatternMeta,
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

const MODE_CAPTIONS: Record<
  PatternMeta["id"],
  { cards: string; grouped: string }
> = {
  cards: {
    cards: "三块内容各套一张卡，阅读被外框切开。",
    grouped: "同一页上的连续叙述：标题定层，留白推进。",
  },
  whitespace: {
    cards: "Why / How / Result 被切成三张便利贴。",
    grouped: "细线加间距，一条阅读轴顺完。",
  },
  form: {
    cards: "六个字段六张卡，焦点散在格子里。",
    grouped: "按任务用标题分区，字段本身扁平。",
  },
  list: {
    cards: "每条动态一张卡，视线在网格间跳。",
    grouped: "单列列表，时间与状态沿一条路径扫下。",
  },
  bands: {
    cards: "九个入口九张卡，主题边界看不清。",
    grouped: "三条通栏色带划区，行内项目不再套框。",
  },
  compare: {
    cards: "三张孤立定价卡，横向对不齐。",
    grouped: "共享底板加竖线，参数在同一张表上比。",
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
  const prev = prevPattern(pattern.id);
  const next = nextPattern(pattern.id);
  const caption = MODE_CAPTIONS[pattern.id][mode];

  return (
    <div className="flex flex-col gap-8 pb-8">
      <header>
        <div>
          <p className="font-mono text-xs font-semibold tracking-wider text-accent">
            {pattern.num}
          </p>
          <h1 className="mt-1 text-[1.75rem] leading-tight font-semibold tracking-tight text-fg sm:text-[2rem]">
            {pattern.name}
          </h1>
          <p className="mt-1 text-sm text-fg-subtle">{pattern.en}</p>
        </div>
        <div className="spec-strip mt-6">
          <div>
            <p className="text-[0.65rem] font-medium tracking-wider text-fg-subtle uppercase">
              关系
            </p>
            <p className="mt-1 text-sm font-medium text-fg">{pattern.relation}</p>
          </div>
          <div>
            <p className="text-[0.65rem] font-medium tracking-wider text-fg-subtle uppercase">
              隔断
            </p>
            <p className="mt-1 text-sm font-medium text-fg">{pattern.cut}</p>
          </div>
          <div>
            <p className="text-[0.65rem] font-medium tracking-wider text-fg-subtle uppercase">
              何时
            </p>
            <p className="mt-1 text-sm font-medium text-fg">{pattern.when}</p>
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
        <span className="font-medium text-fg">判定 · </span>
        {pattern.rule}
      </p>

      <div className="grid gap-8 border-t border-border pt-6 lg:grid-cols-2 lg:gap-10">
        <CopyBlock label="推荐 CSS 结构" text={pattern.css} />
        <CopyBlock label="给 AI 的局部 Prompt" text={pattern.prompt} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => onOpen(prev)}
          className="pressable inline-flex items-center gap-1.5 text-xs font-medium text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="size-3.5" />
          上一技法
        </button>
        <p className="text-xs text-fg-subtle">适合 {pattern.scenes.join("、")}</p>
        <button
          type="button"
          onClick={() => onOpen(next)}
          className="pressable inline-flex items-center gap-1.5 text-xs font-medium text-fg-muted hover:text-fg"
        >
          下一技法
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
