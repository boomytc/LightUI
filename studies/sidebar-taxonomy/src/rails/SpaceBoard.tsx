import type { KindId } from "../lib/kinds";
import { expandLine, spaceSnap } from "../lib/lanes";
import { pick, useLocale } from "../lib/site-locale";
import { occupyPx, overlayPx } from "../lib/space";
import { cn } from "../lib/utils";

const MAX = 256;

export function SpaceBoard({ kind }: { kind: KindId }) {
  const locale = useLocale();
  const snap = spaceSnap(kind);
  const shut = occupyPx(kind, false);
  const open = occupyPx(kind, true);
  const layer = overlayPx(kind, true);
  const expand = expandLine(kind);

  return (
    <div className="mb-5 grid gap-2 sm:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-xl border border-border bg-surface px-3.5 py-3">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <p className="text-[10px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
            {locale === "en" ? "Space" : "空间"}
          </p>
          <p className="text-[11px] text-accent">{pick(expand, locale)}</p>
        </div>

        <Track
          label={locale === "en" ? "Occupies the flow" : "占位 · 主区流"}
          value={snap.occupy}
          ghost={kind === "collapsible" ? shut : undefined}
          tone="occupy"
          locale={locale}
        />
        <Track
          label={locale === "en" ? "Overlay layer" : "图层 · 盖上来"}
          value={kind === "offcanvas" ? layer : 0}
          tone="layer"
          locale={locale}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
        <Sketch
          title={locale === "en" ? "Width" : "宽度"}
          occupy={snap.occupy}
          overlay={0}
          caption={
            kind === "offcanvas"
              ? locale === "en"
                ? "Main column stays full"
                : "主区宽度不变"
              : shut !== open
                ? locale === "en"
                  ? `${open}px open · ${shut}px shut`
                  : `展开 ${open}px · 收起 ${shut}px`
                : locale === "en"
                  ? `${open}px in the flow`
                  : `占位 ${open}px`
          }
        />
        <Sketch
          title={locale === "en" ? "Layer" : "图层"}
          occupy={0}
          overlay={kind === "offcanvas" ? 88 : 0}
          caption={
            kind === "offcanvas"
              ? locale === "en"
                ? "Text stays; panel covers"
                : "正文不动，目录盖上来"
              : locale === "en"
                ? "No extra layer"
                : "没有多一层"
          }
        />
      </div>
    </div>
  );
}

function Track({
  label,
  value,
  ghost,
  tone,
  locale,
}: {
  label: string;
  value: number;
  ghost?: number;
  tone: "occupy" | "layer";
  locale: "zh" | "en";
}) {
  return (
    <div className={cn(tone === "occupy" ? "mb-3" : "")}>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <p className="text-[12px] text-fg-muted">{label}</p>
        <p className="font-mono text-[12px] tabular-nums text-fg">
          {value}
          <span className="ml-0.5 text-[10px] text-fg-subtle">px</span>
        </p>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-surface-2">
        {ghost !== undefined && ghost !== value ? (
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-border-strong/50"
            style={{ width: `${(ghost / MAX) * 100}%` }}
          />
        ) : null}
        <span
          className={cn(
            "rail-meter absolute inset-y-0 left-0 rounded-full",
            tone === "layer" ? "bg-predict" : "bg-accent",
          )}
          style={{ width: `${(value / MAX) * 100}%` }}
        />
      </div>
      {ghost !== undefined && ghost !== value ? (
        <p className="mt-1 text-[10px] text-fg-subtle">
          {locale === "en" ? `Collapsed still ${ghost}px` : `收起仍占 ${ghost}px`}
        </p>
      ) : null}
    </div>
  );
}

function Sketch({
  title,
  occupy,
  overlay,
  caption,
}: {
  title: string;
  occupy: number;
  overlay: number;
  caption: string;
}) {
  const rail = Math.max(10, (occupy / MAX) * 100);
  const veil = overlay > 0 ? 34 : 0;

  return (
    <div className="rounded-xl border border-border bg-surface-2/70 px-3 py-2.5">
      <p className="text-[10px] font-medium tracking-[0.12em] text-fg-subtle uppercase">{title}</p>
      <div className="relative mt-2 h-14 overflow-hidden rounded-md border border-border bg-surface">
        {occupy > 0 ? (
          <span
            className="rail-meter absolute inset-y-0 left-0 bg-accent"
            style={{ width: `${rail}%` }}
          />
        ) : null}
        <span className="absolute inset-y-1 right-1.5 left-[38%] rounded-sm bg-surface-2" />
        {veil > 0 ? (
          <span
            className="rail-meter absolute inset-y-0 left-0 bg-predict/80"
            style={{ width: `${veil}%` }}
          />
        ) : null}
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-fg-muted">{caption}</p>
    </div>
  );
}
