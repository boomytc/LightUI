import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { toggleSet } from "../lib/machines";
import { loc, pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { DemoShell, HeightSlot, RestOfPage } from "./Frame";

const BLOCKS = [
  {
    id: "ship",
    title: loc("配送", "Shipping"),
    body: loc(
      "国内订单两个工作日内发出，偏远地区再加一天。满 99 包邮。签收时请当场验货。",
      "Domestic orders leave within two working days, plus one for remote areas. Free over ¥99. Check the parcel on delivery.",
    ),
  },
  {
    id: "return",
    title: loc("退换", "Returns"),
    body: loc(
      "七日内未拆封可退，运费自理。质量问题我们承担往返。退款原路返回。",
      "Unopened within seven days can be returned; you cover postage. We cover both ways for defects. Refunds go back the original way.",
    ),
  },
  {
    id: "warranty",
    title: loc("保修", "Warranty"),
    body: loc(
      "主机一年保修，配件三个月。人为损坏不在保。保修请带订单号联系客服。",
      "One year on the unit, three months on parts. Accidental damage is not covered. Keep the order number when you write in.",
    ),
  },
] as const;

function initialOpen(state?: string): Set<string> {
  if (state === "closed") return new Set();
  if (state === "open") return new Set(BLOCKS.map((b) => b.id));
  return new Set(["ship"]);
}

export function CollapseDemo({
  state,
  compact = false,
}: {
  state?: string;
  compact?: boolean;
} = {}) {
  const locale = useLocale();
  const locked = state === "open" || state === "closed";
  const [open, setOpen] = useState<Set<string>>(() => initialOpen(state));
  const current = locked ? initialOpen(state) : open;

  return (
    <DemoShell
      compact={compact}
      title={locale === "en" ? "Orbit · policy" : "Orbit · 说明"}
      brand={locale === "en" ? "Policy" : "说明"}
      action={
        <p className="font-mono text-[11px] tabular-nums text-fg-subtle">
          OPEN {current.size}/{BLOCKS.length}
        </p>
      }
    >
      <div className="px-4 pt-4 pb-2 sm:px-5">
        <h3 className="text-[15px] font-medium">{locale === "en" ? "After you buy" : "买完之后"}</h3>
        <p className="text-[12px] text-fg-subtle">
          {locale === "en" ? "Opening one does not close another." : "开一块不必关另一块。"}
        </p>
      </div>
      <div className="flex flex-col gap-2 px-4 pb-4 sm:px-5">
        {BLOCKS.map((block) => {
          const on = current.has(block.id);
          return (
            <div key={block.id} className="overflow-hidden rounded-xl border border-border bg-surface-2">
              <button
                type="button"
                aria-expanded={on}
                onClick={() => {
                  if (locked) return;
                  setOpen(toggleSet(open, block.id));
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
              >
                <span className="min-w-0 flex-1 text-[14px] font-medium">{pick(block.title, locale)}</span>
                <ChevronDown
                  className={cn("size-4 shrink-0 text-fg-subtle transition-transform duration-200", on && "rotate-180")}
                  strokeWidth={1.8}
                />
              </button>
              <HeightSlot open={on}>
                <p className="px-3 pb-3 text-[13px] leading-relaxed text-fg-muted">{pick(block.body, locale)}</p>
              </HeightSlot>
            </div>
          );
        })}
      </div>
      <RestOfPage locale={locale} />
    </DemoShell>
  );
}
