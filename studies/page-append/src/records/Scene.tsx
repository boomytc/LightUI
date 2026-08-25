import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { pick, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import type { Resource } from "../lib/fixtures";
import { nextPage, prevPage } from "../lib/machines";

export function ResourceList({
  resources,
  locale,
  replace,
  pageKey,
}: {
  resources: readonly Resource[];
  locale: Locale;
  replace: boolean;
  pageKey: number;
}) {
  return (
    <ul
      key={replace ? pageKey : "append"}
      className={cn("grid min-w-0 gap-2 px-3 py-3 sm:px-4", replace ? "records-replace" : undefined)}
      data-region={replace ? "page" : "append"}
    >
      {resources.map((item) => (
        <li key={item.id} data-resource={item.id}>
          <article className="flex min-h-[4.75rem] min-w-0 items-start gap-3 rounded-xl border border-border bg-surface px-3 py-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-[11px] font-semibold text-accent">
              {item.mark}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium leading-tight">{pick(item.title, locale)}</p>
              <p className="mt-1 truncate text-[11px] leading-tight text-fg-muted">{pick(item.meta, locale)}</p>
              <span className="mt-2 inline-flex h-5 items-center rounded-full bg-surface-2 px-2 text-[10px] leading-none text-fg-subtle">
                {pick(item.tag, locale)}
              </span>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

export function ShowingLine({
  locale,
  kind,
  from,
  to,
  total,
  exhausted,
}: {
  locale: Locale;
  kind: "page" | "append";
  from: number;
  to: number;
  total: number;
  exhausted: boolean;
}) {
  const range =
    kind === "page"
      ? locale === "en"
        ? `showing ${from}–${to} of ${total}`
        : `showing ${from}–${to} of ${total}`
      : locale === "en"
        ? `showing 1–${to} of ${total}`
        : `showing 1–${to} of ${total}`;

  return (
    <div className="flex shrink-0 items-end justify-between gap-3 border-b border-border px-3 py-2.5 sm:px-4">
      <div className="min-w-0">
        <p className="font-mono text-[12px] tabular-nums text-accent">{range}</p>
        <p className="mt-0.5 text-[11px] text-fg-subtle">
          {kind === "page"
            ? locale === "en"
              ? exhausted
                ? "Last page — previous cards dropped"
                : "This slice only — previous cards dropped"
              : exhausted
                ? "最后一页 — 上一页已卸掉"
                : "只留这一页 — 上一页已卸掉"
            : locale === "en"
              ? exhausted
                ? "Prefix kept — all loaded"
                : "Prefix kept — old nodes stay"
              : exhausted
                ? "前缀留下 — 已加载全部"
                : "前缀留下 — 旧节点不卸"}
        </p>
      </div>
    </div>
  );
}

export function PageControl({
  locale,
  page,
  pages,
  locked,
  onPage,
}: {
  locale: Locale;
  page: number;
  pages: number;
  locked: boolean;
  onPage: (page: number) => void;
}) {
  const n = Math.max(pages, 1);
  const current = Math.min(Math.max(page, 1), n);

  return (
    <div
      className="flex shrink-0 items-center justify-between gap-2 border-t border-border px-3 py-2.5 sm:px-4"
      role="navigation"
      aria-label={locale === "en" ? "Pagination" : "翻页"}
    >
      <IconBtn
        label={locale === "en" ? "Previous page" : "上一页"}
        disabled={locked || current <= 1}
        onClick={() => onPage(prevPage(current, n))}
      >
        <ChevronLeft className="size-4" />
      </IconBtn>

      <div
        className="relative min-w-0 flex-1 rounded-full bg-surface-2 p-1"
        data-page-chips=""
      >
        <div
          className="relative grid"
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
        >
          <span
            aria-hidden="true"
            className="records-chip pointer-events-none absolute inset-y-0 rounded-full bg-fg"
            style={{
              width: `${100 / n}%`,
              transform: `translateX(${(current - 1) * 100}%)`,
            }}
          />
          {Array.from({ length: n }, (_, i) => {
            const p = i + 1;
            const on = p === current;
            return (
              <button
                key={p}
                type="button"
                data-page={p}
                aria-current={on ? "page" : undefined}
                disabled={locked}
                onClick={() => onPage(p)}
                className={cn(
                  "relative z-1 min-h-8 px-1 text-[12px] font-medium tabular-nums transition-colors",
                  on ? "text-surface" : "text-fg-muted hover:text-fg",
                )}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      <IconBtn
        label={locale === "en" ? "Next page" : "下一页"}
        disabled={locked || current >= n}
        onClick={() => onPage(nextPage(current, n))}
      >
        <ChevronRight className="size-4" />
      </IconBtn>
    </div>
  );
}

export function AppendControl({
  locale,
  exhausted,
  locked,
  onMore,
}: {
  locale: Locale;
  exhausted: boolean;
  locked: boolean;
  onMore: () => void;
}) {
  return (
    <div className="flex shrink-0 justify-center border-t border-border px-3 py-2.5 sm:px-4">
      <button
        type="button"
        data-append="more"
        disabled={locked || exhausted}
        onClick={onMore}
        className={cn(
          "min-h-9 rounded-full px-4 text-[13px] font-medium",
          exhausted
            ? "bg-surface-2 text-fg-subtle"
            : "bg-fg text-surface hover:opacity-90 disabled:opacity-50",
        )}
      >
        {exhausted
          ? locale === "en"
            ? "All loaded"
            : "已加载全部"
          : locale === "en"
            ? "Load more"
            : "加载更多"}
      </button>
    </div>
  );
}

function IconBtn({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-surface text-fg disabled:opacity-35"
    >
      {children}
    </button>
  );
}
