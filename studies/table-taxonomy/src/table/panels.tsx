import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  chipLabel,
  columnLabel,
  facetLabel,
  facetValueLabel,
  ownerLabel,
  statusLabel,
  tagLabel,
} from "../lib/kinds";
import {
  COLUMN_KEYS,
  OWNERS,
  STATUSES,
  TAGS,
  canSaveCustomer,
  columnOn,
  filterOptions,
  formatAmount,
  parseAmount,
  todayStamp,
  type ColumnKey,
  type Customer,
  type DialogState,
  type FacetKey,
  type Owner,
  type Status,
  type Tag,
  type Visibility,
} from "../lib/machines";
import type { Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";

export function Anchor({
  open,
  anchorRef,
  root,
  align,
  layoutKey,
  onClose,
  children,
}: {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  root: HTMLElement | null;
  align: "start" | "end";
  layoutKey: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const trigger = anchorRef.current;
      const panel = panelRef.current;
      if (!root || !trigger || !panel) return;
      const rootBox = root.getBoundingClientRect();
      const rect = trigger.getBoundingClientRect();
      const width = panel.offsetWidth;
      const height = panel.offsetHeight;
      let left = (align === "end" ? rect.right - width : rect.left) - rootBox.left;
      left = Math.max(8, Math.min(left, rootBox.width - width - 8));
      let top = rect.bottom - rootBox.top + 6;
      const above = rect.top - rootBox.top - height - 6;
      if (top + height > rootBox.height - 8 && above > 8) top = above;
      setBox({ top, left });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, align, layoutKey, anchorRef, root]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, anchorRef, onClose]);

  if (!open || !root) return null;
  return createPortal(
    <div
      ref={panelRef}
      data-stage="popover"
      style={{
        position: "absolute",
        top: box?.top ?? 0,
        left: box?.left ?? 0,
        visibility: box ? "visible" : "hidden",
      }}
      className="z-40"
    >
      {children}
    </div>,
    root,
  );
}

export function FacetPanel({
  facet,
  draft,
  search,
  locale,
  onSearch,
  onToggle,
  onReset,
  onApply,
}: {
  facet: FacetKey;
  draft: string[];
  search: string;
  locale: Locale;
  onSearch: (value: string) => void;
  onToggle: (value: string) => void;
  onReset: () => void;
  onApply: () => void;
}) {
  const options = facet === "tags" ? TAGS : facet === "owners" ? OWNERS : STATUSES;
  const shown = filterOptions(options, facet === "tags" ? search : "", (value) =>
    facetValueLabel(facet, value, locale),
  );
  return (
    <div className="w-64 rounded-xl border border-border bg-surface p-3 shadow-menu">
      <p className="text-[13px] font-medium text-fg">
        {locale === "en" ? `Filter ${facetLabel(facet, locale).toLowerCase()}` : `筛选${facetLabel(facet, locale)}`}
      </p>
      <p className="mt-0.5 text-[11px] text-fg-subtle">
        {locale === "en" ? "Matches any checked value" : "匹配任意一个"}
      </p>
      {facet === "tags" ? (
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={locale === "en" ? "Search tags" : "搜索标签"}
          className="mt-2 h-8 w-full rounded-lg border border-border bg-surface px-2 text-[12px] outline-none placeholder:text-fg-subtle focus:border-border-strong"
        />
      ) : null}
      <div className="mt-2 flex max-h-52 flex-col gap-0.5 overflow-auto">
        {shown.length === 0 ? (
          <p className="px-1 py-2 text-[12px] text-fg-muted">
            {locale === "en" ? "No matching tag" : "没有匹配的标签"}
          </p>
        ) : (
          shown.map((value) => (
            <label key={value} className="flex min-h-9 items-center gap-2 rounded-md px-1 text-[13px] hover:bg-surface-2">
              <input
                type="checkbox"
                className="size-3.5 accent-accent"
                checked={draft.includes(value)}
                onChange={() => onToggle(value)}
              />
              <span>{facetValueLabel(facet, value, locale)}</span>
            </label>
          ))
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2">
        <button type="button" onClick={onReset} className="text-[12px] text-fg-muted hover:text-fg">
          {locale === "en" ? "Reset" : "重置"}
        </button>
        <button
          type="button"
          onClick={onApply}
          className="inline-flex h-8 items-center rounded-lg bg-fg px-3 text-[12px] font-medium text-surface"
        >
          {locale === "en" ? "Apply" : "应用"}
        </button>
      </div>
    </div>
  );
}

export function ColumnPanel({
  visibility,
  locale,
  onToggle,
}: {
  visibility: Visibility;
  locale: Locale;
  onToggle: (key: ColumnKey) => void;
}) {
  return (
    <div className="w-56 rounded-xl border border-border bg-surface p-3 shadow-menu">
      <p className="text-[13px] font-medium">{locale === "en" ? "Fields" : "显示字段"}</p>
      <div className="mt-2 flex flex-col">
        {COLUMN_KEYS.map((key) => {
          const required = key === "name";
          return (
            <label key={key} className="flex min-h-9 items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                className="size-3.5 accent-accent"
                checked={columnOn(visibility, key)}
                disabled={required}
                onChange={() => onToggle(key)}
              />
              <span>{columnLabel(key, locale)}</span>
              {required ? (
                <span className="text-[11px] text-fg-subtle">{locale === "en" ? "Required" : "必选"}</span>
              ) : null}
            </label>
          );
        })}
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-fg-subtle">
        {locale === "en" ? "The checkbox and the actions stay. They are not fields." : "选择框和操作一直在，它们不是字段。"}
      </p>
    </div>
  );
}

export function RowMenu({
  locale,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  locale: Locale;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const item = "flex h-9 w-full items-center rounded-md px-2 text-left text-[13px] hover:bg-surface-2";
  return (
    <div className="w-40 rounded-xl border border-border bg-surface p-1 shadow-menu">
      <button type="button" className={item} onClick={onEdit}>
        {locale === "en" ? "Edit" : "编辑"}
      </button>
      <button type="button" className={item} onClick={onDuplicate}>
        {locale === "en" ? "Duplicate" : "复制"}
      </button>
      <div className="my-1 border-t border-border" />
      <button type="button" className={cn(item, "text-wrong")} onClick={onDelete}>
        {locale === "en" ? "Delete" : "删除"}
      </button>
    </div>
  );
}

export function BulkMenu({
  locale,
  which,
  onStatus,
  onOwner,
}: {
  locale: Locale;
  which: "status" | "owner";
  onStatus: (status: Status) => void;
  onOwner: (owner: Owner) => void;
}) {
  const item = "flex h-9 w-full items-center rounded-md px-2 text-left text-[13px] hover:bg-surface-2";
  return (
    <div className="w-40 rounded-xl border border-border bg-surface p-1 shadow-menu">
      {which === "status"
        ? STATUSES.map((status) => (
            <button key={status} type="button" className={item} onClick={() => onStatus(status)}>
              {statusLabel(status, locale)}
            </button>
          ))
        : OWNERS.map((owner) => (
            <button key={owner} type="button" className={item} onClick={() => onOwner(owner)}>
              {ownerLabel(owner)}
            </button>
          ))}
    </div>
  );
}

export function Chip({
  facet,
  value,
  locale,
  onRemove,
}: {
  facet: FacetKey;
  value: string;
  locale: Locale;
  onRemove: () => void;
}) {
  const label = chipLabel(facet, value, locale);
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[12px] text-accent">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 hover:bg-accent/15"
        aria-label={locale === "en" ? `Remove ${label}` : `移除 ${label}`}
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

export function RecordDialog({
  dialog,
  customer,
  locale,
  onClose,
  onEdit,
  onSave,
  onDelete,
}: {
  dialog: NonNullable<DialogState>;
  customer: Customer | null;
  locale: Locale;
  onClose: () => void;
  onEdit: () => void;
  onSave: (customer: Customer) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(customer?.name ?? "");
  const [tags, setTags] = useState<Tag[]>(customer?.tags ?? []);
  const [amount, setAmount] = useState(customer ? String(customer.amount) : "");
  const [owner, setOwner] = useState<Owner>(customer?.owner ?? "林悦");
  const [status, setStatus] = useState<Status>(customer?.status ?? "待跟进");
  const [note, setNote] = useState(customer?.note ?? "");
  const readOnly = dialog.mode === "view";
  const deleting = dialog.mode === "delete";
  const title =
    dialog.mode === "create"
      ? locale === "en"
        ? "New customer"
        : "新建客户"
      : dialog.mode === "edit"
        ? locale === "en"
          ? "Edit customer"
          : "编辑客户"
        : dialog.mode === "delete"
          ? locale === "en"
            ? "Delete this record"
            : "删除这条记录"
          : (customer?.name ?? "");

  function toggleTag(tag: Tag) {
    setTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  }

  function save() {
    const parsed = parseAmount(amount);
    if (!canSaveCustomer(name, amount) || parsed === null) return;
    onSave({
      id: dialog.mode === "edit" && customer ? customer.id : crypto.randomUUID(),
      name: name.trim(),
      tags,
      amount: parsed,
      owner,
      status,
      note: note.trim(),
      updatedAt: todayStamp(),
    });
  }

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-fg/30 p-4" onMouseDown={onClose}>
      <div
        data-stage="popover"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-menu"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h3 className="text-[16px] font-semibold tracking-tight">{title}</h3>
        {deleting ? (
          <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? `“${customer?.name ?? ""}” leaves this follow-up list.`
              : `「${customer?.name ?? ""}」会从这份跟进里消失。`}
          </p>
        ) : readOnly && customer ? (
          <dl className="mt-4 grid gap-3 text-[13px]">
            <Row label={locale === "en" ? "Tags" : "标签"}>
              <span className="flex flex-wrap gap-1">
                {customer.tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} locale={locale} />
                ))}
              </span>
            </Row>
            <Row label={locale === "en" ? "Amount" : "金额"}>
              <span className="tabular-nums">{formatAmount(customer.amount)}</span>
            </Row>
            <Row label={locale === "en" ? "Owner" : "负责人"}>{customer.owner}</Row>
            <Row label={locale === "en" ? "Status" : "跟进状态"}>{statusLabel(customer.status, locale)}</Row>
            <Row label={locale === "en" ? "Updated" : "更新"}>{customer.updatedAt}</Row>
            <Row label={locale === "en" ? "Note" : "备注"}>
              <span className="leading-relaxed text-fg-muted">
                {customer.note || (locale === "en" ? "No note" : "暂无备注")}
              </span>
            </Row>
          </dl>
        ) : (
          <form
            className="mt-4 grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <Field label={locale === "en" ? "Name" : "客户名称"}>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoFocus
                className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-[13px] outline-none focus:border-border-strong"
              />
            </Field>
            <Field label={locale === "en" ? "Tags" : "标签"}>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.map((tag) => {
                  const on = tags.includes(tag);
                  return (
                    <button key={tag} type="button" onClick={() => toggleTag(tag)}>
                      <TagBadge tag={tag} locale={locale} selected={on} />
                    </button>
                  );
                })}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={locale === "en" ? "Amount" : "金额 / 元"}>
                <input
                  inputMode="numeric"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  required
                  className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-[13px] outline-none focus:border-border-strong"
                />
              </Field>
              <Field label={locale === "en" ? "Owner" : "负责人"}>
                <select
                  value={owner}
                  onChange={(event) => setOwner(event.target.value as Owner)}
                  className="h-9 w-full rounded-lg border border-border bg-surface px-2 text-[13px]"
                >
                  {OWNERS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label={locale === "en" ? "Status" : "跟进状态"}>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as Status)}
                className="h-9 w-full rounded-lg border border-border bg-surface px-2 text-[13px]"
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {statusLabel(item, locale)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={locale === "en" ? "Note" : "备注"}>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-[13px] outline-none focus:border-border-strong"
              />
            </Field>
          </form>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 items-center rounded-lg px-3 text-[12px] text-fg-muted hover:bg-surface-2"
          >
            {locale === "en" ? "Cancel" : "取消"}
          </button>
          {readOnly ? (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-8 items-center rounded-lg bg-fg px-3 text-[12px] font-medium text-surface"
            >
              {locale === "en" ? "Edit" : "编辑"}
            </button>
          ) : deleting ? (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex h-8 items-center rounded-lg bg-wrong px-3 text-[12px] font-medium text-white"
            >
              {locale === "en" ? "Delete" : "删除"}
            </button>
          ) : (
            <button
              type="button"
              disabled={!canSaveCustomer(name, amount)}
              onClick={save}
              className="inline-flex h-8 items-center rounded-lg bg-fg px-3 text-[12px] font-medium text-surface disabled:opacity-40"
            >
              {locale === "en" ? "Save" : "保存"}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3">
      <dt className="text-fg-subtle">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-[12px] text-fg-muted">
      {label}
      {children}
    </label>
  );
}

export function TagBadge({ tag, locale, selected }: { tag: Tag; locale: Locale; selected?: boolean }) {
  const emphasized = selected === undefined ? tag === "重点客户" : selected;
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px]",
        emphasized ? "bg-accent-soft text-accent" : "bg-surface-2 text-fg-muted",
      )}
    >
      {tagLabel(tag, locale)}
    </span>
  );
}
