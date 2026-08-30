import { useState } from "react";
import { BrowserFrame } from "./components/browser-frame";
import { AccordionDemo } from "./components/demos/accordion";
import { AnchorNavDemo } from "./components/demos/anchor-nav";
import { BackToTopDemo } from "./components/demos/back-to-top";
import { ReadingProgressDemo } from "./components/demos/reading-progress";
import { SearchDemo } from "./components/demos/search";
import { StatusFilterDemo } from "./components/demos/status-filter";
import { StepperDemo } from "./components/demos/stepper";
import { INTENTS, PATTERNS, type PatternSlug } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { cn } from "./lib/utils";

export function StudyView() {
  const locale = useLocale();
  const [selected, setSelected] = useState<PatternSlug>("anchor");
  const [seed, setSeed] = useState(0);

  const current = PATTERNS.find((p) => p.slug === selected) ?? PATTERNS[0];

  function renderDemo() {
    switch (selected) {
      case "progress":
        return <ReadingProgressDemo key={seed} />;
      case "back-to-top":
        return <BackToTopDemo key={seed} />;
      case "anchor":
        return <AnchorNavDemo key={seed} />;
      case "stepper":
        return <StepperDemo key={seed} />;
      case "accordion":
        return <AccordionDemo key={seed} />;
      case "search":
        return <SearchDemo key={seed} />;
      case "status-filter":
        return <StatusFilterDemo key={seed} />;
      default:
        return null;
    }
  }

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      {/* Header Introduction */}
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <p className="text-xs font-mono font-semibold tracking-wider text-accent uppercase">
            {locale === "en" ? "In-Page Navigation Taxonomy" : "页面内定位器机制"}
          </p>
          <h1 className="mt-2 text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "Long pages scroll. Locators clarify intent."
              : "长页面只是滚动。定位器才给出意图。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "AI and rich docs easily generate monolithic pages. What prevents scroll fatigue is matching user intent: continuous reading, outline jumps, stepwise wizards, or live retrieval."
              : "AI 与富文档极易生成一滚到底的单页。真正解决空间迷失的，是按用户意图匹配定位器：沉浸阅读、大纲直达、步骤推进还是即时检索。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Switch between the 7 locator models below to see live interaction, container thresholds, and DOM-free algorithms."
            : "在下方 7 种定位器模型间切换，体验实时容器联动、阈值判定与无 DOM 算法。"}
        </p>
      </section>

      {/* Main Interactive Stage */}
      <section className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left Column: Intent Groups & Selector */}
        <div className="space-y-4">
          {INTENTS.map((intent) => (
            <div key={intent.key} className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
              <h2 className="text-xs font-mono font-semibold tracking-wider text-fg-subtle uppercase">
                {pick(intent.title, locale)}
              </h2>
              <p className="mt-0.5 text-[11px] text-fg-muted">{pick(intent.desc, locale)}</p>

              <div className="mt-2.5 space-y-1.5">
                {intent.slugs.map((slug) => {
                  const pat = PATTERNS.find((p) => p.slug === slug);
                  if (!pat) return null;
                  const active = selected === slug;

                  return (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => {
                        setSelected(slug);
                        setSeed((n) => n + 1);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-all",
                        active
                          ? "bg-accent text-accent-fg font-medium shadow-sm"
                          : "bg-surface-2/60 text-fg-muted hover:bg-surface-2 hover:text-fg",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] opacity-70">{pat.id}</span>
                        <span>{pick(pat.name, locale)}</span>
                      </div>
                      <span className="text-[10px] font-mono opacity-80">{pick(pat.eyebrow, locale).split(" · ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Active Interactive Frame & Card Info */}
        <div className="space-y-4">
          <BrowserFrame
            title={pick(current.name, locale)}
            eyebrow={`Locator Model 0${current.id}`}
            badge={
              <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium text-accent">
                {pick(current.eyebrow, locale)}
              </span>
            }
            onReset={() => setSeed((n) => n + 1)}
          >
            {renderDemo()}
          </BrowserFrame>

          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-fg text-xs font-semibold text-surface">
                {current.id}
              </span>
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-fg">
                  {pick(current.purpose, locale)}
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-fg-muted">
                  💡 <strong className="text-fg">{locale === "en" ? "Rule: " : "核心规则："}</strong>
                  {pick(current.coreRule, locale)}
                </p>
                <p className="mt-0.5 text-[11px] text-accent">
                  👉 <strong className="text-fg">{locale === "en" ? "Hint: " : "互动提示："}</strong>
                  {pick(current.hint, locale)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Distinction Matrix */}
      <section className="mt-14 grid min-w-0 gap-8 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "How to tell locators apart" : "怎么把定位器与相近概念区分"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <strong className="text-fg">
                {locale === "en" ? "1. In-page TOC is not site routing" : "1. 页面内大纲不是整站全局路由"}
              </strong>
              <br />
              {locale === "en"
                ? "Outlines and scrollspy guide navigation within a document. Top bars and hamburger menus route between views and products."
                : "大纲目录与滚动联动解决的是单篇长内容内的段落直达与位置反馈；顶部导航栏和汉堡菜单解决的是跨路由的站点架构。"}
            </li>
            <li>
              <strong className="text-fg">
                {locale === "en" ? "2. Reading progress is not a scrollbar" : "2. 阅读进度不是滚动条皮肤"}
              </strong>
              <br />
              {locale === "en"
                ? "Scrollbars show physical window placement. Reading progress expresses cognitive task completion and remaining depth."
                : "滚动条表达视口在容器里的物理坐标；阅读进度条用极低侵入性反馈用户在整个阅读旅程中的完成比例。"}
            </li>
            <li>
              <strong className="text-fg">
                {locale === "en" ? "3. Accordions are not lazy tabs" : "3. 折叠面板不是页签切换"}
              </strong>
              <br />
              {locale === "en"
                ? "Tabs switch between distinct sibling views. Accordions progressively disclose details while keeping titles in a scannable single flow."
                : "页签切换会切断上下文并替换主视图；折叠面板保留标题连续扫描流，仅在用户需要时局部展开细节。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-mono font-medium uppercase tracking-[0.12em] text-surface/50">
            pure_algorithms.ts
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/90">
{`function calculateProgressRatio(scrollTop, scrollHeight, clientHeight) {
  const max = scrollHeight - clientHeight;
  if (max <= 0) return 1;
  return Math.min(1, Math.max(0, scrollTop / max));
}

function shouldShowBackToTop(scrollTop, threshold = 240) {
  return scrollTop > threshold;
}

function canNavigateStep(target, current) {
  return target <= current;
}`}
          </pre>
          <p className="mt-4 text-[12px] leading-relaxed text-surface/60">
            {locale === "en"
              ? "All geometry calculations, thresholds, and stepper validations stay isolated in pure DOM-free algorithms."
              : "所有滚动深度计算、回顶阈值与步骤校验均封装在无 DOM 纯算法中，便于单元测试与跨端复用。"}
          </p>
        </article>
      </section>
    </div>
  );
}
