import { useState } from "react";
import { FOLDER_FILES, FOLDER_TABS } from "../lib/fixtures";
import "../tabs.css";
import { bevelInset, folderLayer, folderPanelZ } from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { TableHead, TableRow, Window } from "./Frame";

export function FolderDemo({ defaultTab }: { defaultTab?: string } = {}) {
  const locale = useLocale();
  const allowed = new Set(FOLDER_TABS.map((t) => t.id));
  const initial = defaultTab && allowed.has(defaultTab) ? defaultTab : "req";
  const [tab, setTab] = useState(initial);
  const files = FOLDER_FILES[tab] ?? FOLDER_FILES.req;
  const count = FOLDER_TABS.length;
  const selected = FOLDER_TABS.findIndex((t) => t.id === tab);
  const tabHeight = 32;
  const bevel = bevelInset(tabHeight, 30);

  return (
    <Window title={locale === "en" ? "Orbit Drive · files" : "Orbit Drive · 项目文件"}>
      <h3 className="text-[1.15rem] font-semibold tracking-tight">
        {locale === "en" ? "Project files" : "项目文件"}
      </h3>

      <div className="tab-folder mt-4" style={{ ["--bevel" as string]: `${bevel}px` }}>
        <div
          role="tablist"
          aria-label={locale === "en" ? "File groups" : "文件分组"}
          className="relative flex h-9 items-end gap-1 bg-surface-2 px-1 pt-1"
        >
          {FOLDER_TABS.map((item, index) => {
            const layer = folderLayer(index, selected, count);
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={layer.raised}
                onClick={() => setTab(item.id)}
                style={{ zIndex: layer.z }}
                className={cn(
                  "tab-folder-item min-w-24 px-4 py-2 text-[13px]",
                  layer.raised
                    ? "-mb-px bg-surface font-medium text-fg"
                    : "translate-y-px bg-surface-2 text-fg-muted hover:text-fg",
                )}
              >
                {pick(item.label, locale)}
              </button>
            );
          })}
        </div>
        <div
          className="relative rounded-b-xl rounded-tr-xl border border-border bg-surface"
          style={{ zIndex: folderPanelZ(count) }}
        >
          <div className="tab-swap" key={tab}>
            <TableHead
              cells={
                locale === "en"
                  ? ["Name", "Type", "Size", "Owner", "Modified"]
                  : ["名称", "类型", "大小", "所有者", "修改时间"]
              }
            />
            {files.map((row) => (
              <TableRow
                key={row.name}
                cells={[row.name, row.type, row.size, row.owner, pick(row.when, locale)]}
              />
            ))}
            <p className="px-3 py-2.5 text-[12px] text-fg-subtle">
              {locale === "en" ? "Drop files to upload" : "已选 0 项 · 支持拖拽上传"}
            </p>
          </div>
        </div>
      </div>
    </Window>
  );
}
