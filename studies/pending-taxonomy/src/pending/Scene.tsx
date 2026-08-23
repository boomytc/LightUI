import { Inbox } from "lucide-react";
import { BRIEFS, EMPTY_COPY, type Brief } from "../lib/fixtures";
import { hasAction, shimmerMotion } from "../lib/machines";
import { pick, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";

export function BoneList({
  briefs = BRIEFS,
  locale,
  reduceMotion,
}: {
  briefs?: readonly Brief[];
  locale: Locale;
  reduceMotion: boolean;
}) {
  const shine = shimmerMotion(reduceMotion);
  return (
    <ul className="grid min-w-0 gap-2" aria-hidden="true" data-region="skeleton">
      {briefs.map((brief) => (
        <li key={brief.id}>
          <BoneCard brief={brief} locale={locale} shine={shine} />
        </li>
      ))}
    </ul>
  );
}

function BoneCard({
  brief,
  locale,
  shine,
}: {
  brief: Brief;
  locale: Locale;
  shine: boolean;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-border bg-surface px-3 py-3">
      <Bone extra="size-10 shrink-0 rounded-lg" shine={shine} />
      <div className="min-w-0 flex-1">
        <Bone extra="block h-3.5 rounded-sm" shine={shine} width={copyWidth(pick(brief.title, locale), locale)} />
        <Bone extra="mt-2 block h-2.5 rounded-sm" shine={shine} width={copyWidth(pick(brief.meta, locale), locale)} />
        <Bone extra="mt-2.5 block h-5 rounded-full" shine={shine} width={pillWidth(pick(brief.tag, locale), locale)} />
      </div>
    </div>
  );
}

function Bone({
  extra,
  shine,
  width,
}: {
  extra: string;
  shine: boolean;
  width?: string;
}) {
  return (
    <span
      className={cn("pending-bone", extra)}
      data-static={shine ? undefined : "true"}
      style={width ? { width } : undefined}
    />
  );
}

function copyWidth(text: string, locale: Locale): string {
  const inner = locale === "en" ? `${Math.max(text.length, 4)}ch` : `${Math.max(text.length, 2)}em`;
  return `min(100%, ${inner})`;
}

function pillWidth(text: string, locale: Locale): string {
  const inner = locale === "en" ? `${Math.max(text.length, 2)}ch` : `${Math.max(text.length, 2)}em`;
  return `min(100%, calc(${inner} + 1rem))`;
}

export function BriefList({ briefs, locale }: { briefs: readonly Brief[]; locale: Locale }) {
  return (
    <ul className="grid min-w-0 gap-2" data-region="content">
      {briefs.map((brief) => (
        <li key={brief.id}>
          <article className="flex min-w-0 items-start gap-3 rounded-xl border border-border bg-surface px-3 py-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-[11px] font-semibold text-accent">
              {brief.mark}
            </span>
            <div className="min-w-0 flex-1">
              <p className="h-3.5 truncate text-[13px] font-medium leading-[14px]">
                {pick(brief.title, locale)}
              </p>
              <p className="mt-2 h-2.5 truncate text-[11px] leading-[10px] text-fg-muted">
                {pick(brief.meta, locale)}
              </p>
              <span className="mt-2.5 inline-flex h-5 items-center rounded-full bg-surface-2 px-2 text-[10px] leading-none text-fg-subtle">
                {pick(brief.tag, locale)}
              </span>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

export function EmptyPanel({
  locale,
  onCreate,
}: {
  locale: Locale;
  onCreate?: () => void;
}) {
  return (
    <div className="pending-occupy px-3 py-8" data-region="empty">
      <span
        className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent"
        aria-hidden="true"
      >
        <Inbox className="size-5" strokeWidth={1.75} />
      </span>
      <h3 className="mt-4 text-[15px] font-semibold tracking-tight">
        {pick(EMPTY_COPY.title, locale)}
      </h3>
      <p className="mt-1.5 max-w-[16rem] text-[13px] leading-relaxed text-fg-muted">
        {pick(EMPTY_COPY.guidance, locale)}
      </p>
      {hasAction("empty") ? (
        <button
          type="button"
          onClick={onCreate}
          className="mt-4 rounded-full bg-fg px-3.5 py-1.5 text-[13px] font-medium text-surface"
        >
          {pick(EMPTY_COPY.action, locale)}
        </button>
      ) : null}
    </div>
  );
}

export function SceneHeading({
  locale,
  count,
}: {
  locale: Locale;
  count?: number;
}) {
  return (
    <div className="mb-3 min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-fg-subtle">
        {locale === "en" ? "Orbit · studio" : "Orbit · 工坊"}
      </p>
      <h3 className="mt-1 text-[1.05rem] font-semibold tracking-tight">
        {locale === "en" ? "Briefs" : "简报"}
      </h3>
      <p className="mt-0.5 text-[12px] text-fg-muted">
        {count === undefined
          ? locale === "en"
            ? "Layout stays put while they arrive"
            : "它们到达前，位子先占住"
          : count === 0
            ? locale === "en"
              ? "0 items — offer a next step"
              : "0 条 — 给出下一步"
            : locale === "en"
              ? `${count} briefs`
              : `${count} 份简报`}
      </p>
    </div>
  );
}
