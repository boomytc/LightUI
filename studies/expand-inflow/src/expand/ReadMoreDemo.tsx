import { useLayoutEffect, useRef, useState } from "react";
import { collapsedPx, readMoreHeight } from "../lib/machines";
import { useLocale } from "../lib/site-locale";
import { DemoShell, RestOfPage } from "./Frame";

const LINE_HEIGHT = 24;

const COPY = {
  zh: "这块介绍先收成三行。点「展开全文」，高度从 line-height × 3 过渡到整段的 scrollHeight，按钮变成「收起」。这是这一块自己变高，不是列表末尾再接一页——加载更多是另一问。后面的段落会被撑下去，因为多出来的字在文档流里，没有盖一层。退换说明、保修范围、开票方式都写在这一段里，好让全文明显长过三行，过渡才看得见。",
  en: "This intro starts at three lines. 「展开全文」grows the height from line-height × 3 to the block’s scrollHeight, and the button becomes 「收起」. The block itself gets taller — it does not append a page at the list footer; that is another question. Later copy is pushed down because the extra words sit in flow, not on a cover. Returns, warranty, and invoicing live in this same paragraph so the full text is clearly taller than three lines.",
};

export function ReadMoreDemo({
  state,
  compact = false,
}: {
  state?: string;
  compact?: boolean;
} = {}) {
  const locale = useLocale();
  const locked = state === "open" || state === "closed";
  const [open, setOpen] = useState(state === "open");
  const current = locked ? state === "open" : open;
  const innerRef = useRef<HTMLDivElement>(null);
  const [scrollH, setScrollH] = useState(200);
  const collapsed = collapsedPx(LINE_HEIGHT);
  const height = readMoreHeight(current, collapsed, scrollH);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => setScrollH(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [locale]);

  return (
    <DemoShell
      compact={compact}
      title={locale === "en" ? "Orbit · product" : "Orbit · 商品"}
      brand={locale === "en" ? "Product" : "商品"}
    >
      <div className="px-4 pt-4 pb-2 sm:px-5">
        <h3 className="text-[15px] font-medium">
          {locale === "en" ? "Commute pack · notes" : "通勤包 · 说明"}
        </h3>
        <p className="text-[12px] text-fg-subtle">
          {locale === "en" ? "Three-line clamp, then this block grows." : "先收成三行，再让这一块变高。"}
        </p>
      </div>
      <div className="px-4 pb-4 sm:px-5">
        <div
          className="expand-readmore"
          data-open={current ? "" : undefined}
          style={{ height }}
        >
          <div
            ref={innerRef}
            className="text-[15px] text-fg-muted"
            style={{ lineHeight: `${LINE_HEIGHT}px` }}
          >
            {COPY[locale]}
          </div>
        </div>
        <button
          type="button"
          aria-expanded={current}
          onClick={() => {
            if (locked) return;
            setOpen((v) => !v);
          }}
          className="mt-3 text-[13px] font-medium text-accent"
        >
          {current
            ? locale === "en"
              ? "Show less"
              : "收起"
            : locale === "en"
              ? "Read more"
              : "展开全文"}
        </button>
      </div>
      <RestOfPage locale={locale} />
    </DemoShell>
  );
}
