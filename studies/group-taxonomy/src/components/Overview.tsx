import { ArrowRight } from "lucide-react";
import {
  MASTER_PROMPT,
  PATTERNS,
  STEPS,
  type PatternId,
} from "../lib/machines.js";
import { CopyBlock } from "./CopyBlock.js";
import { RelationQuiz } from "./Quiz.js";

export function Overview({ onOpen }: { onOpen: (id: PatternId) => void }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 pb-16 sm:gap-14">
      {/* Hero Header */}
      <header className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-bold tracking-widest text-accent uppercase">
            AI 的默认审美惯性
          </p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-fg sm:text-5xl">
            为什么 AI 什么都爱
            <span className="text-accent"> 装进卡片</span>？
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-fg-muted">
            标题一张卡、数据一张卡、介绍再套一张卡。页面看起来整齐，却越来越像千篇一律的便利贴墙。它不是偏爱卡片，而是在走最安全的容器化捷径。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onOpen("whitespace")}
              className="pressable inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg shadow-sm hover:opacity-95"
            >
              对照五种分组技法
              <ArrowRight className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => onOpen("cards")}
              className="pressable inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-fg hover:bg-surface-2"
            >
              先看反面便利贴墙
            </button>
          </div>
        </div>

        {/* Visual Sticker Wall */}
        <aside className="relative rounded-2xl border border-border bg-surface-2 p-6">
          <div className="absolute -top-3 -right-2 z-10 flex size-16 items-center justify-center rounded-full bg-accent text-center text-[0.7rem] font-bold text-accent-fg shadow-md sm:size-20 sm:text-xs">
            万物
            <br />
            皆卡片
          </div>
          <div className="flex flex-col gap-3">
            {["项目概览", "本月数据", "产品介绍"].map((title, i) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-surface px-4 py-3.5 shadow-sm"
                style={{ marginLeft: `${i * 12}px` }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-fg">{title}</p>
                  <span className="font-mono text-[0.65rem] text-fg-subtle">0{i + 1}</span>
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

      {/* The 3 steps of safe shortcuts */}
      <section>
        <p className="text-xs font-bold tracking-widest text-accent uppercase">
          安全捷径
        </p>
        <h2 className="mt-2 text-2xl font-bold text-fg sm:text-3xl">
          它不是偏爱卡片，而是三步走完最稳的套路
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <article
              key={step.num}
              className="relative rounded-2xl border border-border bg-surface p-5 shadow-sm"
            >
              <div className="h-1 w-12 rounded-full bg-accent" />
              <p className="mt-4 font-mono text-xs font-bold tracking-wider text-accent">
                {step.num}
              </p>
              <h3 className="mt-2 text-lg font-bold text-fg">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {step.body}
              </p>
              {i < STEPS.length - 1 ? (
                <span className="absolute top-1/2 -right-3 hidden text-accent text-lg font-bold md:block">
                  →
                </span>
              ) : null}
            </article>
          ))}
        </div>
        <p className="mt-5 text-sm text-fg-muted">
          但真正的界面分组，<span className="font-semibold text-accent">不等于全部装进框里</span>。
          先看内容关系，再决定用留白、表单、列表、色块还是分割线。
        </p>
      </section>

      {/* Five relational techniques */}
      <section>
        <p className="text-xs font-bold tracking-widest text-accent uppercase">
          五种关系技法
        </p>
        <h2 className="mt-2 text-2xl font-bold text-fg sm:text-3xl">
          不同关系，应该怎么分组？
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PATTERNS.filter((p) => p.id !== "cards").map((pattern) => (
            <button
              key={pattern.id}
              type="button"
              onClick={() => onOpen(pattern.id)}
              className="pressable rounded-2xl border border-border bg-surface p-5 text-left shadow-sm transition-all hover:border-accent/50 hover:bg-surface-2"
            >
              <p className="font-mono text-xs font-bold tracking-wider text-accent">
                {pattern.num} · {pattern.relation}
              </p>
              <h3 className="mt-2 text-xl font-bold text-fg">{pattern.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {pattern.purpose}
              </p>
              <p className="mt-4 text-xs text-fg-subtle">
                适合：{pattern.scenes.join("、")}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Quiz Section */}
      <RelationQuiz onOpen={onOpen} />

      {/* AI Constraint Section */}
      <section>
        <p className="text-xs font-bold tracking-widest text-accent uppercase">
          给 AI 的设计约束
        </p>
        <h2 className="mt-2 text-2xl font-bold text-fg sm:text-3xl">
          先贴这段约束，再让模型做页面
        </h2>
        <p className="mt-2 mb-5 max-w-xl text-sm text-fg-muted">
          将以下系统提示注入上下文。模型在生成 UI 时会优先分析内容语义关系，彻底杜绝默认全套卡片的现象。
        </p>
        <CopyBlock label="AI System Prompt" text={MASTER_PROMPT} />
      </section>
    </div>
  );
}
