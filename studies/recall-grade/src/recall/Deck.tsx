import { CircleCheck } from "lucide-react";
import { formatDay } from "../lib/fixtures";
import { DECK, GRADE_COPY } from "../lib/kinds";
import {
  canGrade,
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

export function Deck({
  locale,
  today,
  current,
  face,
  remaining,
  total,
  lastCommit,
  locked = false,
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

  return (
    <Window
      title={title}
      action={
        empty ? undefined : (
          <span className="shrink-0 text-[11px] tabular-nums text-fg-subtle">
            {locale === "en" ? `${remaining} due` : `${remaining} 题待复习`}
          </span>
        )
      }
    >
      {empty || !current ? (
        <EmptyPanel locale={locale} locked={locked} onReset={onReset} />
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
          onFlip={onFlip}
          onGrade={onGrade}
        />
      )}
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
  onFlip?: () => void;
  onGrade?: (grade: Grade) => void;
}) {
  const overdue = card.nextReview < today;
  const shown = total - remaining + 1;
  const gradesOn = canGrade(face);

  return (
    <div className="min-w-0 overflow-x-hidden">
      <div className="mb-3 flex items-center justify-between gap-3 text-[12px] text-fg-muted">
        <span className="tabular-nums">
          {locale === "en" ? `${shown} / ${total}` : `第 ${shown} / ${total} 题`}
        </span>
        {lastCommit ? (
          <span className="recall-commit min-w-0 truncate text-accent">
            {commitLine(lastCommit, locale)}
          </span>
        ) : (
          <span className="truncate">
            {locale === "en" ? "Flip to compare, then grade" : "翻开对照，再打分"}
          </span>
        )}
      </div>

      <article className="min-w-0 rounded-xl border border-border bg-surface-2 px-3.5 py-4">
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
        </div>
        <p className="text-[15px] leading-relaxed text-fg">{card.question}</p>
        {face === "answer" ? (
          <dl className="mt-4 grid min-w-0 gap-2">
            <div className="min-w-0 rounded-lg bg-surface px-3 py-2">
              <dt className="text-[11px] text-fg-subtle">
                {locale === "en" ? "Mine" : "我的答案"}
              </dt>
              <dd className="mt-1 text-[13px] leading-relaxed">{card.mine}</dd>
            </div>
            <div className="min-w-0 rounded-lg bg-surface px-3 py-2">
              <dt className="text-[11px] text-fg-subtle">
                {locale === "en" ? "Answer" : "正确答案"}
              </dt>
              <dd className="mt-1 text-[13px] leading-relaxed text-accent">{card.answer}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-[13px] text-fg-muted">
            {locale === "en"
              ? "Think it through first, then flip to compare."
              : "先自己想一遍，再翻开对照。"}
          </p>
        )}
        <p className="mt-3 text-[11px] text-fg-subtle">
          {locale === "en"
            ? `Scheduled ${formatDay(card.nextReview, locale)} · reviewed ${card.reviewCount}×`
            : `原定复习 ${formatDay(card.nextReview, locale)} · 已复习 ${card.reviewCount} 次`}
        </p>
      </article>

      {gradesOn ? (
        <div className="mt-3 grid min-w-0 grid-cols-3 gap-2">
          <GradeButton
            tone="again"
            disabled={locked}
            onClick={() => onGrade?.("again")}
          >
            {pick(GRADE_COPY.again, locale)}
          </GradeButton>
          <GradeButton
            tone="hard"
            disabled={locked}
            onClick={() => onGrade?.("hard")}
          >
            {pick(GRADE_COPY.hard, locale)}
          </GradeButton>
          <GradeButton
            tone="good"
            disabled={locked}
            onClick={() => onGrade?.("good")}
          >
            {pick(GRADE_COPY.good, locale)}
          </GradeButton>
        </div>
      ) : (
        <button
          type="button"
          disabled={locked}
          onClick={onFlip}
          className="mt-3 w-full rounded-xl bg-fg px-3 py-2.5 text-[14px] font-medium text-surface disabled:opacity-100"
        >
          {locale === "en" ? "Reveal answer" : "查看答案"}
        </button>
      )}
    </div>
  );
}

function GradeButton({
  tone,
  disabled,
  onClick,
  children,
}: {
  tone: Grade;
  disabled: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "min-w-0 truncate rounded-xl px-2 py-2.5 text-[13px] font-medium disabled:opacity-100",
        tone === "again" && "border border-border bg-surface text-fg",
        tone === "hard" && "bg-surface-2 text-fg",
        tone === "good" && "bg-fg text-surface",
      )}
    >
      {children}
    </button>
  );
}

function EmptyPanel({
  locale,
  locked,
  onReset,
}: {
  locale: Locale;
  locked: boolean;
  onReset?: () => void;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center px-3 py-8 text-center">
      <span
        className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent"
        aria-hidden="true"
      >
        <CircleCheck className="size-5" strokeWidth={1.75} />
      </span>
      <h3 className="mt-4 text-[15px] font-semibold tracking-tight">
        {pick(DECK.emptyTitle, locale)}
      </h3>
      <p className="mt-1.5 max-w-[16rem] text-[13px] leading-relaxed text-fg-muted">
        {pick(DECK.emptyGuidance, locale)}
      </p>
      <button
        type="button"
        disabled={locked}
        onClick={onReset}
        className="mt-4 rounded-full bg-fg px-3.5 py-1.5 text-[13px] font-medium text-surface disabled:opacity-100"
      >
        {pick(DECK.emptyAction, locale)}
      </button>
    </div>
  );
}

function commitLine(commit: LastCommit, locale: Locale): string {
  const label = pick(GRADE_COPY[commit.grade], locale);
  const when = formatDay(commit.nextReview, locale);
  return locale === "en" ? `${label} · next ${when}` : `${label} · 下次 ${when}`;
}
