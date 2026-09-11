import {
  TOUR_COUNT,
  allowsSkip,
  guideAdvance,
  guideBlocksOutside,
  guidePersists,
  type Hotspot,
  type KindId,
} from "../lib/machines";
import { loc, pick, type Locale, type Localized } from "../lib/site-locale";
import { cn } from "../lib/utils";
import type { TargetId } from "./Workbench";

const WHEN: Record<KindId, Localized> = {
  tour: loc("第一次进工作台", "First visit"),
  coach: loc("发布旁一句", "A line on Publish"),
  hotspot: loc("新功能上", "On a new feature"),
  spotlight: loc("必须动手时", "When they must act"),
  checklist: loc("入门四件事", "Four getting-started tasks"),
  hint: loc("字段还空着", "While a field is empty"),
};

const PIN_LABEL: Record<TargetId, Localized> = {
  metric: loc("指标卡", "Metric card"),
  title: loc("标题", "Title"),
  permission: loc("可见范围", "Visibility"),
  publish: loc("发布", "Publish"),
  feature: loc("模板", "Templates"),
};

const VERB: Record<ReturnType<typeof guideAdvance>, Localized> = {
  next: loc("下一步", "Next"),
  confirm: loc("明白了", "Got it"),
  "open-read": loc("点开读完", "Open · read"),
  "click-target": loc("点洞里", "Click the hole"),
  "task-complete": loc("勾任务", "Check tasks"),
  "state-clear": loc("填上即走", "Fill to leave"),
};

const LEFTOVER: Record<KindId, { title: Localized; detail: Localized }> = {
  tour: {
    title: loc("已卸掉", "Unloaded"),
    detail: loc("漫游走完，不再挡住外面。", "The tour is gone. Nothing blocks the page."),
  },
  coach: {
    title: loc("已卸掉", "Unloaded"),
    detail: loc("看过就走。页面一直可点。", "One look was enough. The page stayed clickable."),
  },
  hotspot: {
    title: loc("圆点已卸掉", "Dot unloaded"),
    detail: loc("读完即走，不是未读数字。", "Read, then gone — not an unread count."),
  },
  spotlight: {
    title: loc("已卸掉", "Unloaded"),
    detail: loc("点过洞里的控件，遮罩不再挡。", "They clicked the hole. The scrim is gone."),
  },
  checklist: {
    title: loc("仍留着", "Still here"),
    detail: loc("100% 标题换成入门完成，列表还在。", "At 100% the title is Ready; the list stays."),
  },
  hint: {
    title: loc("已卸掉", "Unloaded"),
    detail: loc("填上就走，不是校验红字。", "Filling unmounted it — not a validation error."),
  },
};

const HOTSPOT_STATE: Record<Hotspot, Localized> = {
  unread: loc("未读", "Unread"),
  open: loc("打开", "Open"),
  read: loc("已读", "Read"),
};

export function advanceVerb(kind: KindId, locale: Locale): string {
  return pick(VERB[guideAdvance(kind)], locale);
}

export function GuideHud({
  kind,
  locale,
  pin,
  teaching,
  finished,
  tour,
  hotspot,
  checks,
  total,
}: {
  kind: KindId;
  locale: Locale;
  pin: TargetId | null;
  teaching: boolean;
  finished: boolean;
  tour: { step: number; done: boolean };
  hotspot: Hotspot;
  checks: number;
  total: number;
}) {
  const blocking = guideBlocksOutside(kind);
  const persists = guidePersists(kind);
  const pinText = pin
    ? pick(PIN_LABEL[pin], locale)
    : kind === "checklist"
      ? pick(loc("清单本身", "The list itself"), locale)
      : pick(loc("—", "—"), locale);

  let advance = advanceVerb(kind, locale);
  if (kind === "tour" && !tour.done) {
    advance = `${tour.step + 1}/${TOUR_COUNT} · ${advance}`;
    if (allowsSkip(kind)) advance += locale === "en" ? " / Skip" : " / 跳过";
  } else if (kind === "hotspot") {
    advance = pick(HOTSPOT_STATE[hotspot], locale);
  } else if (kind === "checklist") {
    advance = `${checks}/${total} · ${advance}`;
  } else if (finished) {
    advance = pick(loc("已走完", "Finished"), locale);
  }

  let after: string;
  if (teaching && blocking) {
    after = pick(loc("正在挡住外面", "Blocking the outside"), locale);
  } else if (teaching && persists) {
    after = pick(loc("做完仍留着", "Will stay when done"), locale);
  } else if (teaching) {
    after = pick(loc("教完卸掉，不挡", "Unloads; does not block"), locale);
  } else if (persists) {
    after = pick(loc("仍留着 · 入门完成", "Stays · Ready"), locale);
  } else {
    after = pick(loc("已卸掉 · 不再挡", "Unloaded · no block"), locale);
  }

  const cells = [
    { k: locale === "en" ? "When" : "出现", v: pick(WHEN[kind], locale) },
    { k: locale === "en" ? "Pin" : "钉住", v: pinText },
    { k: locale === "en" ? "Advance" : "推进", v: advance },
    { k: locale === "en" ? "After" : "结束后", v: after },
  ];

  return (
    <dl className="guide-hud mt-3" aria-live="polite" data-guide-hud="">
      {cells.map((cell) => (
        <div key={cell.k} className="rounded-xl border border-border bg-surface px-3 py-2.5">
          <dt className="text-[10px] font-medium tracking-[0.12em] text-fg-subtle uppercase">{cell.k}</dt>
          <dd
            className={cn(
              "mt-1 text-[13px] leading-snug font-medium",
              cell.k === (locale === "en" ? "After" : "结束后") && finished && persists && "text-intent",
              cell.k === (locale === "en" ? "After" : "结束后") && teaching && blocking && "text-accent",
            )}
          >
            {cell.v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function GuideLeftover({
  kind,
  locale,
  compact,
  locked,
  onReplay,
}: {
  kind: KindId;
  locale: Locale;
  compact: boolean;
  locked: boolean;
  onReplay: () => void;
}) {
  const copy = LEFTOVER[kind];
  return (
    <div className="guide-leftover" data-guide-leftover={kind} aria-live="polite">
      <div className="min-w-0">
        <p className="text-[12px] font-semibold tracking-tight">{pick(copy.title, locale)}</p>
        {compact ? null : <p className="mt-0.5 text-[11px] text-fg-muted">{pick(copy.detail, locale)}</p>}
      </div>
      {!compact && !locked ? (
        <button
          type="button"
          onClick={onReplay}
          className="h-8 shrink-0 rounded-lg bg-fg px-3 text-[12px] font-medium text-surface"
        >
          {locale === "en" ? "Replay" : "再看一遍"}
        </button>
      ) : null}
    </div>
  );
}
