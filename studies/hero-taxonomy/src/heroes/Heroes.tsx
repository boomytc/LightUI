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
    <div data-hero="product" className="hero-fold hero-product hero-product-grid flex flex-col">
      <nav className="flex items-center justify-between gap-2 px-4 py-3 @md:px-8 @md:py-4">
        <span className="text-[14px] font-semibold tracking-tight @md:text-[15px]">FlowPlan</span>
        <span className="text-[12px] text-[#8c3a28] underline-offset-2 @md:text-[13px]">
          {locale === "en" ? "Start free" : "免费开始"}
        </span>
      </nav>
      <div className="grid min-w-0 flex-1 grid-cols-1 items-center gap-5 px-4 pb-4 @md:grid-cols-[1.08fr_0.92fr] @md:gap-10 @md:px-8 @md:pb-8">
        <div className="min-w-0">
          <p className="text-[10px] font-medium tracking-[0.18em] text-[#8c3a28] @md:text-[11px]">WORK BETTER</p>
          <h3 className="hero-title mt-2">{locale === "en" ? "Clearer work, together" : "让每一次协作更清晰"}</h3>
          <p className="hero-dek mt-3 max-w-[36rem] text-[#3a332c]">
            {locale === "en"
              ? "Discussion, tasks, and decisions in one workspace."
              : "把讨论、任务和决策集中到一个工作空间。"}
          </p>
          <div className="mt-5 flex min-w-0 flex-wrap gap-2">
            <span className="hero-cta hero-cta-terra">{locale === "en" ? "Start free" : "免费开始"}</span>
            <span className="hero-cta hero-cta-ghost">{locale === "en" ? "See a demo" : "查看演示"}</span>
          </div>
        </div>
        <div className="min-w-0 rounded-2xl bg-white/90 p-3 shadow-card @md:p-5">
          <div className="mb-2 flex items-center gap-2 @md:mb-3">
            <span className="grid size-6 place-items-center rounded-full bg-[#b55238] text-[10px] text-white @md:size-8 @md:text-[12px]">
              F
            </span>
            <span className="text-[12px] font-medium @md:text-[13px]">
              {locale === "en" ? "Flow AI" : "Flow AI 在线"}
            </span>
          </div>
          <p className="rounded-xl rounded-tl-sm bg-[#f4f5f7] px-3 py-2 text-[12px] leading-relaxed text-fg-muted @md:text-[13px]">
            {locale === "en" ? "What should we move today?" : "今天推进哪件事？"}
          </p>
          <p className="mt-2 ml-auto max-w-[90%] rounded-xl rounded-tr-sm bg-[#b55238] px-3 py-2 text-[12px] leading-relaxed text-white @md:text-[13px]">
            {locale === "en" ? "Ship plan + owners." : "发布计划，并分配负责人。"}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="min-w-0 rounded-lg bg-[#f4f5f7] px-2.5 py-2">
              <p className="text-[10px] text-fg-subtle">{locale === "en" ? "Today" : "今日"}</p>
              <p className="truncate text-[12px] font-medium">{locale === "en" ? "Ship plan" : "发布计划"}</p>
            </div>
            <div className="min-w-0 rounded-lg bg-[#f4f5f7] px-2.5 py-2">
              <p className="text-[10px] text-fg-subtle">{locale === "en" ? "Owners" : "负责人"}</p>
              <p className="truncate text-[12px] font-medium">Ayu · Ken</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-4 overflow-hidden px-4 pb-4 text-[10px] tracking-[0.16em] text-[#3a332c]/70 @md:px-8 @md:pb-5">
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
    <div data-hero="portfolio" className="hero-fold hero-portfolio relative flex flex-col">
      <nav className="relative z-10 flex items-center justify-between px-4 py-3 text-[12px] text-white/70 @md:px-8 @md:py-4">
        <span className="tracking-[0.18em] text-white">SUE</span>
        <span>{locale === "en" ? "Work" : "作品"}</span>
      </nav>
      <div className="relative flex min-w-0 flex-1 flex-col justify-end px-10 pb-6 pt-4 @md:px-16 @md:pb-10">
        <button
          type="button"
          aria-label={locale === "en" ? "Previous work" : "上一件"}
          onClick={() => setIndex((n) => (n === 0 ? PORTFOLIO_SLIDES.length - 1 : n - 1))}
          className="absolute top-1/2 left-2 grid size-8 -translate-y-1/2 place-items-center rounded-full border border-white/25 text-[13px] text-white/80 @md:left-4 @md:size-9"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label={locale === "en" ? "Next work" : "下一件"}
          onClick={() => setIndex((n) => (n === PORTFOLIO_SLIDES.length - 1 ? 0 : n + 1))}
          className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full border border-white/25 text-[13px] text-white/80 @md:right-4 @md:size-9"
        >
          ›
        </button>
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-white/20 text-[13px] font-medium @md:size-14 @md:text-[15px]">
            S
          </span>
          <div>
            <p className="text-[12px] tracking-[0.18em] @md:text-[13px]">SUE</p>
            <p className="text-[10px] tracking-[0.14em] text-white/65">PRODUCT DESIGNER</p>
          </div>
        </div>
        <p className="mt-4 text-[10px] tracking-[0.16em] text-white/60 @md:mt-6 @md:text-[11px]">
          {pick(slide.kicker, locale)}
        </p>
        <h3 className="hero-title mt-2 whitespace-pre-line">{pick(slide.title, locale)}</h3>
        <p className="hero-dek mt-3 max-w-[36rem] text-white/75">{pick(slide.body, locale)}</p>
        <span className="hero-cta hero-cta-sheet mt-5 self-start">{locale === "en" ? "View work" : "查看作品"}</span>
      </div>
    </div>
  );
}

function EventFold() {
  const locale = useLocale();
  return (
    <div
      data-hero="event"
      className="hero-fold hero-event flex flex-col items-center justify-center px-5 py-8 text-center @md:px-12"
    >
      <p className="text-[10px] tracking-[0.22em] text-[#f0c4ae] @md:text-[11px]">2026 PRODUCT CONFERENCE</p>
      <h3 className="hero-title mt-3 max-w-[22ch]">
        {locale === "en" ? "Make AI a product people use" : "把 AI 做成真正好用的产品"}
      </h3>
      <p className="hero-dek mt-3 max-w-[32rem] text-white/70">
        {locale === "en"
          ? "With working product leads, from idea to something live."
          : "与一线产品负责人一起，拆解从想法到落地。"}
      </p>
      <p className="mt-5 text-[13px] text-white/80 @md:text-[15px]">
        08 / 24 · 14:00 · {locale === "en" ? "Guangzhou" : "广州 · 海心沙"}
      </p>
      <span className="hero-cta hero-cta-terra mt-5 min-w-32">{locale === "en" ? "Register" : "立即报名"}</span>
      <p className="mt-2 text-[12px] tabular-nums text-white/55">
        {locale === "en" ? "36 seats left" : "仅剩 36 个席位"}
      </p>
    </div>
  );
}

function CommerceFold() {
  const locale = useLocale();
  return (
    <div data-hero="commerce" className="hero-fold hero-commerce grid min-h-0 grid-cols-1 @md:grid-cols-[1.1fr_0.9fr]">
      <div className="min-h-[11rem] min-w-0 self-stretch bg-linear-to-br from-[#ead2b8] to-[#c56a52]/80 @md:min-h-0" />
      <div className="flex min-w-0 flex-col justify-center px-4 py-5 @md:px-8 @md:py-8">
        <p className="text-[10px] tracking-[0.16em] text-fg-subtle @md:text-[11px]">
          {locale === "en" ? "SEASONAL · ONE" : "当季主推 · 一件"}
        </p>
        <h3 className="hero-title mt-2">{locale === "en" ? "North Chair" : "北窗椅"}</h3>
        <p className="hero-dek mt-3 text-fg-muted">
          {locale === "en"
            ? "Ash, hand-finished in Fujian. Why now: this run of 40 is the last this year."
            : "水曲柳，福建手工打磨。为什么现在买：今年最后 40 把。"}
        </p>
        <p className="mt-4 text-[1.35rem] font-semibold tabular-nums @md:text-[1.75rem]">¥2,480</p>
        <span className="hero-cta hero-cta-solid mt-4 w-fit">{locale === "en" ? "Add to cart" : "加入购物车"}</span>
      </div>
    </div>
  );
}

function MediaFold() {
  const locale = useLocale();
  return (
    <div
      data-hero="media"
      className="hero-fold hero-media grid min-h-0 grid-cols-1 items-center gap-5 px-4 py-5 @md:grid-cols-[1.2fr_0.8fr] @md:gap-10 @md:px-8 @md:py-8"
    >
      <div className="min-w-0">
        <p className="text-[10px] tracking-[0.16em] text-fg-subtle @md:text-[11px]">
          {locale === "en" ? "TODAY · TYPE DAILY" : "今日头条 · TYPE DAILY"}
        </p>
        <h3 className="hero-title mt-3">
          {locale === "en"
            ? "Design systems start treating AI drafts as first-class"
            : "设计系统开始把 AI 草稿当成一等公民"}
        </h3>
        <p className="hero-dek mt-3 text-fg-muted">
          {locale === "en"
            ? "Tokens, review, and ship notes now sit next to the generated pass — not after it."
            : "Token、评审和上线说明开始跟生成稿放在一起，而不是事后补。"}
        </p>
        <p className="mt-4 text-[12px] text-fg-subtle @md:text-[13px]">
          {locale === "en" ? "Today 07:12 · Type Daily" : "今天 07:12 · Type Daily"}
        </p>
      </div>
      <div className="min-h-[10rem] min-w-0 rounded-xl bg-linear-to-br from-accent-soft to-[#d4c8b8] @md:min-h-[18rem]" />
    </div>
  );
}

function EducationFold() {
  const locale = useLocale();
  return (
    <div
      data-hero="education"
      className="hero-fold hero-education grid min-h-0 grid-cols-1 items-center gap-5 px-4 py-5 @md:grid-cols-[1.1fr_0.9fr] @md:gap-8 @md:px-8 @md:py-8"
    >
      <div className="min-w-0">
        <p className="text-[10px] tracking-[0.16em] text-accent @md:text-[11px]">
          {locale === "en" ? "6 WEEKS · PRODUCT DESIGN" : "6 周 · 产品设计"}
        </p>
        <h3 className="hero-title mt-2">
          {locale === "en"
            ? "Ship a product you can put in front of users"
            : "结课后你能独立完成一份可上线的产品"}
        </h3>
        <p className="hero-dek mt-3 text-fg-muted">
          {locale === "en" ? "Next start 8 Sep. The outline is the next screen." : "下期 9 月 8 日开课。大纲在下一屏。"}
        </p>
        <span className="hero-cta hero-cta-solid mt-5">{locale === "en" ? "View outline" : "查看课程大纲"}</span>
      </div>
      <ul className="grid min-w-0 grid-cols-3 gap-2">
        {COURSE_SLICES.map((item) => (
          <li key={item.title.zh} className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface">
            <div className={cn("h-16 w-full @md:h-28", item.tone)} />
            <p className="truncate px-1.5 pt-1.5 text-[11px] font-medium @md:px-2 @md:text-[12px]">
              {pick(item.title, locale)}
            </p>
            <p className="truncate px-1.5 pb-1.5 text-[10px] text-fg-subtle @md:px-2">
              {pick(item.meta, locale)}
            </p>
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
    <div data-hero="tool" className="hero-fold hero-tool flex flex-col items-center justify-center px-4 py-5 @md:px-8 @md:py-8">
      <p className="text-center text-[10px] tracking-[0.16em] text-fg-subtle @md:text-[11px]">CUTBG</p>
      <h3 className="hero-title mt-2 text-center">
        {locale === "en" ? "Remove a background in three seconds" : "三秒去掉背景"}
      </h3>
      <button
        type="button"
        onClick={() => setTried(true)}
        className="mt-5 grid w-full min-w-0 max-w-3xl grid-cols-1 overflow-hidden rounded-2xl border border-dashed border-border-strong bg-surface @md:grid-cols-2"
      >
        <div className="relative min-h-[7.5rem] min-w-0 bg-linear-to-br from-[#ead2b8] to-[#8c3a28] @md:min-h-[14rem]">
          <span className="absolute bottom-2 left-2 rounded bg-fg/70 px-1.5 py-0.5 text-[10px] text-surface @md:text-[11px]">
            {locale === "en" ? "Before" : "处理前"}
          </span>
        </div>
        <div
          className={cn(
            "relative min-h-[7.5rem] min-w-0 @md:min-h-[14rem]",
            tried
              ? "bg-[length:12px_12px] bg-[linear-gradient(45deg,#e8eeff_25%,#ffffff_25%,#ffffff_50%,#e8eeff_50%,#e8eeff_75%,#ffffff_75%)]"
              : "bg-surface-2",
          )}
        >
          {tried ? (
            <span className="absolute inset-4 rounded-lg bg-[#ead2b8] @md:inset-6" />
          ) : (
            <span className="absolute inset-0 grid place-items-center px-3 text-center text-[12px] text-fg-muted @md:text-[13px]">
              {locale === "en" ? "Click to try" : "点这里试一次"}
            </span>
          )}
          <span className="absolute right-2 bottom-2 rounded bg-fg/70 px-1.5 py-0.5 text-[10px] text-surface @md:text-[11px]">
            {locale === "en" ? "After" : "处理后"}
          </span>
        </div>
      </button>
      <div className="mt-5 flex justify-center">
        <span className="hero-cta hero-cta-solid">{locale === "en" ? "Start" : "开始使用"}</span>
      </div>
    </div>
  );
}

function CommunityFold() {
  const locale = useLocale();
  return (
    <div
      data-hero="community"
      className="hero-fold hero-community grid min-h-0 grid-cols-1 items-center gap-5 px-4 py-5 @md:grid-cols-[0.9fr_1.1fr] @md:gap-10 @md:px-8 @md:py-8"
    >
      <div className="min-w-0">
        <p className="text-[10px] tracking-[0.16em] text-fg-subtle @md:text-[11px]">MAKERS.CLUB</p>
        <h3 className="hero-title mt-2">{locale === "en" ? "Who is here this week" : "这周谁在这里"}</h3>
        <p className="hero-dek mt-3 text-fg-muted">
          {locale === "en" ? "128 online" : "本周 128 人在线"}
        </p>
        <span className="hero-cta hero-cta-solid mt-5">{locale === "en" ? "Join" : "加入社区"}</span>
      </div>
      <ul className="w-full min-w-0 space-y-2">
        {COMMUNITY_TOPICS.map((row) => (
          <li key={row.who} className="flex min-w-0 items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-fg text-[11px] text-surface @md:size-9">
              {row.initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">{pick(row.topic, locale)}</p>
              <p className="text-[11px] text-fg-subtle">{row.who}</p>
            </div>
            <span className="shrink-0 text-[11px] text-accent">{pick(row.tag, locale)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
