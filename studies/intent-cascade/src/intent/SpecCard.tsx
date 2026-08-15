import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { Locale } from "../lib/site-locale";

export function specText(locale: Locale, restDelay: number): string {
  return locale === "en"
    ? `Add cascade-menu intent. A diagonal into the submenu must not steal it. The previous pointer sample and the submenu’s leading-edge corners form a safe triangle: if the point is inside, or slope to the top falls and slope to the bottom rises, keep the current submenu. Vertical moves on the first column switch immediately. Dwelling on another item past about ${restDelay}ms still switches. Do not use a flat hover delay. The test vertex is the previous sample, not the live pointer.`
    : `做多级菜单的意图预测。从一级斜着滑向二级时，途经的项不要抢走子菜单。用上一帧指针和子菜单左缘上下两点构成安全三角：点在三角内，或对顶角斜率下降、对底角斜率上升，就保持当前子菜单。沿一级纵向移动立刻切换。停在其它项上超过约 ${restDelay}ms 再切换。不要给所有 hover 加一段固定 delay。判定时第三个顶点必须是上一帧，不能是当前指针。`;
}

export function SpecCard({ locale, restDelay }: { locale: Locale; restDelay: number }) {
  const [copied, setCopied] = useState(false);
  const text = specText(locale, restDelay);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <aside className="w-full rounded-2xl border border-fg bg-fg px-4 py-3.5 text-surface xl:w-80 2xl:w-96">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium tracking-wide text-surface/45">
          {locale === "en" ? "Say it this way" : "说清楚"}
        </p>
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-surface/45 transition-colors hover:text-surface"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? (locale === "en" ? "Copied" : "已复制") : locale === "en" ? "Copy" : "复制"}
        </button>
      </div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-surface/90">{text}</p>
    </aside>
  );
}
