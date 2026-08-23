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

      <article
        className={cn(
          "min-w-0 rounded-xl border border-border bg-surface",
          desk ? "rounded-2xl px-5 py-6 shadow-card" : "bg-surface-2 px-3.5 py-4",
        )}
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
        </div>
        <p className={cn("leading-relaxed text-fg", desk ? "text-[1.125rem]" : "text-[15px]")}>
          {card.question}
        </p>
        {face === "answer" ? (
          <dl className={cn("grid min-w-0 gap-2", desk ? "mt-5" : "mt-4")}>
            <div className={cn("min-w-0 rounded-lg bg-surface-2", desk ? "px-4 py-3" : "bg-surface px-3 py-2")}>
              <dt className="text-[11px] text-fg-subtle">
                {locale === "en" ? "Mine" : "我的答案"}
              </dt>
              <dd className={cn("mt-1 leading-relaxed", desk ? "text-[15px]" : "text-[13px]")}>
                {card.mine}
              </dd>
            </div>
            <div className={cn("min-w-0 rounded-lg bg-surface-2", desk ? "px-4 py-3" : "bg-surface px-3 py-2")}>
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
        <div className={cn("grid min-w-0 grid-cols-3", desk ? "mt-4 gap-3" : "mt-3 gap-2")}>
          <GradeButton
            tone="again"
            desk={desk}
            disabled={locked}
            onClick={() => onGrade?.("again")}
          >
            {pick(GRADE_COPY.again, locale)}
          </GradeButton>
          <GradeButton
            tone="hard"
            desk={desk}
            disabled={locked}
            onClick={() => onGrade?.("hard")}
          >
            {pick(GRADE_COPY.hard, locale)}
          </GradeButton>
          <GradeButton
            tone="good"
            desk={desk}
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
          className={cn(
            "w-full font-medium text-surface disabled:opacity-100",
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

function GradeButton({
  tone,
  desk,
  disabled,
  onClick,
  children,
}: {
  tone: Grade;
  desk: boolean;
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
        "min-w-0 rounded-xl font-medium disabled:opacity-100",
        desk ? "px-3 py-3 text-[14px]" : "truncate px-2 py-2.5 text-[13px]",
        tone === "again" && "border border-border bg-surface text-fg",
        tone === "hard" && (desk ? "bg-surface text-fg" : "bg-surface-2 text-fg"),
        tone === "good" && "bg-fg text-surface",
      )}
    >
      {children}
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
        "flex min-w-0 flex-col items-center text-center",
        desk ? "px-4 py-10" : "px-3 py-8",
      )}
    >
      <span
        className={cn(
          "grid place-items-center rounded-2xl bg-accent-soft text-accent",
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

function commitLine(commit: LastCommit, locale: Locale): string {
  const label = pick(GRADE_COPY[commit.grade], locale);
  const when = formatDay(commit.nextReview, locale);
  return locale === "en" ? `${label} · next ${when}` : `${label} · 下次 ${when}`;
}
