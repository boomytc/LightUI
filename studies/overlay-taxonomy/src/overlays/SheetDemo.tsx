import { useState } from "react";
import { pick, useLocale } from "../lib/site-locale";
import { Btn, DemoShell } from "./Frame";
import { Sheet } from "./Overlay";

const ACTIONS = [
  { zh: "复制链接", en: "Copy link" },
  { zh: "发送到聊天", en: "Send to chat" },
  { zh: "保存图片", en: "Save image" },
];

export function SheetDemo({
  defaultOpen = false,
  compact = false,
}: { defaultOpen?: boolean; compact?: boolean } = {}) {
  const locale = useLocale();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <DemoShell
      compact={compact}
      title={locale === "en" ? "Orbit · share" : "Orbit · 分享"}
      brand={locale === "en" ? "Gallery" : "图库"}
      action={
        <Btn data-sheet-trigger onClick={() => setOpen(true)}>
          {locale === "en" ? "Share" : "分享"}
        </Btn>
      }
      overlay={
        <Sheet
          open={open}
          onClose={() => setOpen(false)}
          title={locale === "en" ? "Share this page" : "分享这一页"}
        >
          <p className="mb-3 text-[13px] text-fg-muted">
            {locale === "en"
              ? "From the bottom, not a right-hand drawer. The list behind stays."
              : "从底部上来，不是右侧抽屉。后面的列表还在。"}
          </p>
          <ul className="flex flex-col gap-2">
            {ACTIONS.map((item) => (
              <li key={item.zh}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-11 w-full items-center rounded-xl bg-surface-2 px-3.5 text-left text-[14px] font-medium hover:bg-accent-soft"
                >
                  {pick({ zh: item.zh, en: item.en }, locale)}
                </button>
              </li>
            ))}
          </ul>
        </Sheet>
      }
    >
      <div className="px-4 pt-4 pb-3 sm:px-5">
        <h3 className="text-[15px] font-medium">{locale === "en" ? "Cover" : "封面"}</h3>
        <p className="text-[12px] text-fg-subtle">
          {locale === "en" ? "Thumb-reach actions. Weak interrupt." : "拇指区操作。弱打断。"}
        </p>
      </div>
      <div className="mx-4 mb-4 h-28 rounded-xl bg-accent-soft sm:mx-5" />
      <p className="px-4 pb-4 text-[13px] text-fg-muted sm:px-5">
        {locale === "en"
          ? "The page stays as context. The sheet is not stuck to the Share button."
          : "原页还在当上下文。操作层不贴着分享按钮。"}
      </p>
    </DemoShell>
  );
}
