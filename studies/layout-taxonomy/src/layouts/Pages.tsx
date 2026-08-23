import { useRef, useState, type PointerEvent } from "react";
import {
  DASH_BARS,
  DASH_KPI,
  DASH_ROWS,
  LANDING_FEATURES,
  MASONRY_TILES,
  MODULAR_CARDS,
  SPLIT_CODE,
  SPLIT_FILES,
} from "../lib/fixtures";
import { KINDS, type KindId } from "../lib/kinds";
import {
  SPLIT_DEFAULT,
  splitRatioFromPointer,
} from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Window } from "./Frame";
import "./layout.css";

const TILE_TONE = [
  "bg-accent-soft",
  "bg-surface-2",
  "bg-accent/20",
  "bg-fg/10",
  "bg-accent-soft",
];

export function KindDemo({ id }: { id: KindId }) {
  const locale = useLocale();
  const meta = KINDS.find((k) => k.id === id) ?? KINDS[0];
  const title = pick(meta.window, locale);

  switch (id) {
    case "single":
      return (
        <Window title={title} bodyClassName="bg-surface-2">
          <SinglePage />
        </Window>
      );
    case "landing":
      return (
        <Window title={title}>
          <LandingPage />
        </Window>
      );
    case "masonry":
      return (
        <Window title={title}>
          <MasonryPage />
        </Window>
      );
    case "fullscreen":
      return (
        <Window title={title} fill>
          <FullscreenPage />
        </Window>
      );
    case "splitter":
      return (
        <Window title={title}>
          <SplitterPage />
        </Window>
      );
    case "dashboard":
      return (
        <Window title={title}>
          <DashboardPage />
        </Window>
      );
    case "modular":
      return (
        <Window title={title}>
          <ModularPage />
        </Window>
      );
  }
}

function SinglePage() {
  const locale = useLocale();
  return (
    <article className="layout-single bg-surface">
      <p className="text-[11px] tracking-[0.14em] text-fg-subtle uppercase">
        {locale === "en" ? "Journal · 18 Aug" : "周刊 · 8月18日"}
      </p>
      <h3 className="text-[1.35rem] font-semibold leading-snug tracking-tight">
        {locale === "en" ? "Ten sites worth keeping" : "十个值得收藏的网页"}
      </h3>
      <p className="text-[13px] leading-relaxed text-fg-muted">
        {locale === "en"
          ? "A large title, one column, pictures that do not outrun the type."
          : "主标题够大、正文一列、图片不喧宾夺主。"}
      </p>
      <div className="h-24 rounded-xl bg-linear-to-br from-accent-soft to-surface-2" />
      <blockquote className="border-l-2 border-accent bg-surface-2 px-3 py-2 text-[13px] text-fg">
        {locale === "en"
          ? "“Good type lets you forget you are reading.”"
          : "「好的排版让人忘记自己在阅读。」"}
      </blockquote>
      <p className="text-[13px] leading-relaxed text-fg-muted">
        {locale === "en"
          ? "Keep the measure near thirty to forty characters. Quotes and figures sit on the same axis."
          : "行长大约三十到四十字。引用和配图都落在同一条轴上。"}
      </p>
      <p className="text-[12px] text-fg-subtle">{locale === "en" ? "Editor · North" : "编辑 · 拾光"}</p>
    </article>
  );
}

function LandingPage() {
  const locale = useLocale();
  return (
    <div className="layout-landing">
      <section className="layout-landing-hero">
        <p className="text-[11px] font-medium tracking-[0.14em] text-accent uppercase">
          {locale === "en" ? "Drift · team tools" : "云帆协作"}
        </p>
        <h3 className="mt-3 text-[1.6rem] font-semibold tracking-tight">
          {locale === "en" ? "Double the team’s pace" : "让团队效率翻倍"}
        </h3>
        <p className="mt-2 text-[13px] text-fg-muted">
          {locale === "en" ? "One tool for every project." : "一个工具，管好所有项目"}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex h-8 items-center rounded-full bg-fg px-3 text-[12px] font-medium text-surface">
            {locale === "en" ? "Start free" : "免费试用"}
          </span>
          <span className="inline-flex h-8 items-center rounded-full px-3 text-[12px] ring-1 ring-border">
            {locale === "en" ? "See a demo" : "查看演示"}
          </span>
        </div>
      </section>

      <section className="layout-landing-band">
        <ul className="layout-landing-grid">
          {LANDING_FEATURES.map((item) => (
            <li
              key={item.title.zh}
              className="flex h-full min-w-0 flex-col rounded-xl border border-border bg-surface p-3"
            >
              <h4 className="text-[13px] font-semibold">{pick(item.title, locale)}</h4>
              <p className="mt-1 flex-1 text-[12px] leading-relaxed text-fg-muted">
                {pick(item.body, locale)}
              </p>
              <p className="mt-auto pt-3 text-[11px] font-medium text-accent">
                {pick(item.action, locale)} →
              </p>
            </li>
          ))}
        </ul>
        <blockquote className="mt-6 rounded-xl bg-surface-2 px-4 py-4 text-center text-[13px]">
          {locale === "en"
            ? "“Three months in, the team moved three times faster.”"
            : "「用了三个月，协作快了三倍。」"}
        </blockquote>
      </section>

      <section className="layout-landing-cta bg-fg text-center text-surface">
        <h3 className="text-[1.15rem] font-semibold tracking-tight">
          {locale === "en" ? "Try it free for 14 days" : "立即体验，免费 14 天"}
        </h3>
        <span className="mt-4 inline-flex h-8 items-center rounded-full bg-accent px-4 text-[12px] font-medium text-accent-fg">
          {locale === "en" ? "Start now" : "立即体验"}
        </span>
      </section>
    </div>
  );
}

function MasonryPage() {
  const locale = useLocale();
  return (
    <div className="px-3 py-4">
      <p className="text-[11px] tracking-[0.14em] text-fg-subtle uppercase">
        {locale === "en" ? "Inspiration" : "灵感集"}
      </p>
      <h3 className="mt-1 text-[1.15rem] font-semibold tracking-tight">
        {locale === "en" ? "Keep scrolling" : "越刷越有"}
      </h3>
      <div className="layout-masonry mt-3">
        {MASONRY_TILES.map((tile, i) => (
          <article
            key={tile.id}
            className="layout-masonry-card overflow-hidden rounded-xl border border-border bg-surface"
          >
            <div className={cn("w-full", TILE_TONE[i])} style={{ height: tile.h }} />
            <div className="px-2.5 py-2">
              <p className="text-[12px] font-medium">{pick(tile.cat, locale)}</p>
              <p className="text-[11px] text-fg-subtle">{tile.author}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function FullscreenPage() {
  const locale = useLocale();
  return (
    <section className="layout-full bg-linear-to-b from-surface to-accent-soft">
      <div>
        <p className="text-[11px] font-medium tracking-[0.16em] text-accent uppercase">
          {locale === "en" ? "Autumn launch" : "秋季发布会"}
        </p>
        <h3 className="mt-4 text-[2rem] font-semibold leading-tight tracking-tight">
          {locale === "en" ? "Toward the hills" : "向山野出发"}
        </h3>
        <span className="mt-6 inline-flex h-9 items-center rounded-full bg-fg px-5 text-[13px] font-medium text-surface">
          {locale === "en" ? "Reserve" : "立即预约"}
        </span>
      </div>
    </section>
  );
}

function SplitterPage() {
  const locale = useLocale();
  const groupRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [ratio, setRatio] = useState(SPLIT_DEFAULT);
  const [active, setActive] = useState("theme");

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragging.current || !groupRef.current) return;
    const box = groupRef.current.getBoundingClientRect();
    setRatio(splitRatioFromPointer(event.clientX, box.left, box.width));
  }

  function onPointerUp() {
    dragging.current = false;
  }

  return (
    <div ref={groupRef} className="layout-split">
      <div className="layout-split-pane bg-surface-2" style={{ width: `${ratio * 100}%` }}>
        <p className="px-3 py-2 text-[11px] tracking-wide text-fg-subtle">
          {locale === "en" ? "Files" : "文件"}
        </p>
        <ul className="px-1.5 pb-3">
          {SPLIT_FILES.map((item) =>
            item.file ? (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setActive(item.id)}
                  className={cn(
                    "flex min-h-8 w-full items-center rounded-md px-2 text-left text-[12px]",
                    active === item.id ? "bg-fg text-surface" : "text-fg-muted hover:bg-surface",
                  )}
                >
                  {item.name}
                </button>
              </li>
            ) : (
              <li key={item.id} className="px-2 py-1 font-mono text-[11px] text-fg-subtle">
                {item.name}
              </li>
            ),
          )}
        </ul>
      </div>
      <div
        className="layout-split-handle"
        role="separator"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(ratio * 100)}
        aria-label={locale === "en" ? "Resize panes" : "调整分栏"}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      <div className="layout-split-pane flex-1 bg-surface">
        <p className="border-b border-border px-3 py-2 font-mono text-[11px] text-fg-subtle">
          {active === "app" ? "App.tsx" : "theme.ts"}
        </p>
        <pre className="px-3 py-3 font-mono text-[11px] leading-5 text-fg-muted">{SPLIT_CODE}</pre>
      </div>
    </div>
  );
}

function DashboardPage() {
  const locale = useLocale();
  const max = Math.max(...DASH_BARS);
  return (
    <div className="p-3">
      <header className="mb-3 flex items-end justify-between gap-2">
        <div>
          <p className="text-[11px] tracking-[0.14em] text-fg-subtle uppercase">
            {locale === "en" ? "Daily" : "经营日报"}
          </p>
          <h3 className="text-[1.05rem] font-semibold tracking-tight">
            {locale === "en" ? "18 Aug" : "8月18日"}
          </h3>
        </div>
      </header>
      <div className="layout-dash">
        {DASH_KPI.map((kpi) => (
          <article key={kpi.label.zh} className="layout-dash-kpi rounded-xl border border-border bg-surface p-3">
            <p className="text-[11px] text-fg-muted">{pick(kpi.label, locale)}</p>
            <p className="mt-1 text-[1.15rem] font-semibold tabular-nums tracking-tight">{kpi.value}</p>
            <p className="mt-0.5 text-[11px] tabular-nums text-accent">{kpi.delta}</p>
          </article>
        ))}
        <section className="layout-dash-wide rounded-xl border border-border p-3">
          <p className="text-[12px] font-medium">{locale === "en" ? "7-day sales" : "近 7 天销售额"}</p>
          <div className="mt-3 flex h-16 items-end gap-1">
            {DASH_BARS.map((n, i) => (
              <span
                key={i}
                className="min-w-0 flex-1 rounded-sm bg-accent/70"
                style={{ height: `${(n / max) * 100}%` }}
              />
            ))}
          </div>
        </section>
        <section className="layout-dash-wide overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-2 gap-2 border-b border-border bg-surface-2 px-3 py-1.5 text-[11px] text-fg-subtle">
            <span>{locale === "en" ? "Category" : "品类"}</span>
            <span className="text-right">{locale === "en" ? "Sold" : "销量"}</span>
          </div>
          {DASH_ROWS.map((row) => (
            <div
              key={row.name.zh}
              className="grid grid-cols-2 gap-2 border-b border-border px-3 py-2 text-[12px] last:border-b-0"
            >
              <span className="truncate font-medium">{pick(row.name, locale)}</span>
              <span className="text-right tabular-nums text-fg-muted">{row.n}</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

function ModularPage() {
  const locale = useLocale();
  return (
    <div className="p-3">
      <p className="text-[11px] tracking-[0.14em] text-fg-subtle uppercase">
        {locale === "en" ? "Desk" : "个人主页"}
      </p>
      <h3 className="mt-1 mb-3 text-[1.15rem] font-semibold tracking-tight">
        {locale === "en" ? "One idea per card" : "一块一个主意"}
      </h3>
      <ul className="layout-modular">
        {MODULAR_CARDS.map((card) => (
          <li
            key={card.id}
            className="flex h-full min-w-0 flex-col rounded-xl border border-border bg-surface p-3"
          >
            <h4 className="text-[13px] font-semibold">{pick(card.title, locale)}</h4>
            <p className="mt-1 flex-1 text-[12px] leading-relaxed text-fg-muted">
              {pick(card.body, locale)}
            </p>
            <p className="mt-auto pt-3 text-[11px] font-medium text-accent">{pick(card.action, locale)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
