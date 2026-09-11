import { useState, type ReactNode } from "react";
import { InvertedCard } from "./InvertedCard";
import { StitchCard } from "./StitchCard";
import { punchesChipHole, scoopSupports, shapeSupports, type Technique } from "./lib/geometry";
import { pick, useLocale } from "./lib/site-locale";
import { cn } from "./lib/utils";

const TECHNIQUES: { id: Technique; label: { zh: string; en: string } }[] = [
  { id: "shape", label: { zh: "shape() 挖孔", en: "shape() punch" } },
  { id: "path", label: { zh: "path() 回退", en: "path() fallback" } },
  { id: "scoop", label: { zh: "scoop 只凹一角", en: "scoop one corner" } },
];

const WELLS = [
  { id: "paper", zh: "稿纸", en: "Paper" },
  { id: "wash", zh: "淡蓝", en: "Wash" },
  { id: "dusk", zh: "夜色", en: "Dusk" },
  { id: "rose", zh: "玫瑰色", en: "Rose" },
] as const;

type WellId = (typeof WELLS)[number]["id"];

export function Playground() {
  const locale = useLocale();
  const [technique, setTechnique] = useState<Technique>("shape");
  const [exploded, setExploded] = useState(false);
  const [locked, setLocked] = useState(true);
  const [chipOpen, setChipOpen] = useState(false);
  const [well, setWell] = useState<WellId>("paper");
  const [frost, setFrost] = useState(false);
  const punched = punchesChipHole(technique);

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
        <p className="hidden px-1 text-[11px] font-medium tracking-[0.12em] text-fg-subtle uppercase lg:block">
          {locale === "en" ? "Punch" : "挖孔"}
        </p>
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

        <p className="mt-3 hidden px-1 text-[11px] font-medium tracking-[0.12em] text-fg-subtle uppercase lg:block">
          {locale === "en" ? "Well" : "底色"}
        </p>
        <div className="flex shrink-0 gap-1.5 lg:flex-wrap">
          {WELLS.map((item) => {
            const on = item.id === well;
            return (
              <button
                key={item.id}
                type="button"
                data-well={item.id}
                aria-pressed={on}
                onClick={() => setWell(item.id)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                  on
                    ? "border-fg bg-fg text-surface"
                    : "border-border bg-surface text-fg-muted hover:text-fg",
                )}
              >
                {pick(item, locale)}
              </button>
            );
          })}
        </div>

        <label className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 text-[13px]">
          <span>{locale === "en" ? "Translucent card" : "半透明卡片"}</span>
          <input
            type="checkbox"
            checked={frost}
            onChange={(e) => setFrost(e.target.checked)}
            className="accent-accent"
          />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 text-[13px]">
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
            {punched
              ? locale === "en"
                ? "Stitch versus punch"
                : "缝回去，还是在父级挖孔"
              : locale === "en"
                ? "Scoop only the corner"
                : "只凹一角，挖不出锁标孔"}
          </h2>
          <p className="mt-1 text-[14px] text-fg-muted">
            {locale === "en"
              ? "Start on paper — the patch looks fine. Change the well, or frost the card. Hover the chip: the hole grows, the patch does not."
              : "先看稿纸，补丁几乎看不出。换底色，或把卡片半透明。悬停锁标：孔跟着长，补丁还停在原尺寸。"}
          </p>
        </div>

        <div
          className="inotch-well rounded-2xl border border-border px-4 py-8 sm:px-6"
          data-well={well}
          data-frost={frost ? "on" : "off"}
        >
          <div className="inotch-pair">
            <ComparePane
              tone="wrong"
              badge={locale === "en" ? "Wrong" : "错"}
              hint={locale === "en" ? "Matching-color patch" : "同色补丁"}
              caption={
                locale === "en"
                  ? "A same-color shadow sews the corner back. The patch stays paper."
                  : "同色阴影把角缝回去。补丁锁在稿纸色。"
              }
            >
              <StitchCard
                locked={locked}
                chipOpen={chipOpen}
                onToggleLocked={() => setLocked((v) => !v)}
                onChipOpen={setChipOpen}
              />
            </ComparePane>
            <ComparePane
              tone={punched ? "right" : "wrong"}
              badge={punched ? (locale === "en" ? "Right" : "对") : locale === "en" ? "Wrong" : "错"}
              hint={
                punched
                  ? locale === "en"
                    ? "Parent clip"
                    : "父级挖孔"
                  : locale === "en"
                    ? "Scoop · one radius"
                    : "scoop · 只凹一角"
              }
              caption={
                punched
                  ? locale === "en"
                    ? "The hole is a clip. The well shows through. Hover grows --chip-w."
                    : "孔是真裁切。网格从缝里透出来。悬停 --chip-w 带着孔一起长。"
                  : locale === "en"
                    ? "It only scoops one border-radius. No gap, no nested chip."
                    : "只改一角的圆角。没有缝，也嵌不进锁标。"
              }
            >
              <InvertedCard
                technique={technique}
                exploded={exploded}
                locked={locked}
                chipOpen={chipOpen}
                onToggleLocked={() => setLocked((v) => !v)}
                onChipOpen={setChipOpen}
              />
            </ComparePane>
          </div>
        </div>
        <SupportNote technique={technique} />
      </section>
    </div>
  );
}

function ComparePane({
  tone,
  badge,
  hint,
  caption,
  children,
}: {
  tone: "right" | "wrong";
  badge: string;
  hint: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <figure data-tone={tone} className="inotch-pane">
      <figcaption className="inotch-pane-head">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-medium",
            tone === "right" ? "bg-intent-soft text-intent" : "bg-wrong-soft text-wrong",
          )}
        >
          {badge}
        </span>
        <span className={cn("truncate text-[11px] font-medium", tone === "right" ? "text-intent" : "text-wrong")}>
          {hint}
        </span>
      </figcaption>
      <div className="inotch-pane-body">{children}</div>
      <p className="inotch-pane-foot">{caption}</p>
    </figure>
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
