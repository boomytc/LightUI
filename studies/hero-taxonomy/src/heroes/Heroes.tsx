import { useState } from "react";
import {
  COMMUNITY_TOPICS,
  COURSE_SLICES,
  PORTFOLIO_SLIDES,
  TRUST_LOGOS,
} from "../lib/fixtures";
import { KINDS, type KindId } from "../lib/kinds";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Window } from "./Frame";
import "./hero.css";

export function KindDemo({ id }: { id: KindId }) {
  const locale = useLocale();
  const meta = KINDS.find((k) => k.id === id) ?? KINDS[0];
  const title = pick(meta.window, locale);
  const dark = id === "portfolio" || id === "event";

  return (
    <Window title={title} dark={dark}>
      <Fold id={id} />
    </Window>
  );
}

function Fold({ id }: { id: KindId }) {
  switch (id) {
    case "product":
      return <ProductFold />;
    case "portfolio":
      return <PortfolioFold />;
    case "event":
      return <EventFold />;
    case "commerce":
      return <CommerceFold />;
    case "media":
      return <MediaFold />;
    case "education":
      return <EducationFold />;
    case "tool":
      return <ToolFold />;
    case "community":
      return <CommunityFold />;
  }
}

function ProductFold() {
  const locale = useLocale();
  return (
    <div className="hero-fold hero-product hero-product-grid">
      <nav className="flex items-center justify-between gap-2 px-3 py-2">
        <span className="text-[13px] font-semibold tracking-tight">FlowPlan</span>
        <span className="text-[11px] text-[#8c3a28] underline-offset-2">Start free</span>
      </nav>
      <div className="grid min-w-0 grid-cols-[1.05fr_0.95fr] items-center gap-3 px-3 pb-3">
        <div className="min-w-0">
          <p className="text-[9px] font-medium tracking-[0.18em] text-[#8c3a28]">WORK BETTER</p>
          <h3 className="mt-1 text-[1.05rem] font-semibold leading-snug tracking-tight">
            {locale === "en" ? "Clearer work, together" : "让每一次协作更清晰"}
          </h3>
          <p className="mt-1 text-[11px] leading-relaxed text-[#3a332c]">
            {locale === "en"
              ? "Discussion, tasks, and decisions in one workspace."
              : "把讨论、任务和决策集中到一个工作空间。"}
          </p>
          <div className="mt-2 flex min-w-0 flex-wrap gap-1.5">
            <span className="hero-cta hero-cta-terra">{locale === "en" ? "Start free" : "免费开始"}</span>
            <span className="hero-cta hero-cta-ghost">{locale === "en" ? "See a demo" : "查看演示"}</span>
          </div>
        </div>
        <div className="min-w-0 rounded-xl bg-white/90 p-2 shadow-card">
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="grid size-5 place-items-center rounded-full bg-[#b55238] text-[9px] text-white">F</span>
            <span className="text-[10px] font-medium">{locale === "en" ? "Flow AI" : "Flow AI 在线"}</span>
          </div>
          <p className="rounded-lg rounded-tl-sm bg-[#f4f5f7] px-2 py-1 text-[10px] text-fg-muted">
            {locale === "en" ? "What should we move today?" : "今天推进哪件事？"}
          </p>
          <p className="mt-1 ml-auto max-w-[90%] rounded-lg rounded-tr-sm bg-[#b55238] px-2 py-1 text-[10px] text-white">
            {locale === "en" ? "Ship plan + owners." : "发布计划，并分配负责人。"}
          </p>
        </div>
      </div>
      <div className="flex gap-3 overflow-hidden px-3 pb-2.5 text-[9px] tracking-[0.16em] text-[#3a332c]/70">
        {TRUST_LOGOS.map((name) => (
          <span key={name} className="shrink-0">
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

function PortfolioFold() {
  const locale = useLocale();
  const [index, setIndex] = useState(0);
  const slide = PORTFOLIO_SLIDES[index] ?? PORTFOLIO_SLIDES[0];

  return (
    <div className="hero-fold hero-portfolio relative">
      <nav className="relative z-10 flex items-center justify-between px-3 py-2 text-[11px] text-white/70">
        <span className="tracking-[0.18em] text-white">SUE</span>
        <span>{locale === "en" ? "Work" : "作品"}</span>
      </nav>
      <div className="relative min-w-0 px-8 pb-4 pt-1">
        <button
          type="button"
          aria-label={locale === "en" ? "Previous work" : "上一件"}
          onClick={() => setIndex((n) => (n === 0 ? PORTFOLIO_SLIDES.length - 1 : n - 1))}
          className="absolute top-1/2 left-1.5 grid size-7 -translate-y-1/2 place-items-center rounded-full border border-white/25 text-[11px] text-white/80"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label={locale === "en" ? "Next work" : "下一件"}
          onClick={() => setIndex((n) => (n === PORTFOLIO_SLIDES.length - 1 ? 0 : n + 1))}
          className="absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center rounded-full border border-white/25 text-[11px] text-white/80"
        >
          ›
        </button>
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full bg-white/20 text-[12px] font-medium">S</span>
          <div>
            <p className="text-[11px] tracking-[0.18em]">SUE</p>
            <p className="text-[9px] tracking-[0.14em] text-white/65">PRODUCT DESIGNER</p>
          </div>
        </div>
        <p className="mt-3 text-[9px] tracking-[0.16em] text-white/60">{pick(slide.kicker, locale)}</p>
        <h3 className="mt-1 whitespace-pre-line text-[1.15rem] font-semibold leading-snug tracking-tight">
          {pick(slide.title, locale)}
        </h3>
        <p className="mt-1.5 max-w-[16rem] text-[11px] leading-relaxed text-white/75">{pick(slide.body, locale)}</p>
        <span className="hero-cta hero-cta-sheet mt-3">{locale === "en" ? "View work" : "查看作品"}</span>
      </div>
    </div>
  );
}

function EventFold() {
  const locale = useLocale();
  return (
    <div className="hero-fold hero-event px-4 py-5 text-center">
      <p className="text-[9px] tracking-[0.22em] text-[#f0c4ae]">2026 PRODUCT CONFERENCE</p>
      <h3 className="mt-2 text-[1.25rem] font-semibold leading-snug tracking-tight">
        {locale === "en" ? "Make AI a product people use" : "把 AI 做成真正好用的产品"}
      </h3>
      <p className="mt-1.5 text-[11px] leading-relaxed text-white/70">
        {locale === "en"
          ? "With working product leads, from idea to something live."
          : "与一线产品负责人一起，拆解从想法到落地。"}
      </p>
      <p className="mt-3 text-[11px] text-white/80">08 / 24 · 14:00 · {locale === "en" ? "Guangzhou" : "广州 · 海心沙"}</p>
      <span className="hero-cta hero-cta-terra mt-3 min-w-28">{locale === "en" ? "Register" : "立即报名"}</span>
      <p className="mt-1.5 text-[10px] tabular-nums text-white/55">
        {locale === "en" ? "36 seats left" : "仅剩 36 个席位"}
      </p>
    </div>
  );
}

function CommerceFold() {
  const locale = useLocale();
  return (
    <div className="hero-fold hero-commerce grid min-w-0 grid-cols-[1.05fr_0.95fr] items-stretch">
      <div className="min-w-0 bg-linear-to-br from-[#ead2b8] to-[#c56a52]/80" />
      <div className="min-w-0 px-3 py-3">
        <p className="text-[9px] tracking-[0.16em] text-fg-subtle">
          {locale === "en" ? "SEASONAL · ONE" : "当季主推 · 一件"}
        </p>
        <h3 className="mt-1 text-[1.1rem] font-semibold tracking-tight">
          {locale === "en" ? "North Chair" : "北窗椅"}
        </h3>
        <p className="mt-1 text-[11px] leading-relaxed text-fg-muted">
          {locale === "en"
            ? "Ash, hand-finished in Fujian. Why now: this run of 40 is the last this year."
            : "水曲柳，福建手工打磨。为什么现在买：今年最后 40 把。"}
        </p>
        <p className="mt-2 text-[15px] font-semibold tabular-nums">¥2,480</p>
        <span className="hero-cta hero-cta-solid mt-2">{locale === "en" ? "Add to cart" : "加入购物车"}</span>
      </div>
    </div>
  );
}

function MediaFold() {
  const locale = useLocale();
  return (
    <div className="hero-fold hero-media grid min-w-0 grid-cols-[1.2fr_0.8fr] gap-3 px-3 py-3">
      <div className="min-w-0">
        <p className="text-[9px] tracking-[0.16em] text-fg-subtle">
          {locale === "en" ? "TODAY · TYPE DAILY" : "今日头条 · TYPE DAILY"}
        </p>
        <h3 className="mt-1.5 text-[1.15rem] font-semibold leading-snug tracking-tight">
          {locale === "en"
            ? "Design systems start treating AI drafts as first-class"
            : "设计系统开始把 AI 草稿当成一等公民"}
        </h3>
        <p className="mt-1.5 text-[11px] leading-relaxed text-fg-muted">
          {locale === "en"
            ? "Tokens, review, and ship notes now sit next to the generated pass — not after it."
            : "Token、评审和上线说明开始跟生成稿放在一起，而不是事后补。"}
        </p>
        <p className="mt-2 text-[10px] text-fg-subtle">
          {locale === "en" ? "Today 07:12 · Type Daily" : "今天 07:12 · Type Daily"}
        </p>
      </div>
      <div className="min-h-[7.5rem] min-w-0 rounded-lg bg-linear-to-br from-accent-soft to-[#d4c8b8]" />
    </div>
  );
}

function EducationFold() {
  const locale = useLocale();
  return (
    <div className="hero-fold hero-education grid min-w-0 grid-cols-[1.1fr_0.9fr] gap-3 px-3 py-3">
      <div className="min-w-0">
        <p className="text-[9px] tracking-[0.16em] text-accent">
          {locale === "en" ? "6 WEEKS · PRODUCT DESIGN" : "6 周 · 产品设计"}
        </p>
        <h3 className="mt-1 text-[1.05rem] font-semibold leading-snug tracking-tight">
          {locale === "en"
            ? "Ship a product you can put in front of users"
            : "结课后你能独立完成一份可上线的产品"}
        </h3>
        <p className="mt-1 text-[11px] leading-relaxed text-fg-muted">
          {locale === "en" ? "Next start 8 Sep. The outline is the next screen." : "下期 9 月 8 日开课。大纲在下一屏。"}
        </p>
        <span className="hero-cta hero-cta-solid mt-2">{locale === "en" ? "View outline" : "查看课程大纲"}</span>
      </div>
      <ul className="grid min-w-0 grid-cols-3 gap-1">
        {COURSE_SLICES.map((item) => (
          <li key={item.title.zh} className="min-w-0 overflow-hidden rounded-md border border-border bg-surface">
            <div className={cn("h-10 w-full", item.tone)} />
            <p className="truncate px-1 pt-1 text-[9px] font-medium">{pick(item.title, locale)}</p>
            <p className="truncate px-1 pb-1 text-[8px] text-fg-subtle">{pick(item.meta, locale)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ToolFold() {
  const locale = useLocale();
  const [tried, setTried] = useState(false);

  return (
    <div className="hero-fold hero-tool px-3 py-3">
      <p className="text-center text-[9px] tracking-[0.16em] text-fg-subtle">CUTBG</p>
      <h3 className="mt-1 text-center text-[1.15rem] font-semibold tracking-tight">
        {locale === "en" ? "Remove a background in three seconds" : "三秒去掉背景"}
      </h3>
      <button
        type="button"
        onClick={() => setTried(true)}
        className="mt-3 grid w-full min-w-0 grid-cols-2 overflow-hidden rounded-xl border border-dashed border-border-strong bg-surface"
      >
        <div className="relative min-h-[5.5rem] min-w-0 bg-linear-to-br from-[#ead2b8] to-[#8c3a28]">
          <span className="absolute bottom-1.5 left-1.5 rounded bg-fg/70 px-1.5 py-0.5 text-[9px] text-surface">
            {locale === "en" ? "Before" : "处理前"}
          </span>
        </div>
        <div className={cn("relative min-h-[5.5rem] min-w-0", tried ? "bg-[length:12px_12px] bg-[linear-gradient(45deg,#e8eeff_25%,#ffffff_25%,#ffffff_50%,#e8eeff_50%,#e8eeff_75%,#ffffff_75%)]" : "bg-surface-2")}>
          {tried ? (
            <span className="absolute inset-3 rounded-lg bg-[#ead2b8]" />
          ) : (
            <span className="absolute inset-0 grid place-items-center px-2 text-center text-[10px] text-fg-muted">
              {locale === "en" ? "Click to try" : "点这里试一次"}
            </span>
          )}
          <span className="absolute right-1.5 bottom-1.5 rounded bg-fg/70 px-1.5 py-0.5 text-[9px] text-surface">
            {locale === "en" ? "After" : "处理后"}
          </span>
        </div>
      </button>
      <div className="mt-2.5 flex justify-center">
        <span className="hero-cta hero-cta-solid">{locale === "en" ? "Start" : "开始使用"}</span>
      </div>
    </div>
  );
}

function CommunityFold() {
  const locale = useLocale();
  return (
    <div className="hero-fold hero-community px-3 py-3">
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] tracking-[0.16em] text-fg-subtle">MAKERS.CLUB</p>
          <h3 className="mt-1 text-[1.05rem] font-semibold tracking-tight">
            {locale === "en" ? "Who is here this week" : "这周谁在这里"}
          </h3>
        </div>
        <p className="shrink-0 text-[10px] text-fg-muted">{locale === "en" ? "128 online" : "本周 128 人在线"}</p>
      </div>
      <ul className="mt-2.5 space-y-1.5">
        {COMMUNITY_TOPICS.map((row) => (
          <li key={row.who} className="flex min-w-0 items-center gap-2 rounded-lg bg-surface-2 px-2 py-1.5">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-fg text-[10px] text-surface">
              {row.initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium">{pick(row.topic, locale)}</p>
              <p className="text-[9px] text-fg-subtle">{row.who}</p>
            </div>
            <span className="shrink-0 text-[9px] text-accent">{pick(row.tag, locale)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2.5">
        <span className="hero-cta hero-cta-solid">{locale === "en" ? "Join" : "加入社区"}</span>
      </div>
    </div>
  );
}
