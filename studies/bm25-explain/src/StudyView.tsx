import {
  BookOpen,
  Layers,
  Scissors,
  Sigma,
} from "lucide-react";
import { CompareView } from "./components/CompareView.tsx";
import { DocPanel } from "./components/DocPanel.tsx";
import { PipelineView } from "./components/PipelineView.tsx";
import { QueryDock } from "./components/QueryDock.tsx";
import { ScoreView } from "./components/ScoreView.tsx";
import { useLocale } from "./lib/site-locale.ts";
import type { TabId } from "./lib/store.ts";
import { useLabStore } from "./lib/store.ts";
import { cn } from "./lib/utils.ts";
import "./bm25/bm25.css";

const TABS: { id: TabId; labelZh: string; labelEn: string; icon: typeof Layers }[] = [
  { id: "compare", labelZh: "对比与融合", labelEn: "Compare & Fusion", icon: Layers },
  { id: "score", labelZh: "公式拆解与调参", labelEn: "Score Math & Curves", icon: Sigma },
  { id: "pipeline", labelZh: "分词与倒排流水线", labelEn: "Pipeline & Index", icon: Scissors },
];

export function StudyView() {
  const locale = useLocale();
  const tab = useLabStore((s) => s.tab);
  const setTab = useLabStore((s) => s.setTab);
  const docsOpen = useLabStore((s) => s.docsOpen);
  const setDocsOpen = useLabStore((s) => s.setDocsOpen);
  const n = useLabStore((s) => s.documents.length);

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20 pt-4">
      {/* Study Title Section */}
      <section className="grid gap-6 pb-8 pt-2 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-12 lg:pb-10">
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-widest text-bm25 uppercase font-semibold">
            Information Retrieval · Lucene BM25
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-fg sm:text-3xl lg:text-4xl">
            {locale === "en"
              ? "How should search ranking and score breakdown be explained?"
              : "检索排序怎么让人看明白？"}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted">
            {locale === "en"
              ? "Search ranking is not a black-box total score. Never add sparse and dense scores directly; decompose scores into term frequency saturation and document length penalty."
              : "检索排序不是黑盒总分。先定稀疏与向量的分数不可直接相加，再把得分拆解为词频饱和与篇幅惩罚。"}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-xs leading-relaxed text-fg-muted">
            {locale === "en"
              ? "Elasticsearch and OpenSearch rely on Lucene BM25 for sparse ranking. The interactive lab below decomposes tokenization, inverted postings, TF saturation curves, and RRF rank fusion."
              : "Elasticsearch / OpenSearch 底层排序用的就是 Lucene BM25；主流 RAG 的稀疏那一半也是它在扛。下面实验台可实时调参、验算每词贡献与多路融合。"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDocsOpen(!docsOpen)}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-surface px-3 text-xs font-semibold text-fg border border-border shadow-xs hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <BookOpen className="size-3.5 text-accent" />
              {locale === "en" ? `Corpus (${n} docs)` : `语料库 (${n} 篇)`}
            </button>
          </div>
        </div>
      </section>

      {/* Main Interactive Container */}
      <div className="space-y-6">
        {/* Search Query Input Dock */}
        <section className="rounded-2xl bg-surface p-4 border border-border shadow-sm sm:p-5">
          <QueryDock />
        </section>

        {/* View Switcher Tabs */}
        <nav
          className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={locale === "en" ? "Interactive views" : "实验台视图切换"}
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition-all duration-150 cursor-pointer border",
                  on
                    ? "bg-accent text-accent-fg border-accent shadow-xs"
                    : "bg-surface text-fg-muted border-border hover:bg-surface-2 hover:text-fg",
                )}
              >
                <Icon className="size-3.5" />
                {locale === "en" ? t.labelEn : t.labelZh}
              </button>
            );
          })}
        </nav>

        {/* Main Grid: Content + DocPanel Drawer */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <main className="min-w-0">
            {tab === "compare" && <CompareView />}
            {tab === "score" && <ScoreView />}
            {tab === "pipeline" && <PipelineView />}
          </main>
          <aside className="min-w-0">
            <DocPanel />
          </aside>
        </div>
      </div>

      {/* How to Tell Them Apart Section */}
      <section className="mt-16 grid min-w-0 gap-8 border-t border-border pt-10 lg:grid-cols-3">
        <article className="rounded-xl bg-surface p-5 border border-border shadow-sm">
          <p className="font-mono text-xs text-bm25 font-bold tracking-wider uppercase">Rule 01</p>
          <h2 className="mt-1.5 text-base font-bold tracking-tight text-fg">
            {locale === "en" ? "BM25 is not Boolean AND" : "BM25 不是布尔 AND"}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-fg-muted">
            {locale === "en"
              ? "Lucene BM25 defaults to SHOULD (OR). Missing terms contribute 0 to the sum rather than disqualifying the whole document."
              : "Lucene / ES 默认是 SHOULD（OR）。少命中的词贡献为 0，不等于整篇文档被过滤淘汰。"}
          </p>
        </article>

        <article className="rounded-xl bg-surface p-5 border border-border shadow-sm">
          <p className="font-mono text-xs text-bm25 font-bold tracking-wider uppercase">Rule 02</p>
          <h2 className="mt-1.5 text-base font-bold tracking-tight text-fg">
            {locale === "en" ? "Never Add Raw Sparse & Dense Scores" : "稀疏与向量不可直接加和"}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-fg-muted">
            {locale === "en"
              ? "BM25 produces unbounded positive values, while cosine similarities range [-1, 1]. Direct sum causes scale collapse; use RRF or Max-norm weighted fusion."
              : "BM25 是无界正数（通常在 0~20+），向量余弦在 [-1, 1]。直接相加会导致量级被大者吞没，必须走 RRF 位次融合或最大值归一加权。"}
          </p>
        </article>

        <article className="rounded-xl bg-surface p-5 border border-border shadow-sm">
          <p className="font-mono text-xs text-bm25 font-bold tracking-wider uppercase">Rule 03</p>
          <h2 className="mt-1.5 text-base font-bold tracking-tight text-fg">
            {locale === "en" ? "Length Penalty is Not Truncation" : "篇幅惩罚不是字符数截断"}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-fg-muted">
            {locale === "en"
              ? "Parameter b scales penalty against average document length (|D|/avgdl). Short, focused articles enjoy natural score boosts."
              : "参数 b 依据相对平均长度 (|D|/avgdl) 进行平滑惩罚，让信息密度高、无废话的短文档脱颖而出。"}
          </p>
        </article>
      </section>
    </div>
  );
}
