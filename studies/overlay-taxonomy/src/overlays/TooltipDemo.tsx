import { useEffect, useRef, useState } from "react";
import { TOOLTIP_DELAY_MS } from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import { DemoShell } from "./Frame";
import { Tooltip } from "./Overlay";

const FIELDS = [
  { zh: "显示名", en: "Display name", hintZh: "会出现在评论里", hintEn: "Shown on comments" },
  { zh: "时区", en: "Time zone", hintZh: "用于日程", hintEn: "Used for calendars" },
  { zh: "语言", en: "Language", hintZh: "界面语言", hintEn: "Interface language" },
];

export function TooltipDemo({
  defaultOpen = false,
  compact = false,
}: { defaultOpen?: boolean; compact?: boolean } = {}) {
  const locale = useLocale();
  const [open, setOpen] = useState(defaultOpen);
  const timer = useRef<number | null>(null);

  function clear() {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  }

  function show() {
    clear();
    timer.current = window.setTimeout(() => setOpen(true), TOOLTIP_DELAY_MS);
  }

  function hide() {
    clear();
    setOpen(false);
  }

  useEffect(() => () => clear(), []);

  const rows = compact ? FIELDS.slice(0, 2) : FIELDS;

  return (
    <DemoShell
      compact={compact}
      title={locale === "en" ? "Orbit · field" : "Orbit · 字段"}
      brand={locale === "en" ? "Profile" : "资料"}
    >
      <div className="px-4 pt-4 pb-3 sm:px-5">
        <h3 className="text-[15px] font-medium">{locale === "en" ? "Account" : "账号"}</h3>
        <p className="text-[12px] text-fg-subtle">
          {locale === "en"
            ? "Hover the info icon. A sentence, not a menu."
            : "悬停信息图标。一句说明，不是菜单。"}
        </p>
      </div>
      <ul>
        {rows.map((row, index) => (
          <li
            key={row.zh}
            className="flex min-w-0 items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5"
          >
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-[13px]">{pick({ zh: row.zh, en: row.en }, locale)}</p>
              {index === 0 ? (
                <span className="relative inline-flex">
                  <button
                    type="button"
                    data-tooltip-trigger
                    aria-describedby={open ? "overlay-tooltip" : undefined}
                    aria-label={locale === "en" ? "What is a display name?" : "什么是显示名？"}
                    onPointerEnter={show}
                    onPointerLeave={hide}
                    onFocus={show}
                    onBlur={hide}
                    className="grid size-6 place-items-center rounded-full border border-border text-[11px] text-fg-muted"
                  >
                    i
                  </button>
                  <span id="overlay-tooltip">
                    <Tooltip
                      open={open}
                      text={
                        locale === "en"
                          ? "Shown next to comments. Not a login email."
                          : "会出现在评论旁边。不是登录邮箱。"
                      }
                    />
                  </span>
                </span>
              ) : null}
            </div>
            <span className="shrink-0 text-[12px] text-fg-subtle">{pick({ zh: row.hintZh, en: row.hintEn }, locale)}</span>
          </li>
        ))}
      </ul>
    </DemoShell>
  );
}
