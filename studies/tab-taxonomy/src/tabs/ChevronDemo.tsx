import { useState } from "react";
import { CART_ITEMS, CHEVRON_TABS } from "../lib/fixtures";
import "../tabs.css";
import { stepKind } from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Window } from "./Frame";

export function ChevronDemo({
  defaultTab,
  fill = false,
}: { defaultTab?: string; fill?: boolean } = {}) {
  const locale = useLocale();
  const allowed = new Set(CHEVRON_TABS.map((t) => t.id));
  const initial = defaultTab && allowed.has(defaultTab) ? defaultTab : "cart";
  const [tab, setTab] = useState(initial);
  const current = Math.max(0, CHEVRON_TABS.findIndex((t) => t.id === tab));

  return (
    <Window
      title={locale === "en" ? "North Shop · checkout" : "North Shop · 结算"}
      fill={fill}
      action={
        <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-fg-muted">
          {locale === "en" ? "Save and exit" : "保存并退出"}
        </span>
      }
    >
      <div className={fill ? "flex h-full min-h-0 flex-1 flex-col" : undefined}>
        <h3 className={cn("text-[1.15rem] font-semibold tracking-tight", fill ? "shrink-0 px-5 pt-4" : undefined)}>
          {heading(tab, locale)}
        </h3>

        <div
          role="tablist"
          aria-label={locale === "en" ? "Checkout steps" : "结算步骤"}
          className={cn("tab-chevron flex", fill ? "mt-4 shrink-0" : "mt-4")}
        >
          {CHEVRON_TABS.map((item, index) => {
            const kind = stepKind(index, current);
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={kind === "current"}
                onClick={() => setTab(item.id)}
                style={{ zIndex: index + 1 }}
                className={cn(
                  "tab-chevron-item min-h-10 flex-1 px-2 text-[11px] font-medium tracking-tight whitespace-nowrap sm:px-4 sm:text-[12px]",
                  kind === "current" && "bg-fg text-surface",
                  kind === "done" && "bg-fg/70 text-surface",
                  kind === "todo" && "bg-surface-2 text-fg-muted",
                )}
              >
                {pick(item.label, locale)}
              </button>
            );
          })}
        </div>

        <div
          className={cn(
            "tab-swap grid gap-5 lg:grid-cols-[1fr_180px]",
            fill ? "min-h-0 flex-1 content-start overflow-auto px-5 py-5" : "mt-5",
          )}
          key={tab}
        >
          <div>
            {tab === "cart" ? <Cart locale={locale} /> : null}
            {tab === "ship" ? <Ship locale={locale} /> : null}
            {tab === "pay" ? <Pay locale={locale} /> : null}
            {tab === "done" ? <Done locale={locale} /> : null}
          </div>
          <aside className="h-fit rounded-xl border border-border bg-surface-2 p-3">
            <p className="text-[12px] font-medium">{locale === "en" ? "Summary" : "订单摘要"}</p>
            <ul className="mt-2 space-y-1.5 text-[12px] text-fg-muted">
              {CART_ITEMS.map((item) => (
                <li key={item.name.zh} className="flex justify-between gap-2">
                  <span className="truncate">{pick(item.name, locale)}</span>
                  <span className="tabular-nums">¥{item.price}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex justify-between text-[13px] font-semibold">
              <span>{locale === "en" ? "Due" : "应付总额"}</span>
              <span>¥699.00</span>
            </p>
            <button
              type="button"
              className="mt-3 w-full rounded-lg bg-fg py-2 text-[12px] font-medium text-surface"
            >
              {locale === "en" ? "Pay ¥699.00" : "确认支付 ¥699.00"}
            </button>
          </aside>
        </div>
      </div>
    </Window>
  );
}

function heading(tab: string, locale: "zh" | "en") {
  if (tab === "ship") return locale === "en" ? "Shipping" : "填写配送信息";
  if (tab === "pay") return locale === "en" ? "Payment" : "选择支付方式";
  if (tab === "done") return locale === "en" ? "Placed" : "下单完成";
  return locale === "en" ? "Review cart" : "核对购物车";
}

function Cart({ locale }: { locale: "zh" | "en" }) {
  return (
    <ul className="space-y-2">
      {CART_ITEMS.map((item) => (
        <li key={item.name.zh} className="rounded-xl border border-border px-3 py-3">
          <p className="text-[13px] font-medium">{pick(item.name, locale)}</p>
          <p className="mt-0.5 text-[12px] text-fg-subtle">{pick(item.meta, locale)}</p>
        </li>
      ))}
    </ul>
  );
}

function Ship({ locale }: { locale: "zh" | "en" }) {
  return (
    <div className="space-y-2 text-[13px]">
      <p className="rounded-xl border border-border px-3 py-3">
        {locale === "en" ? "North Studio Co., Ltd. · 12 West Bund" : "North Studio Co., Ltd. · 西岸 12 号"}
      </p>
      <p className="rounded-xl border border-border px-3 py-3 text-fg-muted">
        {locale === "en" ? "Leave at reception · weekday 10–18" : "前台代收 · 工作日 10:00–18:00"}
      </p>
    </div>
  );
}

function Pay({ locale }: { locale: "zh" | "en" }) {
  return (
    <div className="space-y-2 text-[13px]">
      <p className="rounded-xl border border-fg bg-surface-2 px-3 py-3">
        {locale === "en" ? "Corporate card · 0826" : "企业信用卡 · 0826"}
        <span className="mt-0.5 block text-[12px] text-fg-subtle">
          {locale === "en" ? "North Studio · exp 08/29" : "North Studio Co., Ltd. · 有效期 08/29"}
        </span>
      </p>
      <p className="rounded-xl border border-border px-3 py-3 text-fg-muted">
        {locale === "en" ? "Alipay business · cap ¥20,000" : "支付宝企业账户 · 单笔限额 ¥20,000"}
      </p>
    </div>
  );
}

function Done({ locale }: { locale: "zh" | "en" }) {
  return (
    <p className="rounded-xl border border-border bg-surface-2 px-3 py-4 text-[13px] leading-relaxed text-fg-muted">
      {locale === "en"
        ? "Order placed. A receipt goes to finance@north.studio."
        : "订单已提交。回执会发到 finance@north.studio。"}
    </p>
  );
}
