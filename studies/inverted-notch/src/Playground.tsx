import { useState } from "react";
import { InvertedCard } from "./InvertedCard";
import { scoopSupports, shapeSupports, type Technique } from "./lib/geometry";
import { pick, useLocale } from "./lib/site-locale";
import { cn } from "./lib/utils";

const TECHNIQUES: { id: Technique; label: { zh: string; en: string } }[] = [
  { id: "shape", label: { zh: "shape() 挖孔", en: "shape() punch" } },
  { id: "path", label: { zh: "path() 回退", en: "path() fallback" } },
  { id: "scoop", label: { zh: "scoop 只凹一角", en: "scoop one corner" } },
];

export function Playground() {
  const locale = useLocale();
  const [technique, setTechnique] = useState<Technique>("shape");
  const [exploded, setExploded] = useState(false);
  const [locked, setLocked] = useState(true);
  const [chipOpen, setChipOpen] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
        {TECHNIQUES.map((item) => {
          const on = item.id === technique;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTechnique(item.id)}
              className={cn(
                "flex min-w-44 shrink-0 items-center rounded-xl border px-3 py-2.5 text-left text-[13px] font-medium transition-colors lg:min-w-0 lg:w-full",
                on
                  ? "border-border-strong bg-surface shadow-card"
                  : "border-transparent bg-transparent hover:bg-surface-2",
              )}
            >
              {pick(item.label, locale)}
            </button>
          );
        })}
        <label className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 text-[13px]">
          <span>{locale === "en" ? "Exploded" : "分解视图"}</span>
          <input
            type="checkbox"
            checked={exploded}
            onChange={(e) => setExploded(e.target.checked)}
            className="accent-accent"
          />
        </label>
      </nav>

      <section className="min-w-0">
        <div className="mb-4">
          <h2 className="text-[1.6rem] font-semibold tracking-tight">
            {technique === "scoop"
              ? locale === "en"
                ? "Scoop only the corner"
                : "只凹一角，挖不出锁标孔"
              : locale === "en"
                ? "Punch the parent"
                : "在父级挖孔"}
          </h2>
          <p className="mt-1 text-[14px] text-fg-muted">
            {locale === "en"
              ? "Hover the chip to grow the hole. Exploded shows the cut fragment."
              : "悬停锁标，孔跟着长。分解视图里斜纹是被裁掉的角。"}
          </p>
        </div>
        <div className="inotch-well flex justify-center rounded-2xl border border-border px-6 py-14">
          <InvertedCard
            technique={technique}
            exploded={exploded}
            locked={locked}
            chipOpen={chipOpen}
            onToggleLocked={() => setLocked((v) => !v)}
            onChipOpen={setChipOpen}
          />
        </div>
        <SupportNote technique={technique} />
      </section>
    </div>
  );
}

function SupportNote({ technique }: { technique: Technique }) {
  const locale = useLocale();
  if (technique === "shape" && typeof window !== "undefined" && !shapeSupports()) {
    return (
      <p className="mt-4 text-[13px] text-fg-muted">
        {locale === "en"
          ? "This browser has no shape(); the playground falls back to path()."
          : "当前浏览器没有 shape()，演示回退到 path()。"}
      </p>
    );
  }
  if (technique === "scoop" && typeof window !== "undefined" && !scoopSupports()) {
    return (
      <p className="mt-4 text-[13px] text-fg-muted">
        {locale === "en"
          ? "This browser has no corner-shape. Scoop still cannot punch a chip hole."
          : "当前浏览器没有 corner-shape。scoop 仍然挖不出锁标孔。"}
      </p>
    );
  }
  return null;
}
