import { useRef, useState } from "react";
import { CalendarClock, ChevronDown, FileText } from "lucide-react";
import { useLocale } from "../lib/site-locale";
import { Frame } from "./Frame";
import { Popover } from "./Popover";

export function SplitButtonDemo() {
  const locale = useLocale();
  const chevronRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(
    locale === "en" ? "Write the piece…" : "写下你的文章内容…",
  );
  const [status, setStatus] = useState(locale === "en" ? "Unpublished" : "未发布");

  function publish() {
    setOpen(false);
    setStatus(locale === "en" ? "Published" : "已发布");
  }

  function schedule() {
    setOpen(false);
    setStatus(locale === "en" ? "Scheduled" : "已预约定时发布");
  }

  function saveDraft() {
    setOpen(false);
    setStatus(locale === "en" ? "Draft saved" : "草稿已保存");
  }

  return (
    <Frame title={locale === "en" ? "Editor · publish" : "内容编辑器 · 发布设置"}>
      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={5}
        className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-3 text-[14px] leading-relaxed text-fg outline-none focus:border-accent"
      />
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-fg-subtle">{status}</p>
        <div className="inline-flex overflow-hidden rounded-lg bg-fg">
          <button
            type="button"
            onClick={publish}
            className="px-4 py-2.5 text-[13px] font-medium text-surface transition-colors hover:bg-fg/90"
          >
            {locale === "en" ? "Publish" : "发布"}
          </button>
          <button
            ref={chevronRef}
            type="button"
            aria-label={locale === "en" ? "More publish options" : "更多发布选项"}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="border-l border-surface/20 px-2.5 text-surface transition-colors hover:bg-fg/90"
          >
            <ChevronDown className="size-4" />
          </button>
          <Popover
            open={open}
            onClose={() => setOpen(false)}
            triggerRef={chevronRef}
            matchWidth={false}
            align="end"
          >
            <div className="min-w-44 p-1">
              <button
                type="button"
                onClick={schedule}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-[14px] hover:bg-surface-2"
              >
                <CalendarClock className="size-3.5 text-fg-muted" />
                {locale === "en" ? "Schedule" : "定时发布"}
              </button>
              <button
                type="button"
                onClick={saveDraft}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-[14px] hover:bg-surface-2"
              >
                <FileText className="size-3.5 text-fg-muted" />
                {locale === "en" ? "Save draft" : "保存草稿"}
              </button>
            </div>
          </Popover>
        </div>
      </div>
    </Frame>
  );
}
