import { ArrowRight } from "lucide-react";
import { MASTER_PROMPT, STEPS, type PatternId } from "../lib/machines.js";
import { pick, useLocale } from "../lib/site-locale.js";
import { CopyBlock } from "./CopyBlock.js";
import { RelationQuiz } from "./Quiz.js";

export function Overview({ onOpen }: { onOpen: (id: PatternId) => void }) {
  const locale = useLocale();
  const antiCards =
    locale === "en"
      ? ["Project Overview", "Monthly Metrics", "Product Intro"]
      : ["项目概览", "本月数据", "产品介绍"];

  return (
    <div className="flex flex-col gap-14 pb-8 sm:gap-16">
      <header className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <p className="text-[0.7rem] font-medium tracking-[0.16em] text-accent uppercase">
            Card Diet
          </p>
          <h1 className="mt-3 text-[2rem] leading-[1.15] font-semibold tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "Cards hold standalone objects. Relationship decides the group."
              : "卡片只装独立对象。关系才是分组的答案。"}
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make a section” only says there is content. First name the relationship between blocks, then choose cards, hairlines, spacing, or headings. Boxing everything turns a narrative into a sticky-note wall."
              : "「做个模块」只说了有内容。真正要先定的是这几块之间的语义关系，以及用卡片、细线、间距还是标题去隔断。默认全套卡片，会把连续叙述切成便利贴墙。"}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => onOpen("whitespace")}
              className="pressable inline-flex items-center gap-2 text-sm font-semibold text-accent hover:opacity-80"
            >
              {locale === "en" ? "Start with whitespace sections" : "从留白分区看对照"}
              <ArrowRight className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => onOpen("cards")}
              className="pressable text-sm font-medium text-fg-muted hover:text-fg"
            >
              {locale === "en" ? "See the sticky-note anti-pattern" : "先看反面便利贴墙"}
            </button>
          </div>
        </div>

        <aside
          aria-label={locale === "en" ? "Anti-pattern: everything in cards" : "万物皆卡片的反例"}
          className="relative"
        >
          <p className="mb-3 text-[0.7rem] font-medium tracking-wider text-fg-subtle uppercase">
            {locale === "en" ? "Anti-pattern · Box every block" : "反例 · 每块都套框"}
          </p>
          <div className="rise-in flex flex-col gap-3">
            {antiCards.map((title, i) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-surface px-4 py-3.5 shadow-card"
                style={{ marginLeft: `${i * 12}px` }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-fg">{title}</p>
                  <span className="font-mono text-[0.65rem] text-fg-subtle">
                    0{i + 1}
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${55 + i * 15}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </header>

      <section>
        <p className="text-[0.7rem] font-medium tracking-[0.16em] text-accent uppercase">
          {locale === "en" ? "Safe shortcut" : "安全捷径"}
        </p>
        <h2 className="mt-2 text-[1.35rem] font-semibold tracking-tight text-fg">
          {locale === "en"
            ? "It is not a love of cards—it is the safest three-step habit"
            : "它不是偏爱卡片，而是三步走完最稳的套路"}
        </h2>
        <ol className="mt-6 divide-y divide-border border-y border-border">
          {STEPS.map((step) => (
            <li key={step.num} className="grid gap-2 py-5 sm:grid-cols-[3.5rem_8rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
              <span className="font-mono text-xs font-semibold tracking-wider text-accent">
                {step.num}
              </span>
              <h3 className="text-sm font-semibold text-fg">{pick(step.title, locale)}</h3>
              <p className="text-sm leading-relaxed text-fg-muted">{pick(step.body, locale)}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-sm text-fg-muted">
          {locale === "en" ? (
            <>
              Real UI grouping{" "}
              <span className="font-medium text-fg">does not mean boxing every block</span>.
              Read the relationship first, then pick whitespace, headings, lists, color bands, or vertical dividers.
            </>
          ) : (
            <>
              真正的界面分组，
              <span className="font-medium text-fg">不等于全部装进框里</span>
              。先看关系，再决定用留白、标题、列表、色带还是竖线。
            </>
          )}
        </p>
      </section>

      <RelationQuiz onOpen={onOpen} />

      <section>
        <p className="text-[0.7rem] font-medium tracking-[0.16em] text-accent uppercase">
          {locale === "en" ? "Design constraint for AI" : "给 AI 的设计约束"}
        </p>
        <h2 className="mt-2 text-[1.35rem] font-semibold tracking-tight text-fg">
          {locale === "en"
            ? "Paste this rule before asking a model to lay out a page"
            : "先贴这段约束，再让模型做页面"}
        </h2>
        <p className="mt-2 mb-5 max-w-xl text-sm text-fg-muted">
          {locale === "en"
            ? "With this rule in context, the model evaluates semantic relationships instead of wrapping every block in a card."
            : "注入上下文后，模型应先分析语义关系，而不是默认全套卡片。"}
        </p>
        <CopyBlock label="AI System Prompt" text={pick(MASTER_PROMPT, locale)} />
      </section>
    </div>
  );
}
