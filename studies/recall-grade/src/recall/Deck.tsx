import { CircleCheck } from "lucide-react";
import { formatDay } from "../lib/fixtures";
import { DECK, GRADE_COPY, GRADE_LANES } from "../lib/kinds";
import {
  canGrade,
  intervalDays,
  type Card,
  type Face,
  type Grade,
} from "../lib/machines";
import { pick, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Window } from "./Frame";
import "./recall.css";

export type LastCommit = {
  grade: Grade;
  nextReview: string;
};

export type RecallLayout = "desk" | "stage";

export function Deck({
  locale,
  today,
  current,
  face,
  remaining,
  total,
  lastCommit,
  locked = false,
  layout = "stage",
  onFlip,
  onGrade,
  onReset,
}: {
  locale: Locale;
  today: string;
  current: Card | null;
  face: Face;
  remaining: number;
  total: number;
  lastCommit?: LastCommit | null;
  locked?: boolean;
  layout?: RecallLayout;
  onFlip?: () => void;
  onGrade?: (grade: Grade) => void;
  onReset?: () => void;
}) {
  const empty = current === null || remaining === 0;
  const title = empty
    ? locale === "en"
      ? "Recall · done for today"
      : "复习 · 今日已清"
    : pick(DECK.window, locale);

  const action = empty ? undefined : (
    <span className="shrink-0 text-[11px] tabular-nums text-fg-subtle">
      {locale === "en" ? `${remaining} due` : `${remaining} 题待复习`}
    </span>
  );

  const body =
    empty || !current ? (
      <EmptyPanel locale={locale} layout={layout} locked={locked} onReset={onReset} />
    ) : (
      <CardPanel
        locale={locale}
        today={today}
        card={current}
        face={face}
        remaining={remaining}
        total={total}
        lastCommit={lastCommit ?? null}
        locked={locked}
        layout={layout}
        onFlip={onFlip}
        onGrade={onGrade}
      />
    );

  if (layout === "desk") {
    return (
      <div className="mx-auto w-full max-w-[28rem]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="truncate text-[13px] font-medium text-fg-muted">{title}</p>
          {action}
        </div>
        {body}
      </div>
    );
  }

  return (
    <Window title={title} action={action}>
      {body}
    </Window>
  );
}

function CardPanel({
  locale,
  today,
  card,
  face,
  remaining,
  total,
  lastCommit,
  locked,
  layout,
  onFlip,
  onGrade,
}: {
  locale: Locale;
  today: string;
  card: Card;
  face: Face;
  remaining: number;
  total: number;
  lastCommit: LastCommit | null;
  locked: boolean;
  layout: RecallLayout;
  onFlip?: () => void;
  onGrade?: (grade: Grade) => void;
}) {
  const overdue = card.nextReview < today;
  const shown = total - remaining + 1;
  const gradesOn = canGrade(face);
  const desk = layout === "desk";

  return (
    <div className="min-w-0 overflow-x-hidden" data-locked={locked ? "true" : "false"}>
      <div className="mb-3 flex items-center justify-between gap-3 text-[12px] text-fg-muted">
        <span className="tabular-nums">
          {locale === "en" ? `${shown} / ${total}` : `第 ${shown} / ${total} 题`}
        </span>
        {lastCommit ? (
          <span className={cn("recall-commit min-w-0 truncate", commitTone(lastCommit.grade))}>
            {commitLine(lastCommit, locale)}
          </span>
        ) : (
          <span className="truncate">
            {locale === "en" ? "Flip to compare, then grade" : "翻开对照，再打分"}
          </span>
        )}
      </div>

      <DueTrack remaining={remaining} total={total} />

      <article
        key={`${card.id}-${face}`}
        className={cn(
          "recall-card-in min-w-0 rounded-xl border border-border bg-surface",
          desk ? "rounded-2xl px-5 py-6 shadow-card" : "bg-surface-2 px-3.5 py-4",
        )}
        data-face={face}
      >
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium",
              overdue ? "bg-fg text-surface" : "bg-accent-soft text-accent",
            )}
          >
            {overdue
              ? locale === "en"
                ? "Overdue"
                : "已逾期"
              : locale === "en"
                ? "Due today"
                : "今日到期"}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium",
              gradesOn ? "bg-intent-soft text-intent" : "bg-surface-2 text-fg-subtle",
            )}
          >
            {gradesOn
              ? locale === "en"
                ? "Compare · grade"
                : "对照 · 打分"
              : locale === "en"
                ? "Prompt"
                : "问题"}
          </span>
        </div>
        <p className={cn("leading-relaxed text-fg", desk ? "text-[1.125rem]" : "text-[15px]")}>
          {card.question}
        </p>
        {face === "answer" ? (
          <dl className={cn("recall-compare is-open grid min-w-0 gap-2", desk ? "mt-5" : "mt-4")}>
            <div className={cn("recall-compare-inner min-w-0 rounded-lg bg-surface-2", desk ? "px-4 py-3" : "bg-surface px-3 py-2")}>
              <dt className="text-[11px] text-fg-subtle">
                {locale === "en" ? "Mine" : "我的答案"}
              </dt>
              <dd className={cn("mt-1 leading-relaxed", desk ? "text-[15px]" : "text-[13px]")}>
                {card.mine}
              </dd>
            </div>
            <div className={cn("recall-compare-inner min-w-0 rounded-lg bg-surface-2", desk ? "px-4 py-3" : "bg-surface px-3 py-2")}>
              <dt className="text-[11px] text-fg-subtle">
                {locale === "en" ? "Answer" : "正确答案"}
              </dt>
              <dd className={cn("mt-1 leading-relaxed text-accent", desk ? "text-[15px]" : "text-[13px]")}>
                {card.answer}
              </dd>
            </div>
          </dl>
        ) : (
          <p className={cn("text-fg-muted", desk ? "mt-5 text-[15px]" : "mt-4 text-[13px]")}>
            {locale === "en"
              ? "Think it through first, then flip to compare."
              : "先自己想一遍，再翻开对照。"}
          </p>
        )}
        <p className={cn("text-[11px] text-fg-subtle", desk ? "mt-4" : "mt-3")}>
          {locale === "en"
            ? `Scheduled ${formatDay(card.nextReview, locale)} · reviewed ${card.reviewCount}×`
            : `原定复习 ${formatDay(card.nextReview, locale)} · 已复习 ${card.reviewCount} 次`}
        </p>
      </article>

      {gradesOn ? (
        <div className={cn("min-w-0", desk ? "mt-4" : "mt-3")}>
          <p className={cn("mb-2 text-[11px] text-fg-subtle", desk && "mb-2.5")}>
            {locale === "en"
              ? "These three commit an interval — not the next frame."
              : "三档提交的是间隔，不是下一张。"}
          </p>
          <div className={cn("recall-grade", desk ? "gap-3" : "gap-2")}>
            {GRADE_LANES.map((lane) => (
              <GradeButton
                key={lane.id}
                tone={lane.id}
                desk={desk}
                disabled={locked}
                hint={gradeHint(card, lane.id, locale)}
                kbd={lane.key}
                onClick={() => onGrade?.(lane.id)}
              >
                {pick(lane.label, locale)}
              </GradeButton>
            ))}
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={locked}
          onClick={onFlip}
          className={cn(
            "recall-reveal w-full font-medium text-surface disabled:opacity-100",
            desk
              ? "mt-4 rounded-xl bg-fg px-4 py-3 text-[15px]"
              : "mt-3 rounded-xl bg-fg px-3 py-2.5 text-[14px]",
          )}
        >
          {locale === "en" ? "Reveal answer" : "查看答案"}
        </button>
      )}
    </div>
  );
}

function DueTrack({ remaining, total }: { remaining: number; total: number }) {
  const done = Math.max(0, total - remaining);
  return (
    <div
      className="recall-due mb-3"
      aria-hidden="true"
    >
      {Array.from({ length: total }, (_, i) => (
        <i
          key={i}
          className={cn("recall-due-seg", i < done && "is-done", i === done && remaining > 0 && "is-now")}
        />
      ))}
    </div>
  );
}

function GradeButton({
  tone,
  desk,
  disabled,
  hint,
  kbd,
  onClick,
  children,
}: {
  tone: Grade;
  desk: boolean;
  disabled: boolean;
  hint: string;
  kbd: string;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      data-tone={tone}
      className={cn(
        "recall-grade-btn min-w-0 disabled:opacity-100",
        desk ? "px-2.5 py-2.5" : "px-1.5 py-2",
      )}
    >
      <span className="flex items-center justify-between gap-1">
        <span className={cn("font-medium", desk ? "text-[14px]" : "truncate text-[13px]")}>
          {children}
        </span>
        <kbd className="recall-grade-key">{kbd}</kbd>
      </span>
      <span className={cn("mt-1 block leading-snug text-current/70", desk ? "text-[11px]" : "text-[10px]")}>
        {hint}
      </span>
    </button>
  );
}

function EmptyPanel({
  locale,
  layout,
  locked,
  onReset,
}: {
  locale: Locale;
  layout: RecallLayout;
  locked: boolean;
  onReset?: () => void;
}) {
  const desk = layout === "desk";
  return (
    <div
      className={cn(
        "recall-empty flex min-w-0 flex-col items-center text-center",
        desk ? "px-4 py-10" : "px-3 py-8",
      )}
    >
      <span
        className={cn(
          "grid place-items-center rounded-2xl bg-intent-soft text-intent",
          desk ? "size-14" : "size-12",
        )}
        aria-hidden="true"
      >
        <CircleCheck className={desk ? "size-6" : "size-5"} strokeWidth={1.75} />
      </span>
      <h3 className={cn("font-semibold tracking-tight", desk ? "mt-5 text-[1.15rem]" : "mt-4 text-[15px]")}>
        {pick(DECK.emptyTitle, locale)}
      </h3>
      <p className={cn("max-w-[16rem] leading-relaxed text-fg-muted", desk ? "mt-2 text-[14px]" : "mt-1.5 text-[13px]")}>
        {pick(DECK.emptyGuidance, locale)}
      </p>
      <button
        type="button"
        disabled={locked}
        onClick={onReset}
        className={cn(
          "rounded-full bg-fg font-medium text-surface disabled:opacity-100",
          desk ? "mt-5 px-4 py-2 text-[14px]" : "mt-4 px-3.5 py-1.5 text-[13px]",
        )}
      >
        {pick(DECK.emptyAction, locale)}
      </button>
    </div>
  );
}

function gradeHint(card: Card, grade: Grade, locale: Locale): string {
  if (grade === "again") {
    return locale === "en" ? "Today · reset" : "今天末尾 · 归零";
  }
  if (grade === "hard") {
    return locale === "en" ? "Tomorrow · keep" : "明天 · 次数保留";
  }
  const days = intervalDays(card.reviewCount + 1);
  return locale === "en" ? `${days}d · count +1` : `${days} 天 · 次数 +1`;
}

function commitTone(grade: Grade): string {
  if (grade === "again") return "text-wrong";
  if (grade === "hard") return "text-predict";
  return "text-intent";
}

function commitLine(commit: LastCommit, locale: Locale): string {
  const label = pick(GRADE_COPY[commit.grade], locale);
  const when = formatDay(commit.nextReview, locale);
  return locale === "en" ? `${label} · next ${when}` : `${label} · 下次 ${when}`;
}
