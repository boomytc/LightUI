import { useState } from "react";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Btn, Window } from "./Frame";
import { Modal } from "./Overlay";

const FILES = [
  { id: "pdf", zh: "产品需求.pdf", en: "Brief.pdf" },
  { id: "fig", zh: "首页设计稿.fig", en: "Home.fig" },
  { id: "xlsx", zh: "用户反馈.xlsx", en: "Feedback.xlsx" },
  { id: "pptx", zh: "季度复盘.pptx", en: "Review.pptx" },
];

export function ModalDemo({ defaultOpen = false }: { defaultOpen?: boolean } = {}) {
  const locale = useLocale();
  const [files, setFiles] = useState(FILES);
  const [pending, setPending] = useState<string | null>(defaultOpen ? FILES[0].id : null);
  const target = files.find((f) => f.id === pending);

  return (
    <Window title={locale === "en" ? "Orbit · files" : "Orbit · 文件"}>
      <div className="flex items-center justify-between px-4 py-3 sm:px-5">
        <h3 className="text-[15px] font-medium">{locale === "en" ? "My files" : "我的文件"}</h3>
        <Btn tone="outline">{locale === "en" ? "New" : "新建"}</Btn>
      </div>
      <ul>
        {files.map((file) => (
          <li
            key={file.id}
            className={cn(
              "flex h-12 min-w-0 items-center justify-between gap-3 border-t border-border px-4 text-[13px] sm:px-5",
              pending === file.id && "bg-accent-soft",
            )}
          >
            <span className="min-w-0 truncate">{pick({ zh: file.zh, en: file.en }, locale)}</span>
            <Btn tone="ghost" onClick={() => setPending(file.id)}>
              {locale === "en" ? "Delete" : "删除"}
            </Btn>
          </li>
        ))}
        {files.length === 0 ? (
          <li className="px-4 py-10 text-center text-[13px] text-fg-subtle sm:px-5">
            {locale === "en" ? "No files left." : "文件已全部删除。"}
          </li>
        ) : null}
      </ul>

      <Modal
        open={pending !== null}
        onClose={() => setPending(null)}
        title={locale === "en" ? "Delete this file?" : "确认删除？"}
        description={
          locale === "en"
            ? "This cannot be undone. A dangerous confirm does not close on the scrim."
            : "删除后无法恢复。危险确认不要点遮罩关闭。"
        }
      >
        <p className="mb-4 truncate text-[13px] text-fg-muted">{target ? pick({ zh: target.zh, en: target.en }, locale) : ""}</p>
        <div className="flex justify-end gap-2">
          <Btn tone="outline" onClick={() => setPending(null)}>
            {locale === "en" ? "Cancel" : "取消"}
          </Btn>
          <Btn
            onClick={() => {
              setFiles((list) => list.filter((f) => f.id !== pending));
              setPending(null);
            }}
          >
            {locale === "en" ? "Delete" : "确认删除"}
          </Btn>
        </div>
      </Modal>
    </Window>
  );
}
