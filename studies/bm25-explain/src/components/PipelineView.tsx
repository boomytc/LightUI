import { useMemo, useState } from "react";
import { useLabStore, useBundle } from "../lib/store.ts";
import { previewCuts, tokenize } from "../lib/bm25/tokenize.ts";
import { useLocale } from "../lib/site-locale.ts";
import { cn } from "../lib/utils.ts";
import type { Token } from "../lib/bm25/types.ts";

function TokenChip({ t, locale }: { t: Token; locale: "zh" | "en" }) {
  const toneClass = t.stopped
    ? "bg-surface-2 text-fg-subtle border-border opacity-70"
    : t.subword
      ? "bg-accent/15 text-accent border-accent/30"
      : t.kind === "latin"
        ? "bg-vector/15 text-vector border-vector/30"
        : "bg-bm25/15 text-bm25 border-bm25/30";

  const badge = t.subword
    ? locale === "en" ? "subword" : "子词"
    : t.stopped
      ? locale === "en" ? "stopped" : "停用"
      : t.kind === "cjk"
        ? locale === "en" ? "cjk" : "中文"
        : t.kind === "latin"
          ? locale === "en" ? "latin" : "英文"
          : locale === "en" ? "number" : "数字";

  return (
    <span className="inline-flex flex-col rounded-lg bg-surface-2 px-2.5 py-1.5 border border-border shadow-xs">
      <span className="font-mono text-[10px] text-fg-subtle">{t.raw}</span>
      <span className="font-mono text-xs text-fg font-semibold">{t.term}</span>
      <span className={cn("mt-1 w-fit rounded-full px-1.5 py-0 font-mono text-[9px] font-medium border", toneClass)}>
        {badge}
      </span>
    </span>
  );
}

export function PipelineView() {
  const locale = useLocale();
  const bundle = useBundle();
  const documents = useLabStore((s) => s.documents);
  const selectedDocId = useLabStore((s) => s.selectedDocId);
  const setSelectedDocId = useLabStore((s) => s.setSelectedDocId);
  const subword = useLabStore((s) => s.subword);
  const dropStopwords = useLabStore((s) => s.dropStopwords);
  const setSubword = useLabStore((s) => s.setSubword);
  const setDropStopwords = useLabStore((s) => s.setDropStopwords);
  const [filter, setFilter] = useState("");

  const doc = documents.find((d) => d.id === selectedDocId) ?? documents[0];
  const docTokens = doc
    ? tokenize(`${doc.title} ${doc.body}`, { subword, dropStopwords })
    : [];
  const demo = previewCuts("自然语言处理", locale);
  const titles = new Map(documents.map((d) => [d.id, d.title]));
  const querySet = new Set(bundle.queryTerms);

  const rows = useMemo(() => {
    const list = [...bundle.index.postings.entries()].map(([term, posts]) => ({
      term,
      df: posts.length,
      posts,
      isQuery: querySet.has(term),
    }));
    list.sort((a, b) => Number(b.isQuery) - Number(a.isQuery) || b.df - a.df || a.term.localeCompare(b.term));
    const q = filter.trim().toLowerCase();
    return q ? list.filter((r) => r.term.toLowerCase().includes(q)) : list;
  }, [bundle.index.postings, filter, bundle.queryTerms]);

  const forward = bundle.index.tokensByDoc.get(selectedDocId) ?? [];
  const forwardPrimary = forward.filter((t) => !t.subword);
  const selectedTitle = titles.get(selectedDocId) ?? selectedDocId;
  const andTitles = bundle.candidates.map((id) => titles.get(id) ?? id);

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm leading-relaxed text-fg-muted">
        {locale === "en"
          ? "The retrieval pipeline transforms text in two stages: Tokenization (Analyzer) standardizes tokens and handles stopwords/subwords; Inverted Index (Postings) links terms to document occurrences for instant candidate matching."
          : "检索流水线包含两大阶段：分词分析（Analyzer）负责词法归一与停用词/子词切分；倒排索引（Inverted Index）将词项映射至文档拉链，支撑毫秒级候选集检索与布尔对照。"}
      </p>

      {/* Analyzer Controls */}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 border border-border shadow-sm cursor-pointer">
          <span className="text-xs font-semibold text-fg">
            {locale === "en" ? "Index Subword Expansion (Dict + 2-grams)" : "索引侧子词扩展（词典子串 + 二字）"}
          </span>
          <input
            type="checkbox"
            checked={subword}
            onChange={(e) => setSubword(e.target.checked)}
            className="size-4 accent-accent cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 border border-border shadow-sm cursor-pointer">
          <span className="text-xs font-semibold text-fg">
            {locale === "en" ? "Drop Stopwords (的 / 是 / the etc.)" : "丢掉停用词（的 / 是 / the 等）"}
          </span>
          <input
            type="checkbox"
            checked={dropStopwords}
            onChange={(e) => setDropStopwords(e.target.checked)}
            className="size-4 accent-accent cursor-pointer"
          />
        </label>
      </div>

      {/* Stage 1: Tokenization */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-fg">
            1
          </span>
          <h2 className="text-base font-semibold text-fg">
            {locale === "en" ? "Tokenization & Normalization" : "分词与词法归一化"}
          </h2>
        </div>

        <section className="rounded-xl bg-surface p-4 border border-border shadow-sm sm:p-5">
          <h3 className="text-sm font-semibold text-fg">
            {locale === "en" ? "Granularity Comparison (e.g. 自然语言处理)" : "分词粒度对比（以「自然语言处理」为例）"}
          </h3>
          <p className="mt-1 text-xs text-fg-muted leading-relaxed">
            {locale === "en"
              ? "Search engine indexing creates subwords so both the full phrase and individual keywords can be recalled."
              : "搜索引擎索引模式会切出子词，使整词「自然语言处理」与单搜「语言」均可精准召回。"}
          </p>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {demo.map((cut) => (
              <article key={cut.label} className="rounded-lg bg-surface-2/60 p-3 border border-border">
                <h4 className="text-xs font-semibold text-fg">{cut.label}</h4>
                <p className="mt-1 text-[11px] text-fg-muted">{cut.hint}</p>
                <p className="mt-2.5 font-mono text-xs leading-relaxed text-accent font-medium">
                  {cut.tokens.join(" · ")}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-surface p-4 border border-border shadow-sm sm:p-5">
          <h3 className="text-sm font-semibold text-fg">
            {locale === "en" ? "Current Query Tokens" : "当前查询分词"}
          </h3>
          <p className="mt-1 font-mono text-xs text-fg-muted font-medium">
            {bundle.query || (locale === "en" ? "(empty query)" : "（空查询）")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {bundle.queryTokens.length === 0 ? (
              <span className="text-xs text-fg-subtle">
                {locale === "en" ? "No valid tokens" : "没有有效词项"}
              </span>
            ) : (
              bundle.queryTokens.map((t, i) => (
                <TokenChip key={`${t.start}-${i}`} t={t} locale={locale} />
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl bg-surface p-4 border border-border shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-fg">
              {locale === "en" ? "Selected Document Tokens" : "选中文档分词"}
            </h3>
            <select
              value={doc?.id ?? ""}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="h-9 rounded-lg bg-surface border border-border px-3 text-xs text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent/40 cursor-pointer"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {docTokens.map((t, i) => (
              <TokenChip key={`${t.start}-${i}`} t={t} locale={locale} />
            ))}
          </div>
        </section>
      </div>

      {/* Stage 2: Inverted Index & Postings */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-fg">
            2
          </span>
          <h2 className="text-base font-semibold text-fg">
            {locale === "en" ? "Inverted Index & Postings Zippers" : "倒排索引与拉链候选集"}
          </h2>
        </div>

        <section className="rounded-xl bg-surface p-4 border border-border shadow-sm sm:p-5">
          <h3 className="text-sm font-semibold text-fg">
            {locale === "en" ? "Query Terms Postings Zippers" : "查询词倒排拉链"}
          </h3>
          <p className="mt-1 text-xs text-fg-muted leading-relaxed">
            {locale === "en"
              ? "Each query term points to its document posting list. OR union forms scoring candidates; AND intersection verifies exact full matches."
              : "每个查询词指向包含它的文档拉链。并集为打分候选集，交集为布尔全中集合。"}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bundle.queryTerms.length === 0 ? (
              <p className="text-xs text-fg-subtle">
                {locale === "en" ? "Enter a query to inspect postings zippers." : "输入查询后，这里会列出每个词项的倒排列表。"}
              </p>
            ) : (
              bundle.queryTerms.map((t) => {
                const posts = bundle.index.postings.get(t) ?? [];
                return (
                  <article key={t} className="rounded-lg bg-surface-2/60 p-3 border border-border">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-mono text-xs text-bm25 font-bold">{t}</p>
                      <p className="font-mono text-[10px] text-fg-muted font-medium">df = {posts.length}</p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {posts.length === 0 ? (
                        <span className="text-[11px] text-fg-subtle">
                          {locale === "en" ? "Empty posting" : "空拉链"}
                        </span>
                      ) : (
                        posts.map((p) => (
                          <button
                            key={p.docId}
                            type="button"
                            onClick={() => setSelectedDocId(p.docId)}
                            className="rounded-md bg-surface px-2 py-0.5 font-mono text-[11px] text-fg border border-border hover:border-accent hover:text-accent transition-colors cursor-pointer"
                          >
                            {titles.get(p.docId) ?? p.docId}
                          </button>
                        ))
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <dl className="mt-4 grid gap-2.5 text-sm sm:grid-cols-2">
            <div className="rounded-lg bg-surface-2/60 px-3 py-2.5 border border-border">
              <dt className="font-mono text-[11px] tracking-wide text-fg-muted uppercase font-semibold">
                {locale === "en" ? "OR · At Least One Term" : "OR · 至少命中一词"}
              </dt>
              <dd className="mt-1 font-mono text-xs font-semibold text-fg">
                {locale === "en"
                  ? `${bundle.orCandidates.length} docs enter BM25 scoring`
                  : `${bundle.orCandidates.length} 篇进入 BM25 打分`}
              </dd>
            </div>
            <div className="rounded-lg bg-surface-2/60 px-3 py-2.5 border border-border">
              <dt className="font-mono text-[11px] tracking-wide text-fg-muted uppercase font-semibold">
                {locale === "en" ? "AND · All Query Terms" : "AND · 全部命中"}
              </dt>
              <dd className="mt-1 font-mono text-xs font-semibold text-fg">
                {bundle.candidates.length} {locale === "en" ? "docs" : "篇"}
                {andTitles.length ? `：${andTitles.join("、")}` : bundle.queryTerms.length ? (locale === "en" ? " (no full match)" : "（无全部命中文档）") : ""}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl bg-surface p-4 border border-border shadow-sm sm:p-5">
          <h3 className="text-sm font-semibold text-fg">
            {locale === "en" ? `Forward Terms · ${selectedTitle}` : `正排词表 · ${selectedTitle || "未选择"}`}
          </h3>
          <p className="mt-1 font-mono text-xs text-fg-muted">
            |D| = {bundle.index.docLen.get(selectedDocId) ?? 0} · avgdl = {bundle.index.avgdl.toFixed(1)} · N = {bundle.index.nDocs}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {forwardPrimary.length === 0 ? (
              <span className="text-xs text-fg-subtle">
                {locale === "en" ? "No valid terms" : "没有有效词项"}
              </span>
            ) : (
              forwardPrimary.map((t, i) => (
                <span
                  key={`${t.start}-${i}`}
                  className={cn(
                    "rounded-md px-2 py-0.5 font-mono text-xs border",
                    querySet.has(t.term)
                      ? "bg-bm25/15 text-bm25 font-semibold border-bm25/30"
                      : "bg-surface-2 text-fg border-border",
                  )}
                >
                  {t.term}
                </span>
              ))
            )}
          </div>
        </section>

        {/* Vocabulary Search Table */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={locale === "en" ? "Filter vocabulary..." : "搜索词项..."}
            className="h-9 max-w-xs rounded-lg bg-surface border border-border px-3 text-xs text-fg placeholder:text-fg-subtle outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          />
          <span className="text-xs text-fg-muted font-mono">
            {locale === "en"
              ? `${bundle.index.nDocs} docs · avgdl ${bundle.index.avgdl.toFixed(1)} · ${bundle.index.postings.size} unique terms`
              : `${bundle.index.nDocs} 篇语料 · avgdl ${bundle.index.avgdl.toFixed(1)} · 共 ${bundle.index.postings.size} 个词项`}
          </span>
        </div>

        <div className="min-w-0 overflow-x-auto rounded-xl bg-surface border border-border shadow-sm">
          <table className="w-full min-w-2xl text-left text-xs">
            <thead className="border-b border-border bg-surface-2/40 text-[11px] tracking-wide text-fg-muted uppercase font-semibold">
              <tr>
                <th className="px-4 py-2.5 font-semibold">{locale === "en" ? "Term" : "词项 Term"}</th>
                <th className="px-4 py-2.5 font-semibold">{locale === "en" ? "Doc Freq df" : "文档频率 df"}</th>
                <th className="px-4 py-2.5 font-semibold">{locale === "en" ? "Postings List (docId × tf)" : "倒排拉链 Postings"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 80).map((r) => (
                <tr key={r.term} className={cn("border-b border-border/60", r.isQuery && "bg-bm25/5")}>
                  <td className="px-4 py-2.5 font-mono text-fg font-medium">
                    {r.term}
                    {r.isQuery ? (
                      <span className="ml-2 rounded-full bg-bm25/15 px-2 py-0.5 font-mono text-[10px] text-bm25 font-semibold border border-bm25/30">
                        Query
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-2.5 font-mono tabular-nums text-fg-muted">{r.df}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      {r.posts.map((p) => (
                        <button
                          key={p.docId}
                          type="button"
                          onClick={() => setSelectedDocId(p.docId)}
                          className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-fg border border-border hover:border-accent hover:text-accent transition-colors cursor-pointer"
                        >
                          {titles.get(p.docId) ?? p.docId}
                          <span className="ml-1 text-fg-subtle font-normal">×{p.tf}</span>
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
