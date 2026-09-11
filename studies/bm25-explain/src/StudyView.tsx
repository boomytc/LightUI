import { useEffect } from "react";
import { BookOpen } from "lucide-react";
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

const TABS: { id: TabId; labelZh: string; labelEn: string }[] = [
  { id: "compare", labelZh: "对比与融合", labelEn: "Compare & Fusion" },
  { id: "score", labelZh: "公式拆解与调参", labelEn: "Score Math & Curves" },
  { id: "pipeline", labelZh: "分词与倒排", labelEn: "Pipeline & Index" },
];

const CHIPS_ZH = ["稀疏 ≠ 向量", "词频饱和 k1", "篇幅惩罚 b"];
const CHIPS_EN = ["sparse ≠ dense", "TF saturation k1", "length penalty b"];

export function StudyView() {
  const locale = useLocale();
  const tab = useLabStore((s) => s.tab);
  const setTab = useLabStore((s) => s.setTab);
  const docsOpen = useLabStore((s) => s.docsOpen);
  const setDocsOpen = useLabStore((s) => s.setDocsOpen);
  const n = useLabStore((s) => s.documents.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const i = Number(e.key);
      if (i >= 1 && i <= TABS.length) {
        e.preventDefault();
        setTab(TABS[i - 1]!.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setTab]);

  return (
    <div data-playground="bm25" className="page-width min-w-0 overflow-x-hidden pb-20 pt-4">
      <section className="grid gap-8 pt-4 pb-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pt-8 lg:pb-12">
        <div className="min-w-0">
          <h1 className="text-[2rem] leading-[1.15] font-semibold tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "How should search ranking and score breakdown be explained?"
              : "检索排序怎么让人看明白？"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "Search ranking is not a black-box total score. Never add sparse and dense scores directly; decompose scores into term frequency saturation and document length penalty."
              : "检索排序不是黑盒总分。先定稀疏与向量的分数不可直接相加，再把得分拆解为词频饱和与篇幅惩罚。"}
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {(locale === "en" ? CHIPS_EN : CHIPS_ZH).map((item) => (
              <li
                key={item}
                className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-fg-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-[13px] leading-relaxed text-fg-subtle">
            {locale === "en"
              ? "Elasticsearch and OpenSearch rank sparse hits with Lucene BM25. The bench below decomposes tokenization, postings, TF saturation, and RRF — live."
              : "Elasticsearch / OpenSearch 的稀疏排序就是 Lucene BM25。下面实验台可拆分词、倒排、饱和曲线与 RRF，数字当场验算。"}
          </p>
          <button
            type="button"
            onClick={() => setDocsOpen(!docsOpen)}
            className="inline-flex h-9 w-fit items-center gap-2 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-fg shadow-card transition-colors hover:bg-surface-2"
          >
            <BookOpen className="size-3.5 text-accent" />
            {locale === "en" ? `Corpus (${n} docs)` : `语料库 (${n} 篇)`}
          </button>
        </div>
      </section>

      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
          <QueryDock />
        </section>

        <nav
          className="inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-border bg-surface p-1 shadow-card [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={locale === "en" ? "Interactive views" : "实验台视图切换"}
        >
          {TABS.map((t, i) => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition-colors",
                  on ? "bg-fg text-surface" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                <span className="font-mono text-[10px] opacity-60">{i + 1}</span>
                {locale === "en" ? t.labelEn : t.labelZh}
              </button>
            );
          })}
        </nav>

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

      <section className="mt-16 grid min-w-0 gap-8 border-t border-border pt-10 lg:grid-cols-3">
        <article>
          <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-bm25 uppercase">
            Rule 01
          </p>
          <h2 className="mt-2 text-[1.05rem] font-semibold tracking-tight text-fg">
            {locale === "en" ? "BM25 is not Boolean AND" : "BM25 不是布尔 AND"}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "Lucene BM25 defaults to SHOULD (OR). Missing terms contribute 0 to the sum rather than disqualifying the whole document."
              : "Lucene / ES 默认是 SHOULD（OR）。少命中的词贡献为 0，不等于整篇文档被过滤淘汰。"}
          </p>
        </article>
        <article>
          <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-bm25 uppercase">
            Rule 02
          </p>
          <h2 className="mt-2 text-[1.05rem] font-semibold tracking-tight text-fg">
            {locale === "en" ? "Never add raw sparse & dense" : "稀疏与向量不可直接加和"}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "BM25 is unbounded and non-negative; cosine lives in [−1, 1]. Direct sum collapses scale. Use RRF or max-norm weights."
              : "BM25 是无界正数，向量余弦在 [−1, 1]。直接相加会被大者吞没，必须走 RRF 或最大值归一。"}
          </p>
        </article>
        <article>
          <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-bm25 uppercase">
            Rule 03
          </p>
          <h2 className="mt-2 text-[1.05rem] font-semibold tracking-tight text-fg">
            {locale === "en" ? "Length penalty is not truncation" : "篇幅惩罚不是字符数截断"}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "Parameter b scales against average length (|D|/avgdl). Short, focused articles get a natural boost."
              : "参数 b 按相对平均长度 (|D|/avgdl) 平滑惩罚，让信息密度高的短文档脱颖而出。"}
          </p>
        </article>
      </section>
    </div>
  );
}
