import { useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { columnsOf, pickCascade, reopenDraft } from "../lib/cascader";
import { REGIONS, regionLabel } from "../lib/fixtures";
import { pick as labelOf, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { FieldLabel, Frame, TriggerButton } from "./Frame";
import { Popover } from "./Popover";

export function CascaderDemo() {
  const locale = useLocale();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);
  const [path, setPath] = useState<string[]>([]);
  const columns = columnsOf(REGIONS, draft);
  const labels = regionLabel(REGIONS, path, locale);

  function chooseLevel(level: number, id: string) {
    const next = pickCascade(REGIONS, draft, level, id);
    setDraft(next.draft);
    if (next.committed) {
      setPath(next.committed);
      setOpen(false);
    }
  }

  return (
    <Frame title={locale === "en" ? "New address" : "新增收货地址"}>
      <div className="space-y-3">
        <StaticField
          label={locale === "en" ? "Recipient" : "收货人"}
          value={locale === "en" ? "Su Xiaolan" : "苏小懒"}
        />
        <StaticField label={locale === "en" ? "Phone" : "手机号"} value="138 0000 1234" />
        <div>
          <FieldLabel>{locale === "en" ? "Region" : "所在地区"}</FieldLabel>
          <TriggerButton
            ref={triggerRef}
            open={open}
            aria-haspopup="dialog"
            onClick={() => {
              const next = !open;
              setOpen(next);
              if (next) setDraft(reopenDraft(path.length ? path : null));
            }}
          >
            <span className={labels.length ? "text-fg" : "text-fg-subtle"}>
              {labels.length
                ? labels.join(" / ")
                : locale === "en"
                  ? "Choose a region"
                  : "请选择所在地区"}
            </span>
            <ChevronDown className="size-4 shrink-0 text-fg-muted" />
          </TriggerButton>
          <Popover
            open={open}
            onClose={() => setOpen(false)}
            triggerRef={triggerRef}
            matchWidth={false}
          >
            <div className="flex max-h-72">
              {columns.map((items, level) => (
                <ul
                  key={level}
                  className="min-w-32 overflow-y-auto border-l border-border py-1 first:border-l-0"
                >
                  {items.map((item) => {
                    const label = labelOf(item.label, locale);
                    const on = draft[level] === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => chooseLevel(level, item.id)}
                          className={cn(
                            "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[13px]",
                            on ? "bg-accent-soft text-fg" : "hover:bg-surface-2",
                          )}
                        >
                          {label}
                          {item.children?.length ? (
                            <ChevronRight className="size-3.5 text-fg-subtle" />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ))}
            </div>
          </Popover>
        </div>
      </div>
    </Frame>
  );
}

function StaticField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex h-11 items-center rounded-lg border border-border bg-surface-2 px-3 text-[14px]">
        {value}
      </div>
    </div>
  );
}
