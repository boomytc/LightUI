import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { toggleAccordion } from "../lib/machines";
import { loc, pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { DemoShell, HeightSlot, RestOfPage } from "./Frame";

const FAQS = [
  {
    id: "a",
    q: loc("如何修改登录密码？", "How do I change my password?"),
    a: loc(
      "打开账号 → 安全。输入当前密码，再设一次新密码。改完后已登录的其他设备会退出。这一块开着的时候，下面的问答和后文都会被撑下去——不是盖在它们上面。",
      "Open Account → Security. Enter the current password, then a new one. Other sessions sign out. While this panel is open, the questions below and the rest of the page are pushed down — not covered.",
    ),
  },
  {
    id: "b",
    q: loc("发票怎么开？", "How do I get an invoice?"),
    a: loc(
      "订单详情里点「申请发票」，填抬头和税号。电子发票当天发到邮箱。开这一块会把上一块收起来：互斥。两块高度同时走 0fr / 1fr，不要猜 max-height。",
      "In the order, tap Request invoice and fill in the title and tax ID. The PDF lands in email the same day. Opening this panel closes the previous one: exclusive. Both heights move on 0fr / 1fr; do not guess max-height.",
    ),
  },
  {
    id: "c",
    q: loc("订单可以退款吗？", "Can I get a refund?"),
    a: loc(
      "发货前可直接取消。签收后七日内可退，运费自理。退款原路返回，大约三到五个工作日。手风琴一次只打开一块，好扫、好对照。",
      "Cancel before it ships. After delivery, seven days to return; you cover postage. Refunds take three to five working days. An accordion keeps one panel open so the list stays scannable.",
    ),
  },
] as const;

export function AccordionDemo({
  state,
  compact = false,
}: {
  state?: string;
  compact?: boolean;
} = {}) {
  const locale = useLocale();
  const locked = state === "a" || state === "b" ? state : null;
  const [openId, setOpenId] = useState<string | null>(locked ?? "a");
  const current = locked ?? openId;
  const items = compact ? FAQS.slice(0, 2) : FAQS;

  return (
    <DemoShell
      compact={compact}
      title={locale === "en" ? "Orbit · help" : "Orbit · 帮助"}
      brand={locale === "en" ? "Help" : "帮助"}
    >
      <div className="px-4 pt-4 pb-2 sm:px-5">
        <h3 className="text-[15px] font-medium">{locale === "en" ? "Common questions" : "常见问题"}</h3>
        <p className="text-[12px] text-fg-subtle">
          {locale === "en" ? "Opening B closes A. Both heights move together." : "开 B 关 A。两块高度一起走。"}
        </p>
      </div>
      <div className="px-2 pb-2 sm:px-3">
        {items.map((item) => {
          const open = current === item.id;
          return (
            <div key={item.id} className="border-b border-border last:border-b-0">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => {
                  if (locked) return;
                  setOpenId(toggleAccordion(openId, item.id));
                }}
                className="flex w-full items-center gap-3 px-2 py-3 text-left sm:px-2.5"
              >
                <span className="min-w-0 flex-1 text-[14px] font-medium">{pick(item.q, locale)}</span>
                <ChevronDown
                  className={cn("size-4 shrink-0 text-fg-subtle transition-transform duration-200", open && "rotate-180")}
                  strokeWidth={1.8}
                />
              </button>
              <HeightSlot open={open}>
                <p className="px-2 pb-3.5 text-[13px] leading-relaxed text-fg-muted sm:px-2.5">
                  {pick(item.a, locale)}
                </p>
              </HeightSlot>
            </div>
          );
        })}
      </div>
      <RestOfPage locale={locale} />
    </DemoShell>
  );
}
