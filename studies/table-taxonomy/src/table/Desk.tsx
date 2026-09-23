import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Filter, MoreHorizontal, Plus, Search, SlidersHorizontal } from "lucide-react";
import { describeKind, flashText } from "../lib/kinds";
import {
  COLUMN_KEYS,
  STICKY_SCROLL_TOP,
  bulkVisible,
  chipsOf,
  columnOn,
  facetOfColumn,
  formatAmount,
  missCause,
  prime,
  reduceDesk,
  resting,
  selectionMark,
  stageDesk,
  stageScroll,
  todayStamp,
  visibleCustomers,
  type ColumnKey,
  type Customer,
  type FacetKey,
  type KindId,
} from "../lib/machines";
import { columnLabel, statusLabel as statusText } from "../lib/kinds";
import { useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import {
  Anchor,
  BulkMenu,
  Chip,
  ColumnPanel,
  FacetPanel,
  RecordDialog,
  RowMenu,
  TagBadge,
} from "./panels";

const SELECT_W = 44;

export function Desk({
  kind,
  mode,
  stageState = "",
  primeTick = 0,
  onKindChange,
}: {
  kind: KindId;
  mode: "teach" | "stage";
  stageState?: string;
  primeTick?: number;
  onKindChange?: (kind: KindId) => void;
}) {
  const locale = useLocale();
  const teach = mode === "teach";
  const [state, dispatch] = useReducer(reduceDesk, undefined, () =>
    mode === "stage" ? stageDesk(kind, stageState) : prime(kind, resting()),
  );
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const primed = useRef(teach ? primeTick : -1);
  const [facetQuery, setFacetQuery] = useState("");
  const [edge, setEdge] = useState({ x: false, y: false });
  const headRef = useRef<HTMLInputElement>(null);

  const visible = visibleCustomers(state.rows, state.facets, state.query, state.sort);
  const chips = chipsOf(state.facets);
  const mark = selectionMark(state.selected, visible.map((row) => row.id));
  const fields = COLUMN_KEYS.filter((key) => columnOn(state.visibility, key));
  const bulk = bulkVisible(state.selected.length);
  const miss = missCause(state.rows.length, visible.length, state.facets, state.query);
  const dialogCustomer = state.dialog?.id
    ? (state.rows.find((row) => row.id === state.dialog?.id) ?? null)
    : null;

  useEffect(() => {
    if (!headRef.current) return;
    headRef.current.indeterminate = mark === "some";
  }, [mark]);

  useEffect(() => {
    if (!teach) return;
    if (primed.current === primeTick) return;
    primed.current = primeTick;
    dispatch({ type: "prime", kind });
    if (kind === "sticky") scrollerRef.current?.scrollTo({ top: STICKY_SCROLL_TOP });
  }, [primeTick, kind, teach]);

  useLayoutEffect(() => {
    if (mode !== "stage") return;
    const el = scrollerRef.current;
    if (!el) return;
    const next = stageScroll(kind, stageState);
    el.scrollTop = next.top;
    el.scrollLeft = next.left;
    setEdge({ x: next.left > 0, y: next.top > 0 });
  }, [mode, kind, stageState]);

  useEffect(() => {
    setFacetQuery("");
  }, [state.panel]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (state.dialog) dispatch({ type: "closeDialog" });
      else if (state.panel.type !== "none") dispatch({ type: "closePanel" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.dialog, state.panel]);

  const bindAnchor = useCallback((node: HTMLElement | null) => {
    anchorRef.current = node;
  }, []);

  function look(next: KindId) {
    onKindChange?.(next);
  }

  const panelKey =
    state.panel.type === "facet"
      ? `facet-${state.panel.facet}`
      : state.panel.type === "row"
        ? `row-${state.panel.id}`
        : state.panel.type === "bulk"
          ? `bulk-${state.panel.which}`
          : state.panel.type;

  const flash = flashText(state.flash, locale);
  const spot = (on: boolean) => (teach && on ? "rounded-md ring-2 ring-accent/50 ring-offset-2 ring-offset-surface" : "");

  return (
    <div
      data-desk
      data-kind={kind}
      data-mode={mode}
      data-sort={state.sort}
      data-panel={panelKey}
      data-visible-count={visible.length}
      data-total-count={state.rows.length}
      data-selected-count={state.selected.length}
      data-chip-count={chips.length}
      ref={setRootEl}
      className="relative min-w-0"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 pb-3 sm:px-5">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold tracking-tight">
              {locale === "en" ? "Customers" : "客户管理"}
            </h2>
            <p className="mt-0.5 text-[12px] text-fg-muted">
              {locale === "en"
                ? "Filter on the column. Header stays in the table. One action on the row."
                : "筛在列上，表头钉在表里，一行只露出查看。"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: "openDialog", mode: "create", id: null })}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-fg px-2.5 text-[12px] font-medium text-surface"
          >
            <Plus className="size-3.5" />
            {locale === "en" ? "New customer" : "新建客户"}
          </button>
        </div>

        <div className="px-4 pb-3 sm:px-5">
          {teach ? (
            <p aria-live="polite" className="mb-3 text-[13px] leading-relaxed text-fg-muted">
              {describeKind(kind, state, locale)}
            </p>
          ) : null}
          {bulk ? (
            <div
              data-bulk
              className={cn(
                "flex flex-wrap items-center gap-2 rounded-xl bg-surface-2 px-3 py-2",
                spot(kind === "bulk"),
              )}
            >
              <span className="text-[13px] text-fg-muted">
                {locale === "en" ? "Selected" : "已选"}{" "}
                <span className="tabular-nums text-fg">{state.selected.length}</span>
              </span>
              <button
                type="button"
                ref={state.panel.type === "bulk" && state.panel.which === "status" ? bindAnchor : undefined}
                onClick={() => {
                  look("bulk");
                  dispatch({ type: "openBulk", which: "status" });
                }}
                className="inline-flex h-8 items-center rounded-lg bg-fg px-2.5 text-[12px] font-medium text-surface"
              >
                {locale === "en" ? "Set status" : "批量改状态"}
              </button>
              <button
                type="button"
                ref={state.panel.type === "bulk" && state.panel.which === "owner" ? bindAnchor : undefined}
                onClick={() => {
                  look("bulk");
                  dispatch({ type: "openBulk", which: "owner" });
                }}
                className="inline-flex h-8 items-center rounded-lg border border-border bg-surface px-2.5 text-[12px] font-medium"
              >
                {locale === "en" ? "Assign owner" : "分配负责人"}
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "clearSelection" })}
                className="inline-flex h-8 items-center rounded-lg px-2 text-[12px] text-fg-muted hover:bg-surface hover:text-fg"
              >
                {locale === "en" ? "Clear selection" : "取消选择"}
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <label className={cn("relative min-w-0 flex-1 sm:max-w-xs", spot(false))}>
                <span className="sr-only">{locale === "en" ? "Search by name" : "搜索客户名称"}</span>
                <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-fg-subtle" />
                <input
                  value={state.query}
                  onChange={(event) => dispatch({ type: "query", query: event.target.value })}
                  placeholder={locale === "en" ? "Search by name" : "搜索客户名称"}
                  className="h-9 w-full rounded-lg border border-border bg-surface pr-3 pl-8 text-[13px] outline-none placeholder:text-fg-subtle focus:border-border-strong"
                />
              </label>
              <button
                type="button"
                ref={state.panel.type === "columns" ? bindAnchor : undefined}
                onClick={() => {
                  look("columns");
                  dispatch({ type: "openColumns" });
                }}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-[12px] font-medium",
                  spot(kind === "columns"),
                )}
              >
                <SlidersHorizontal className="size-3.5" />
                {locale === "en" ? "Columns" : "列设置"}
              </button>
            </div>
          )}

          {chips.length > 0 ? (
            <div className={cn("mt-3 flex flex-wrap items-center gap-2", spot(kind === "chips"))}>
              {chips.map((chip) => (
                <Chip
                  key={`${chip.facet}-${chip.value}`}
                  facet={chip.facet}
                  value={chip.value}
                  locale={locale}
                  onRemove={() => {
                    look("chips");
                    dispatch({ type: "removeChip", facet: chip.facet, value: chip.value });
                  }}
                />
              ))}
              <button
                type="button"
                className="text-[12px] text-accent hover:underline"
                onClick={() => {
                  look("chips");
                  dispatch({ type: "clearFacets" });
                }}
              >
                {locale === "en" ? "Clear filters" : "清空筛选"}
              </button>
            </div>
          ) : null}
          {flash ? <p className="mt-2 text-[12px] text-accent">{flash}</p> : null}
        </div>

        <div
          ref={scrollerRef}
          data-scroller
          data-stuck={edge.y ? "y" : edge.x ? "x" : "none"}
          className={cn(
            "h-80 overflow-auto border-t border-border",
            teach && kind === "sticky" && "ring-2 ring-inset ring-accent/40",
          )}
          onScroll={(event) => {
            const top = event.currentTarget.scrollTop;
            const left = event.currentTarget.scrollLeft;
            const next = { x: left > 0, y: top > 12 };
            setEdge((prev) => (prev.x === next.x && prev.y === next.y ? prev : next));
            if (teach && top > 12 && kind !== "sticky") look("sticky");
          }}
        >
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-[13px]">
            <thead>
              <tr className="text-left text-fg-muted">
                <th
                  className="sticky top-0 left-0 z-30 border-b border-border bg-surface-2 px-3 py-2.5"
                  style={{ width: SELECT_W, minWidth: SELECT_W }}
                >
                  <input
                    ref={headRef}
                    type="checkbox"
                    className="size-3.5 accent-accent"
                    checked={mark === "all" && visible.length > 0}
                    aria-label={locale === "en" ? "Select visible rows" : "全选当前筛出的行"}
                    onChange={() => {
                      look("bulk");
                      dispatch({ type: "toggleAllVisible" });
                    }}
                  />
                </th>
                {fields.map((key) => {
                  const facet = facetOfColumn(key);
                  return (
                  <th
                    key={key}
                    className={cn(
                      "sticky top-0 border-b border-border bg-surface-2 px-3 py-2.5 font-medium whitespace-nowrap",
                      key === "name" ? "z-30" : "z-20",
                      key === "amount" && "text-right",
                      edge.x && key === "name" && "shadow-[4px_0_8px_-6px_rgb(23_24_28/0.35)]",
                    )}
                    style={key === "name" ? { left: SELECT_W } : undefined}
                    aria-sort={
                      key === "amount"
                        ? state.sort === "asc"
                          ? "ascending"
                          : state.sort === "desc"
                            ? "descending"
                            : "none"
                        : undefined
                    }
                  >
                    {key === "amount" ? (
                      <button
                        type="button"
                        className={cn(
                          "ml-auto inline-flex items-center gap-1 hover:text-fg",
                          spot(kind === "sort"),
                        )}
                        onClick={() => {
                          look("sort");
                          dispatch({ type: "cycleSort" });
                        }}
                      >
                        {columnLabel(key, locale)}
                        {state.sort === "desc" ? (
                          <ArrowDown className="size-3.5 text-accent" />
                        ) : state.sort === "asc" ? (
                          <ArrowUp className="size-3.5 text-accent" />
                        ) : null}
                      </button>
                    ) : facet ? (
                      <FacetHeader
                        label={columnLabel(key, locale)}
                        facet={facet}
                        active={state.facets[facet].length > 0}
                        open={state.panel.type === "facet" && state.panel.facet === facet}
                        spotlight={teach && kind === "filter" && facet === "tags"}
                        bindAnchor={bindAnchor}
                        onOpen={() => {
                          look("filter");
                          dispatch({ type: "openFacet", facet });
                        }}
                      />
                    ) : (
                      columnLabel(key, locale)
                    )}
                  </th>
                  );
                })}
                <th className="sticky top-0 z-20 border-b border-border bg-surface-2 px-3 py-2.5 text-right font-medium whitespace-nowrap">
                  {locale === "en" ? "Actions" : "操作"}
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={fields.length + 2} className="px-4 py-16 text-center">
                    <p className="text-[13px] text-fg-muted">
                      {miss === "first-use"
                        ? locale === "en"
                          ? "No customers yet."
                          : "还没有客户。"
                        : miss === "query"
                          ? locale === "en"
                            ? "No name matches. Change the search."
                            : "没有这个名称。改搜索里的字。"
                          : locale === "en"
                            ? "No row matches. Take a condition off."
                            : "没有符合条件的客户。摘掉一个条件。"}
                    </p>
                  </td>
                </tr>
              ) : (
                visible.map((row) => {
                  const selected = state.selected.includes(row.id);
                  const cell = cn(
                    "border-b border-border px-3 py-3 whitespace-nowrap",
                    selected ? "bg-accent-soft" : "bg-surface group-hover:bg-surface-2",
                  );
                  return (
                    <tr key={row.id} data-row={row.id} className="group">
                      <td
                        className={cn(cell, "sticky left-0 z-10 px-3")}
                        style={{ width: SELECT_W, minWidth: SELECT_W }}
                      >
                        <input
                          type="checkbox"
                          className="size-3.5 accent-accent"
                          checked={selected}
                          aria-label={locale === "en" ? `Select ${row.name}` : `选择 ${row.name}`}
                          onChange={() => {
                            look("bulk");
                            dispatch({ type: "toggleRow", id: row.id });
                          }}
                        />
                      </td>
                      {fields.map((key) => (
                        <td
                          key={key}
                          className={cn(
                            cell,
                            key === "name" && "sticky z-10 font-medium",
                            key === "amount" && "text-right tabular-nums",
                            edge.x && key === "name" && "shadow-[4px_0_8px_-6px_rgb(23_24_28/0.28)]",
                          )}
                          style={key === "name" ? { left: SELECT_W } : undefined}
                        >
                          <Cell
                            column={key}
                            row={row}
                            locale={locale}
                            onOpen={() => {
                              look("actions");
                              dispatch({ type: "openDialog", mode: "view", id: row.id });
                            }}
                          />
                        </td>
                      ))}
                      <td className={cn(cell, "text-right")}>
                        <div className={cn("inline-flex items-center justify-end gap-1", spot(kind === "actions"))}>
                          <button
                            type="button"
                            className="text-[13px] text-accent hover:underline"
                            onClick={() => {
                              look("actions");
                              dispatch({ type: "openDialog", mode: "view", id: row.id });
                            }}
                          >
                            {locale === "en" ? "View" : "查看"}
                          </button>
                          <button
                            type="button"
                            ref={state.panel.type === "row" && state.panel.id === row.id ? bindAnchor : undefined}
                            aria-label={locale === "en" ? `More actions for ${row.name}` : `${row.name}的更多操作`}
                            aria-expanded={state.panel.type === "row" && state.panel.id === row.id}
                            className="grid size-8 place-items-center rounded-lg text-fg-muted hover:bg-surface-2 hover:text-fg"
                            onClick={() => {
                              look("actions");
                              dispatch({ type: "openRow", id: row.id });
                            }}
                          >
                            <MoreHorizontal className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5">
          <p className="text-[12px] text-fg-muted">
            {locale === "en" ? "Showing" : "当前"}{" "}
            <span className="tabular-nums text-fg">{visible.length}</span>
            {visible.length !== state.rows.length ? (
              <span>
                {" "}
                / {locale === "en" ? "all" : "全部"}{" "}
                <span className="tabular-nums">{state.rows.length}</span>
              </span>
            ) : null}
          </p>
          {teach ? (
            <button
              type="button"
              className="text-[12px] text-fg-subtle hover:text-accent"
              onClick={() => {
                dispatch({ type: "reset" });
                scrollerRef.current?.scrollTo({ top: 0, left: 0 });
              }}
            >
              {locale === "en" ? "Restore example" : "重置示例"}
            </button>
          ) : null}
        </div>
      </div>

      <Anchor
        open={state.panel.type !== "none"}
        anchorRef={anchorRef}
        root={rootEl}
        align={state.panel.type === "columns" || state.panel.type === "row" ? "end" : "start"}
        layoutKey={`${panelKey}:${state.draft.join(",")}:${facetQuery}`}
        onClose={() => dispatch({ type: "closePanel" })}
      >
        {state.panel.type === "facet" ? (
          <FacetPanel
            facet={state.panel.facet}
            draft={state.draft}
            search={facetQuery}
            locale={locale}
            onSearch={setFacetQuery}
            onToggle={(value) => dispatch({ type: "toggleDraft", value })}
            onReset={() => dispatch({ type: "resetDraft" })}
            onApply={() => {
              look("chips");
              dispatch({ type: "applyDraft" });
            }}
          />
        ) : null}
        {state.panel.type === "columns" ? (
          <ColumnPanel
            visibility={state.visibility}
            locale={locale}
            onToggle={(key) => {
              look("columns");
              dispatch({ type: "toggleColumn", key });
            }}
          />
        ) : null}
        {state.panel.type === "row" ? (
          <RowMenu
            locale={locale}
            onEdit={() => dispatch({ type: "openDialog", mode: "edit", id: state.panel.type === "row" ? state.panel.id : null })}
            onDuplicate={() => {
              if (state.panel.type !== "row") return;
              dispatch({
                type: "duplicate",
                id: state.panel.id,
                nextId: crypto.randomUUID(),
                updatedAt: todayStamp(),
              });
              scrollerRef.current?.scrollTo({ top: 0 });
            }}
            onDelete={() => {
              if (state.panel.type !== "row") return;
              dispatch({ type: "openDialog", mode: "delete", id: state.panel.id });
            }}
          />
        ) : null}
        {state.panel.type === "bulk" ? (
          <BulkMenu
            locale={locale}
            which={state.panel.which}
            onStatus={(status) =>
              dispatch({ type: "bulkStatus", status, updatedAt: todayStamp() })
            }
            onOwner={(owner) => dispatch({ type: "bulkOwner", owner, updatedAt: todayStamp() })}
          />
        ) : null}
      </Anchor>

      {state.dialog ? (
        <RecordDialog
          key={`${state.dialog.mode}:${state.dialog.id ?? "new"}`}
          dialog={state.dialog}
          customer={dialogCustomer}
          locale={locale}
          onClose={() => dispatch({ type: "closeDialog" })}
          onEdit={() => dispatch({ type: "openDialog", mode: "edit", id: state.dialog?.id ?? null })}
          onSave={(customer) => dispatch({ type: "save", customer })}
          onDelete={() => {
            if (state.dialog?.id) dispatch({ type: "remove", id: state.dialog.id });
          }}
        />
      ) : null}
    </div>
  );
}

function FacetHeader({
  label,
  facet,
  active,
  open,
  spotlight,
  bindAnchor,
  onOpen,
}: {
  label: string;
  facet: FacetKey;
  active: boolean;
  open: boolean;
  spotlight: boolean;
  bindAnchor: (node: HTMLElement | null) => void;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      ref={open ? bindAnchor : undefined}
      aria-expanded={open}
      aria-haspopup="dialog"
      data-facet={facet}
      className={cn(
        "inline-flex items-center gap-1 hover:text-fg",
        active && "text-accent",
        spotlight && "rounded-md ring-2 ring-accent/50 ring-offset-2 ring-offset-surface-2",
      )}
      onClick={onOpen}
    >
      {label}
      <Filter className={cn("size-3.5", active ? "text-accent" : "text-fg-subtle")} />
    </button>
  );
}

function Cell({
  column,
  row,
  locale,
  onOpen,
}: {
  column: ColumnKey;
  row: Customer;
  locale: ReturnType<typeof useLocale>;
  onOpen: () => void;
}) {
  if (column === "name") {
    return (
      <button type="button" className="font-medium hover:text-accent" onClick={onOpen}>
        {row.name}
      </button>
    );
  }
  if (column === "tags") {
    return (
      <span className="inline-flex gap-1">
        {row.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} locale={locale} />
        ))}
      </span>
    );
  }
  if (column === "amount") return formatAmount(row.amount);
  if (column === "owner") return row.owner;
  if (column === "status") {
    return (
      <span className={row.status === "待跟进" ? "text-accent" : "text-fg-muted"}>
        {statusText(row.status, locale)}
      </span>
    );
  }
  return <span className="text-fg-muted tabular-nums">{row.updatedAt}</span>;
}

