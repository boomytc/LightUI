import { useEffect, useRef } from "react";
import { Search, UserPlus, X } from "lucide-react";
import { FILTERS, metaLine } from "../lib/fixtures";
import {
  emptyAction,
  keepsExistingList,
  preservesQuery,
  type Customer,
  type EmptyCause,
  type FilterId,
} from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import type { WorkspaceAction, WorkspaceState } from "../lib/workspace";
import { Composer } from "./Composer";

export function Customers({
  locked,
  state,
  cause,
  visible,
  run,
  onRetry,
}: {
  locked: boolean;
  state: WorkspaceState;
  cause: EmptyCause;
  visible: Customer[];
  run: (action: WorkspaceAction) => void;
  onRetry: () => void;
}) {
  const locale = useLocale();
  const action = emptyAction(cause);
  const list = (
    <ul className="px-4 pb-6" data-region="list">
      {visible.map((customer, index) => (
        <li
          key={customer.id}
          className="empty-row flex items-center justify-between gap-3 border-b border-border py-3"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <span className="text-[13px] font-medium text-fg">{customer.name}</span>
          <span className="truncate text-[12px] text-fg-muted">
            {metaLine(customer, locale)}
          </span>
        </li>
      ))}
    </ul>
  );
  const well = keepsExistingList(cause)
    ? list
    : action === "create"
      ? <FirstUseEmpty locked={locked} run={run} />
      : action === "revise-query"
        ? <SearchEmpty query={state.query} />
        : action === "loosen-filter"
          ? <FilterEmpty />
          : list;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-4 pt-4 pb-2">
        <h2 className="text-[15px] font-medium">
          {locale === "en" ? "Customers" : "客户列表"}
        </h2>
        <label className="mt-3 block">
          <span className="sr-only">
            {locale === "en" ? "Search name or phone" : "搜索姓名或手机号"}
          </span>
          <input
            value={state.query}
            readOnly={locked}
            onChange={(event) => run({ type: "query", query: event.target.value })}
            placeholder={locale === "en" ? "Search name or phone" : "搜索姓名或手机号"}
            autoComplete="off"
            className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-[13px] text-fg outline-none placeholder:text-fg-subtle focus:border-border-strong"
          />
        </label>
        {preservesQuery(cause) ? (
          <p className="mt-2 text-[11px] text-fg-muted">
            {locale === "en"
              ? "Try one character of the name, or search by phone"
              : "可修改关键词，或用手机号搜索"}
          </p>
        ) : (
          <FilterRow locked={locked} state={state} run={run} />
        )}
        <LoadBanner locked={locked} status={state.loadStatus} onRetry={onRetry} />
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
        {well}
        <Composer open={state.composing && !locked} name={state.draftName} run={run} />
      </div>
    </div>
  );
}

function FilterRow({
  locked,
  state,
  run,
}: {
  locked: boolean;
  state: WorkspaceState;
  run: (action: WorkspaceAction) => void;
}) {
  const locale = useLocale();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state.filterOpen || locked) return;
    function onDoc(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        run({ type: "filterOpen", open: false });
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [state.filterOpen, locked, run]);

  if (state.customers.length === 0) return null;

  return (
    <div className="relative mt-2.5 flex flex-wrap items-center gap-1.5" ref={wrapRef}>
      {state.filters.map((id) => {
        const meta = FILTERS.find((item) => item.id === id);
        return (
          <button
            key={id}
            type="button"
            disabled={locked}
            onClick={() => run({ type: "removeFilter", id })}
            className="inline-flex h-7 items-center gap-1 rounded-full border border-border bg-surface px-2.5 text-[11px] text-fg hover:bg-accent-soft disabled:hover:bg-surface disabled:opacity-100"
          >
            {meta ? pick(meta.label, locale) : id}
            <X className="size-3 text-fg-subtle" />
          </button>
        );
      })}
      {locked ? null : (
        <button
          type="button"
          className="h-7 rounded-full px-2 text-[11px] text-fg-muted hover:text-fg"
          onClick={() => run({ type: "filterOpen", open: !state.filterOpen })}
          aria-expanded={state.filterOpen}
        >
          + {locale === "en" ? "Filter" : "筛选"}
        </button>
      )}
      {state.filterOpen && !locked ? (
        <FilterMenu filters={state.filters} run={run} />
      ) : null}
    </div>
  );
}

function FilterMenu({
  filters,
  run,
}: {
  filters: FilterId[];
  run: (action: WorkspaceAction) => void;
}) {
  const locale = useLocale();
  return (
    <div className="absolute top-9 left-0 z-20 w-40 rounded-lg border border-border bg-surface p-1 shadow-card">
      {FILTERS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => run({ type: "toggleFilter", id: item.id })}
          className={cn(
            "flex h-8 w-full items-center rounded-md px-2 text-left text-[12px]",
            filters.includes(item.id)
              ? "bg-accent-soft text-fg"
              : "text-fg-muted hover:bg-surface-2 hover:text-fg",
          )}
        >
          {pick(item.label, locale)}
        </button>
      ))}
    </div>
  );
}

function LoadBanner({
  locked,
  status,
  onRetry,
}: {
  locked: boolean;
  status: WorkspaceState["loadStatus"];
  onRetry: () => void;
}) {
  const locale = useLocale();
  if (status === "idle") return null;
  if (status === "loading") {
    return (
      <p className="mt-2.5 text-[12px] text-fg-muted">
        {locale === "en" ? "Fetching the latest records…" : "正在重新获取最新数据…"}
      </p>
    );
  }
  if (status === "success") {
    return (
      <p className="mt-2.5 text-[12px] text-intent">
        {locale === "en" ? "Updated · customer records synced" : "已更新 · 客户记录已同步"}
      </p>
    );
  }
  return (
    <div className="empty-banner mt-2.5" data-region="banner">
      <p className="text-[12px] text-fg">
        {locale === "en"
          ? "Update failed · last customer records kept"
          : "更新失败 · 已保留上次的客户记录"}
      </p>
      <button
        type="button"
        disabled={locked}
        onClick={onRetry}
        className="shrink-0 text-[12px] font-medium text-wrong underline decoration-transparent underline-offset-4 hover:decoration-wrong disabled:opacity-100 disabled:hover:decoration-transparent"
      >
        {locale === "en" ? "Retry" : "重试"}
      </button>
    </div>
  );
}

function FirstUseEmpty({
  locked,
  run,
}: {
  locked: boolean;
  run: (action: WorkspaceAction) => void;
}) {
  const locale = useLocale();
  return (
    <div className="empty-occupy empty-enter px-4 py-8" data-region="empty">
      <span className="empty-mark" aria-hidden="true">
        <UserPlus className="size-5" strokeWidth={1.75} />
      </span>
      <h3 className="mt-4 text-[15px] font-semibold tracking-tight">
        {locale === "en" ? "No customers yet" : "还没有客户"}
      </h3>
      <p className="mt-1.5 max-w-[16rem] text-[13px] leading-relaxed text-fg-muted">
        {locale === "en"
          ? "Add the first customer to start logging contacts and follow-ups."
          : "添加第一位客户，开始记录联系与跟进"}
      </p>
      <button
        type="button"
        disabled={locked}
        onClick={() => run({ type: "openComposer" })}
        className="mt-5 rounded-full bg-fg px-3.5 py-1.5 text-[12px] font-medium text-surface disabled:opacity-100"
      >
        {locale === "en" ? "Add the first customer" : "添加第一位客户"}
      </button>
      <button
        type="button"
        disabled={locked}
        onClick={() => run({ type: "import" })}
        className="mt-1 text-[12px] text-fg-muted underline decoration-border-strong underline-offset-4 hover:text-fg disabled:hover:text-fg-muted disabled:opacity-100"
      >
        {locale === "en" ? "Import customers" : "导入客户"}
      </button>
    </div>
  );
}

function SearchEmpty({ query }: { query: string }) {
  const locale = useLocale();
  const q = query.trim();
  return (
    <div className="empty-occupy empty-enter px-4 py-8" data-region="empty">
      <span className="empty-mark" aria-hidden="true">
        <Search className="size-5" strokeWidth={1.75} />
      </span>
      <h3 className="mt-4 text-[15px] font-semibold tracking-tight">
        {locale === "en"
          ? `No customers matching “${q}”`
          : `没找到与“${q}”相关的客户`}
      </h3>
      <p className="mt-1.5 max-w-[16rem] text-[13px] leading-relaxed text-fg-muted">
        {locale === "en"
          ? "Try one character of the name, or search by phone."
          : "试试名字中的一个字，或用手机号搜索"}
      </p>
    </div>
  );
}

function FilterEmpty() {
  const locale = useLocale();
  return (
    <div className="empty-occupy empty-enter px-4 py-8" data-region="empty">
      <h3 className="text-[15px] font-semibold tracking-tight">
        {locale === "en" ? "No customers match these filters" : "当前条件下没有客户"}
      </h3>
      <p className="mt-1.5 max-w-[16rem] text-[13px] leading-relaxed text-fg-muted">
        {locale === "en"
          ? "Tap × on a chip above and try dropping one filter."
          : "点击上方标签的 ×，试试减少一个条件"}
      </p>
    </div>
  );
}

