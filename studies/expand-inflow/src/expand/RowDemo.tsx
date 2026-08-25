import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";
import { toggleSet } from "../lib/machines";
import { loc, pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { DemoShell, HeightSlot, RestOfPage } from "./Frame";

const ORDERS = [
  {
    id: "1042",
    who: loc("林可", "Lin Ke"),
    amount: "¥1,280",
    status: loc("已发货", "Shipped"),
    detail: loc(
      "快递中通 · 7321 8840。收件：杭州市西湖区文二路 391 号。内含键盘套装 ×1。详情插在这一行和下一行之间，后面的行会被撑下去。",
      "ZTO · 7321 8840. Ship to 391 Wen’er Rd, Hangzhou. Keyboard kit ×1. Detail sits between this row and the next, so later rows move down.",
    ),
  },
  {
    id: "1041",
    who: loc("周南", "Zhou Nan"),
    amount: "¥640",
    status: loc("待支付", "Unpaid"),
    detail: loc(
      "应付 ¥640，今天 18:00 前有效。不要做成浮在表上的层，否则对照不了下一单。",
      "¥640 due before 18:00 today. Do not float this over the table — you would lose the next order.",
    ),
  },
  {
    id: "1040",
    who: loc("陈川", "Chen Chuan"),
    amount: "¥3,200",
    status: loc("已完成", "Done"),
    detail: loc(
      "已签收。发票已发到邮箱。这一行开着的时候，下面的行必须还在，而且位置更低。",
      "Delivered. Invoice emailed. While this row is open, later rows stay visible — just lower.",
    ),
  },
  {
    id: "1039",
    who: loc("苏晚", "Su Wan"),
    amount: "¥890",
    status: loc("处理中", "Working"),
    detail: loc(
      "仓库分拣中，预计明天发出。行详情跟这一行走，不是侧滑抽屉。",
      "Picking in the warehouse, ships tomorrow. Row detail follows this row; it is not a drawer.",
    ),
  },
] as const;

function initialOpen(state?: string, firstId?: string): Set<string> {
  if (state === "open" && firstId) return new Set([firstId]);
  return new Set();
}

export function RowDemo({
  state,
  compact = false,
}: {
  state?: string;
  compact?: boolean;
} = {}) {
  const locale = useLocale();
  const rows = compact ? ORDERS.slice(0, 3) : ORDERS;
  const locked = state === "open" || state === "closed";
  const [open, setOpen] = useState<Set<string>>(() => initialOpen(state, rows[0]?.id));
  const current = locked ? initialOpen(state, rows[0]?.id) : open;

  function toggle(id: string) {
    if (locked) return;
    setOpen(toggleSet(open, id));
  }

  return (
    <DemoShell
      compact={compact}
      title={locale === "en" ? "Orbit · orders" : "Orbit · 订单"}
      brand={locale === "en" ? "Orders" : "订单"}
    >
      <div className="px-4 pt-4 pb-2 sm:px-5">
        <h3 className="text-[15px] font-medium">{locale === "en" ? "Recent orders" : "最近订单"}</h3>
        <p className="text-[12px] text-fg-subtle">
          {locale === "en"
            ? "Click a row. Detail inserts before the next row."
            : "点一行。详情插在这一行和下一行之间。"}
        </p>
      </div>
      <table className="w-full min-w-0 border-collapse text-left">
        <thead>
          <tr className="border-y border-border text-[11px] text-fg-subtle">
            <th className="px-4 py-2 font-medium sm:px-5">{locale === "en" ? "Order" : "订单"}</th>
            <th className="px-2 py-2 font-medium">{locale === "en" ? "Customer" : "客户"}</th>
            <th className="hidden px-2 py-2 font-medium sm:table-cell">{locale === "en" ? "Amount" : "金额"}</th>
            <th className="px-4 py-2 font-medium sm:px-5">{locale === "en" ? "Status" : "状态"}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const on = current.has(row.id);
            return (
              <Fragment key={row.id}>
                <tr
                  className={cn(
                    "cursor-pointer border-b border-border text-[13px]",
                    on && "bg-accent-soft",
                  )}
                  onClick={() => toggle(row.id)}
                >
                  <td className="px-4 py-0 sm:px-5">
                    <button
                      type="button"
                      aria-expanded={on}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggle(row.id);
                      }}
                      className="flex h-11 w-full items-center font-mono tabular-nums"
                    >
                      ORD-{row.id}
                    </button>
                  </td>
                  <td className="truncate px-2 py-2.5">{pick(row.who, locale)}</td>
                  <td className="hidden px-2 py-2.5 tabular-nums sm:table-cell">{row.amount}</td>
                  <td className="px-4 py-2.5 sm:px-5">
                    <span className="inline-flex w-full items-center justify-end gap-1 text-[12px] text-fg-muted">
                      {pick(row.status, locale)}
                      <ChevronDown
                        className={cn(
                          "size-3.5 text-fg-subtle transition-transform duration-200",
                          on && "rotate-180",
                        )}
                        strokeWidth={1.8}
                      />
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-0" colSpan={4}>
                    <HeightSlot open={on}>
                      <div className="border-b border-border bg-accent-soft/70 px-4 py-3 text-[13px] leading-relaxed text-fg-muted sm:px-5">
                        {pick(row.detail, locale)}
                      </div>
                    </HeightSlot>
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
      <RestOfPage locale={locale} />
    </DemoShell>
  );
}
