import { useState } from "react";
import { Plus, RotateCcw, Trash2, X } from "lucide-react";
import { useLocale } from "../lib/site-locale.ts";
import { useLabStore } from "../lib/store.ts";
import { cn } from "../lib/utils.ts";

export function DocPanel() {
  const locale = useLocale();
  const documents = useLabStore((s) => s.documents);
  const selectedDocId = useLabStore((s) => s.selectedDocId);
  const setSelectedDocId = useLabStore((s) => s.setSelectedDocId);
  const upsertDoc = useLabStore((s) => s.upsertDoc);
  const removeDoc = useLabStore((s) => s.removeDoc);
  const resetCorpus = useLabStore((s) => s.resetCorpus);
  const docsOpen = useLabStore((s) => s.docsOpen);
  const setDocsOpen = useLabStore((s) => s.setDocsOpen);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");

  const selected = documents.find((d) => d.id === selectedDocId);

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl bg-surface border border-border shadow-sm",
        docsOpen ? "p-4 sm:p-5" : "hidden lg:flex lg:p-5",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-fg">
          {locale === "en" ? `Corpus (${documents.length})` : `测试语料集 (${documents.length})`}
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-2 hover:text-fg transition-colors lg:hidden cursor-pointer"
            onClick={() => setDocsOpen(false)}
            aria-label={locale === "en" ? "Close" : "关闭"}
          >
            <X className="size-4" />
          </button>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-2 hover:text-fg transition-colors cursor-pointer"
            onClick={resetCorpus}
            title={locale === "en" ? "Reset to demo corpus" : "重置为预设语料"}
            aria-label={locale === "en" ? "Reset corpus" : "重置语料"}
          >
            <RotateCcw className="size-4" />
          </button>
        </div>
      </div>
      <ul className="mt-3 max-h-56 space-y-1 overflow-y-auto lg:max-h-72 list-none p-0 m-0">
        {documents.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => setSelectedDocId(d.id)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors cursor-pointer",
                selectedDocId === d.id
                  ? "bg-surface-2 text-fg font-semibold"
                  : "text-fg-muted hover:bg-surface-2/60 hover:text-fg",
              )}
            >
              <span className="min-w-0 truncate">{d.title}</span>
              {d.note ? (
                <span className="shrink-0 font-mono text-[10px] text-fg-subtle">
                  {locale === "en" ? d.noteEn ?? d.note : d.note}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
      {selected ? (
        <div className="mt-4 space-y-2 border-t border-border pt-4">
          <p className="text-xs font-semibold text-fg">
            {locale === "en" ? "Edit Selected Document" : "编辑当前选中文档"}
          </p>
          <input
            type="text"
            value={selected.title}
            onChange={(e) => upsertDoc({ ...selected, title: e.target.value })}
            placeholder={locale === "en" ? "Document title" : "文档标题"}
            className="h-9 w-full rounded-lg bg-surface border border-border px-3 text-xs text-fg placeholder:text-fg-subtle outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          />
          <textarea
            value={selected.body}
            onChange={(e) => upsertDoc({ ...selected, body: e.target.value })}
            className="min-h-24 w-full rounded-lg bg-surface border border-border p-3 text-xs text-fg placeholder:text-fg-subtle outline-none focus-visible:ring-2 focus-visible:ring-accent/40 leading-relaxed resize-y"
            placeholder={locale === "en" ? "Document body" : "文档正文"}
          />
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-bm25 hover:bg-red-500/10 transition-colors cursor-pointer font-medium"
            onClick={() => removeDoc(selected.id)}
          >
            <Trash2 className="size-3.5" />
            {locale === "en" ? "Delete document" : "删除这篇文档"}
          </button>
        </div>
      ) : null}
      <form
        className="mt-4 space-y-2 border-t border-border pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draftTitle.trim() || !draftBody.trim()) return;
          upsertDoc({
            id: `u-${Date.now()}`,
            title: draftTitle.trim(),
            body: draftBody.trim(),
            note: locale === "en" ? "Custom" : "自定义",
          });
          setDraftTitle("");
          setDraftBody("");
        }}
      >
        <p className="text-[11px] font-semibold tracking-wider text-fg-muted uppercase">
          {locale === "en" ? "Add Custom Document" : "新增自定义文档"}
        </p>
        <input
          type="text"
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          placeholder={locale === "en" ? "Title" : "标题"}
          className="h-9 w-full rounded-lg bg-surface border border-border px-3 text-xs text-fg placeholder:text-fg-subtle outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        />
        <textarea
          value={draftBody}
          onChange={(e) => setDraftBody(e.target.value)}
          placeholder={locale === "en" ? "Body text..." : "正文内容"}
          className="min-h-20 w-full rounded-lg bg-surface border border-border p-3 text-xs text-fg placeholder:text-fg-subtle outline-none focus-visible:ring-2 focus-visible:ring-accent/40 leading-relaxed resize-y"
        />
        <button
          type="submit"
          className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-fg hover:bg-surface-2 transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="size-3.5" />
          {locale === "en" ? "Add to Inverted Index" : "加入倒排索引"}
        </button>
      </form>
    </div>
  );
}
