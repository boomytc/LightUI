import { useState } from "react";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Btn, DemoShell } from "./Frame";
import { Modal } from "./Overlay";

const FILES = [
  { id: "pdf", zh: "产品需求.pdf", en: "Brief.pdf", size: "2.4 MB", whenZh: "今天 09:12", whenEn: "Today 09:12" },
  { id: "fig", zh: "首页设计稿.fig", en: "Home.fig", size: "18 MB", whenZh: "今天 08:40", whenEn: "Today 08:40" },
  { id: "xlsx", zh: "用户反馈.xlsx", en: "Feedback.xlsx", size: "640 KB", whenZh: "昨天", whenEn: "Yesterday" },
  { id: "pptx", zh: "季度复盘.pptx", en: "Review.pptx", size: "9.1 MB", whenZh: "周一", whenEn: "Mon" },
  { id: "notes", zh: "发布清单.md", en: "Ship-list.md", size: "12 KB", whenZh: "周一", whenEn: "Mon" },
  { id: "wav", zh: "客服录音.wav", en: "Support.wav", size: "31 MB", whenZh: "上周", whenEn: "Last week" },
  { id: "csv", zh: "库存快照.csv", en: "Stock.csv", size: "220 KB", whenZh: "上周", whenEn: "Last week" },
  { id: "zip", zh: "品牌物料.zip", en: "Brand.zip", size: "84 MB", whenZh: "3 月", whenEn: "Mar" },
  { id: "png", zh: "封面图.png", en: "Cover.png", size: "3.2 MB", whenZh: "3 月", whenEn: "Mar" },
];

export function ModalDemo({
  defaultOpen = false,
  compact = false,
}: { defaultOpen?: boolean; compact?: boolean } = {}) {
  const locale = useLocale();
  const rows = compact ? FILES.slice(0, 4) : FILES;
  const [files, setFiles] = useState(rows);
  const [pending, setPending] = useState<string | null>(defaultOpen ? FILES[0].id : null);
  const target = files.find((f) => f.id === pending);

  return (
    <DemoShell
      compact={compact}
      title={locale === "en" ? "Orbit · files" : "Orbit · 文件"}
      brand={locale === "en" ? "Files" : "文件"}
      action={<Btn tone="outline">{locale === "en" ? "New" : "新建"}</Btn>}
      overlay={
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
          <p className="mb-4 truncate text-[13px] text-fg-muted">
            {target ? pick({ zh: target.zh, en: target.en }, locale) : ""}
          </p>
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
      }
    >
      <div className="flex items-end justify-between gap-3 px-4 pt-4 pb-3 sm:px-5">
        <div className="min-w-0">
          <h3 className="text-[15px] font-medium">{locale === "en" ? "My files" : "我的文件"}</h3>
          <p className="text-[12px] text-fg-subtle">
            {locale === "en" ? `${files.length} items in this folder` : `本文件夹 ${files.length} 项`}
          </p>
        </div>
      </div>
      <div className="hidden grid-cols-[minmax(0,1fr)_5.5rem_7rem_auto] gap-3 border-t border-border px-4 py-2 text-[11px] text-fg-subtle sm:grid sm:px-5">
        <span>{locale === "en" ? "Name" : "名称"}</span>
        <span>{locale === "en" ? "Size" : "大小"}</span>
        <span>{locale === "en" ? "Modified" : "修改时间"}</span>
        <span />
      </div>
      <ul>
        {files.map((file) => (
          <li
            key={file.id}
            className={cn(
              "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border px-4 text-[13px] sm:grid-cols-[minmax(0,1fr)_5.5rem_7rem_auto] sm:px-5",
              pending === file.id && "bg-accent-soft",
            )}
          >
            <span className="min-w-0 truncate py-3">{pick({ zh: file.zh, en: file.en }, locale)}</span>
            <span className="hidden truncate text-[12px] text-fg-subtle sm:block">{file.size}</span>
            <span className="hidden truncate text-[12px] text-fg-subtle sm:block">
              {pick({ zh: file.whenZh, en: file.whenEn }, locale)}
            </span>
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
    </DemoShell>
  );
}
