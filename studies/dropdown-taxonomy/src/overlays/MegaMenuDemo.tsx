import { useState, type ComponentType } from "react";
import {
  BarChart3,
  BookOpen,
  Box,
  Code2,
  FileText,
  Layout,
  MessageSquare,
  Palette,
  PenLine,
  Share2,
  Table2,
  Workflow,
} from "lucide-react";
import { MEGA_COLUMNS, MEGA_NAV, type MegaIcon } from "../lib/fixtures";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Frame } from "./Frame";

const ICONS: Record<MegaIcon, ComponentType<{ className?: string }>> = {
  palette: Palette,
  layout: Layout,
  box: Box,
  pen: PenLine,
  share: Share2,
  file: FileText,
  message: MessageSquare,
  workflow: Workflow,
  chart: BarChart3,
  table: Table2,
  code: Code2,
  book: BookOpen,
};

export function MegaMenuDemo({ defaultOpen = true }: { defaultOpen?: boolean } = {}) {
  const locale = useLocale();
  const [open, setOpen] = useState(defaultOpen);
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <Frame title={locale === "en" ? "Acme · product site" : "Acme · 产品官网"}>
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex flex-wrap items-center gap-1">
            <span className="mr-3 text-[13px] font-semibold tracking-wide">ACME</span>
            {MEGA_NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.mega) setOpen((v) => !v);
                  else setOpen(false);
                }}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                  item.mega && open ? "bg-accent-soft text-fg" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                {pick(item.label, locale)}
              </button>
            ))}
          </div>
          <span className="rounded-md bg-fg px-2.5 py-1 text-[11px] text-surface">
            {locale === "en" ? "Try free" : "免费试用"}
          </span>
        </div>

        {open ? (
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-5 rounded-xl border border-border bg-surface-2/70 p-4 sm:grid-cols-4">
            {MEGA_COLUMNS.map((col) => (
              <div key={col.id}>
                <p className="mb-2 text-[11px] font-medium tracking-wide text-fg-subtle">
                  {pick(col.title, locale)}
                </p>
                <ul className="space-y-0.5">
                  {col.items.map((item) => {
                    const Icon = ICONS[item.icon];
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setPicked(`${pick(col.title, locale)} / ${pick(item.name, locale)}`);
                            setOpen(false);
                          }}
                          className="flex w-full items-start gap-2 rounded-md px-1.5 py-1.5 text-left hover:bg-surface"
                        >
                          <Icon className="mt-0.5 size-3.5 shrink-0 text-accent" />
                          <span>
                            <span className="block text-[13px]">{pick(item.name, locale)}</span>
                            <span className="block text-[11px] text-fg-subtle">
                              {pick(item.desc, locale)}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        ) : null}

        <p className="mt-4 text-[12px] text-fg-subtle">
          {picked
            ? locale === "en"
              ? `Chose ${picked}`
              : `已选择：${picked}`
            : locale === "en"
              ? "Open Product for the multi-column nav"
              : "点击「产品」展开多列导航"}
        </p>
      </div>
    </Frame>
  );
}
