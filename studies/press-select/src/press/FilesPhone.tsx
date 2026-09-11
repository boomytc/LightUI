import type { PointerEvent as ReactPointerEvent } from "react";
import {
  Archive,
  Check,
  Download,
  FileSpreadsheet,
  FileText,
  Image,
  Layers,
  Presentation,
  Share2,
  Table2,
  Trash2,
  X,
} from "lucide-react";
import type { GestureVerdict } from "../lib/machines";
import type { SelectionMode } from "../lib/kinds";
import type { Locale } from "../lib/site-locale";
import { pick } from "../lib/site-locale";
import { cn, fileById, type SampleFile } from "../lib/utils";

const KIND_ICON = {
  design: Layers,
  doc: FileText,
  deck: Presentation,
  sheet: Table2,
  data: FileSpreadsheet,
  image: Image,
  archive: Archive,
} as const;

const KIND_TONE: Record<SampleFile["kind"], string> = {
  design: "bg-accent-soft text-accent",
  doc: "bg-wrong-soft text-wrong",
  deck: "bg-predict-soft text-predict",
  sheet: "bg-intent-soft text-intent",
  data: "bg-surface-2 text-fg-muted",
  image: "bg-accent-soft text-accent",
  archive: "bg-surface-2 text-fg-muted",
};

export type FilesPhoneProps = {
  locale: Locale;
  mode: SelectionMode;
  files: SampleFile[];
  selectedIds: string[];
  pressingId: string | null;
  pressProgress: number;
  openFileId: string | null;
  lastVerdict: GestureVerdict | null;
  scrollFlash?: boolean;
  interactive?: boolean;
  onRowPointerDown?: (event: ReactPointerEvent, fileId: string) => void;
  onExitSelect?: () => void;
  onSelectAll?: () => void;
  onCloseDetail?: () => void;
};

export function FilesPhone({
  locale,
  mode,
  files,
  selectedIds,
  pressingId,
  pressProgress,
  openFileId,
  lastVerdict,
  scrollFlash = false,
  interactive = false,
  onRowPointerDown,
  onExitSelect,
  onSelectAll,
  onCloseDetail,
}: FilesPhoneProps) {
  const openFile = openFileId ? fileById(openFileId) : undefined;
  const selecting = mode === "selecting";

  return (
    <div className="ps-phone relative w-full max-w-[340px] overflow-hidden rounded-[36px] border border-border bg-fg shadow-[0_24px_60px_rgb(23_24_28/0.22)]">
      <div className="relative mx-[7px] mt-[7px] mb-[7px] overflow-hidden rounded-[30px] bg-surface">
        <div className="absolute top-2 left-1/2 z-20 h-5 w-[92px] -translate-x-1/2 rounded-full bg-fg/90" />

        <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-medium text-fg-muted">
          <span className="tabular-nums">9:41</span>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span>5G</span>
            <span className="tabular-nums">100%</span>
          </div>
        </div>

        <header
          className={cn(
            "relative z-10 flex items-center justify-between gap-2 px-4 pb-2.5 pt-1 transition-colors",
            selecting && "bg-accent-soft/70",
          )}
        >
          {selecting ? (
            interactive ? (
              <button
                type="button"
                onClick={onExitSelect}
                className="min-w-12 text-left text-[13px] font-medium text-accent"
              >
                {locale === "en" ? "Cancel" : "取消"}
              </button>
            ) : (
              <span className="min-w-12 text-left text-[13px] font-medium text-accent">
                {locale === "en" ? "Cancel" : "取消"}
              </span>
            )
          ) : (
            <span className="min-w-12 text-[11px] font-semibold tracking-[0.14em] text-fg-subtle uppercase">
              {locale === "en" ? "Files" : "文稿"}
            </span>
          )}

          <div className="text-center">
            <h3 className="text-[15px] font-semibold tracking-tight text-fg">
              {selecting
                ? locale === "en"
                  ? `Selected ${selectedIds.length}`
                  : `已选 ${selectedIds.length}`
                : locale === "en"
                  ? "All Documents"
                  : "全部文档"}
            </h3>
            <p className="text-[10px] text-fg-subtle">
              {selecting
                ? locale === "en"
                  ? "Tap a row to toggle · drag to scroll"
                  : "点按切换勾选 · 滑动仍可浏览"
                : locale === "en"
                  ? "Tap opens · hold selects"
                  : "单击打开 · 按住多选"}
            </p>
          </div>

          {selecting ? (
            interactive ? (
              <button
                type="button"
                onClick={onSelectAll}
                className="min-w-12 text-right text-[13px] font-medium text-accent"
              >
                {locale === "en" ? "All" : "全选"}
              </button>
            ) : (
              <span className="min-w-12 text-right text-[13px] font-medium text-accent">
                {locale === "en" ? "All" : "全选"}
              </span>
            )
          ) : (
            <span className="min-w-12" />
          )}
        </header>

        <div
          className={cn(
            "relative overflow-y-auto overscroll-contain bg-surface-2/50 px-2.5 pb-2",
            interactive ? "ps-list h-[372px]" : "h-auto",
          )}
        >
          <div className="space-y-1.5">
            {files.map((file) => {
              const selected = selectedIds.includes(file.id);
              const pressing = pressingId === file.id;
              const Icon = KIND_ICON[file.kind];

              return (
                <div
                  key={file.id}
                  role={interactive ? "button" : undefined}
                  tabIndex={interactive ? 0 : undefined}
                  onPointerDown={
                    interactive && onRowPointerDown
                      ? (event) => onRowPointerDown(event, file.id)
                      : undefined
                  }
                  className={cn(
                    "ps-row relative flex items-center gap-3 rounded-2xl border px-3 py-2.5 select-none",
                    interactive && "cursor-pointer",
                    selected
                      ? "border-accent/45 bg-accent-soft shadow-[inset_3px_0_0_var(--color-accent)]"
                      : "border-transparent bg-surface",
                    pressing && "ps-row-press border-accent/35 bg-accent-soft/60",
                  )}
                >
                  {pressing && (
                    <span
                      className="ps-hold-fill pointer-events-none absolute inset-y-0 left-0 rounded-2xl bg-accent/12"
                      style={{ width: `${pressProgress * 100}%` }}
                    />
                  )}

                  <span
                    className={cn(
                      "relative z-[1] grid size-10 shrink-0 place-items-center rounded-xl",
                      KIND_TONE[file.kind],
                    )}
                  >
                    <Icon className="size-4" strokeWidth={2} />
                    {pressing && (
                      <svg className="ps-hold-ring pointer-events-none absolute -inset-1" viewBox="0 0 44 44">
                        <circle
                          cx="22"
                          cy="22"
                          r="19"
                          fill="none"
                          stroke="var(--color-accent)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeDasharray={`${pressProgress * 119.4} 119.4`}
                          transform="rotate(-90 22 22)"
                        />
                      </svg>
                    )}
                  </span>

                  <div className="relative z-[1] min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-fg">{file.name}</p>
                    <p className="truncate text-[11px] text-fg-muted">
                      {pick(file.type, locale)} · {file.size}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "ps-check relative z-[1] grid shrink-0 place-items-center overflow-hidden rounded-full border",
                      selecting ? "size-6 opacity-100" : "size-0 border-transparent opacity-0",
                      selected
                        ? "border-accent bg-accent text-accent-fg"
                        : "border-border-strong bg-surface text-transparent",
                    )}
                    aria-hidden={!selecting}
                  >
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <footer
          className={cn(
            "relative z-10 border-t px-3 transition-all",
            selecting ? "border-border bg-surface py-2.5" : "border-transparent py-2",
          )}
        >
          {selecting ? (
            <div className="ps-dock flex items-center justify-around text-[10px] font-medium text-fg-muted">
              <span className="flex flex-col items-center gap-1">
                <Download className="size-4" />
                {locale === "en" ? "Download" : "下载"}
              </span>
              <span className="flex flex-col items-center gap-1">
                <Share2 className="size-4" />
                {locale === "en" ? "Share" : "分享"}
              </span>
              <span className="flex flex-col items-center gap-1 text-wrong">
                <Trash2 className="size-4" />
                {locale === "en" ? "Delete" : "删除"}
              </span>
            </div>
          ) : (
            <p className="text-center text-[11px] text-fg-subtle">
              {locale === "en"
                ? "Hold until the ring closes · slide to cancel"
                : "按住直到圆环合拢 · 滑动即取消"}
            </p>
          )}
        </footer>

        {openFile && (
          <div className="ps-sheet absolute inset-0 z-30 flex flex-col bg-surface">
            <div className="flex items-center justify-between px-4 pt-11 pb-3">
              <p className="text-[11px] font-semibold tracking-[0.12em] text-intent uppercase">
                {locale === "en" ? "Opened" : "已打开"}
              </p>
              <button
                type="button"
                onClick={onCloseDetail}
                className="grid size-8 place-items-center rounded-full bg-surface-2 text-fg-muted"
                aria-label={locale === "en" ? "Close" : "关闭"}
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex flex-1 flex-col items-center px-6 pt-4 text-center">
              <span className={cn("grid size-16 place-items-center rounded-2xl", KIND_TONE[openFile.kind])}>
                {(() => {
                  const Icon = KIND_ICON[openFile.kind];
                  return <Icon className="size-7" />;
                })()}
              </span>
              <h4 className="mt-4 text-[17px] font-semibold tracking-tight text-fg">{openFile.name}</h4>
              <p className="mt-1 text-[13px] text-fg-muted">
                {pick(openFile.type, locale)} · {openFile.size}
              </p>
              <p className="mt-1 text-[12px] text-fg-subtle">{pick(openFile.date, locale)}</p>
              <p className="mt-6 max-w-[220px] text-[12px] leading-relaxed text-fg-muted">
                {locale === "en"
                  ? "Quick tap, drift inside 8px, released before 480ms. This is open — not select."
                  : "短促抬起、位移未出 8px、未满 480ms。这是打开，不是进入选择。"}
              </p>
            </div>
          </div>
        )}

        {scrollFlash && lastVerdict === "scroll" && (
          <div className="ps-flash pointer-events-none absolute inset-x-8 top-[4.6rem] z-20 rounded-full bg-fg px-3 py-1.5 text-center text-[11px] font-medium text-surface shadow-card">
            {locale === "en" ? "Hold cancelled · scrolling" : "长按已注销 · 交给滚动"}
          </div>
        )}
      </div>
    </div>
  );
}
