import { useEffect, useId, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { loc, pick, useLocale } from "../lib/site-locale";
import { dismissOverlay } from "../lib/space";
import { cn } from "../lib/utils";
import { Frame } from "./Frame";

const TOC = [
  {
    id: "why",
    n: "01",
    label: loc("为什么需要设计系统", "Why a system"),
    body: loc(
      "设计系统不是组件仓库，而是一套让团队持续做出一致决策的方法。",
      "A design system is not a component dump. It is how a team keeps deciding the same way.",
    ),
  },
  {
    id: "principles",
    n: "02",
    label: loc("从设计原则开始", "Start with principles"),
    body: loc(
      "先定义原则，再整理基础样式、组件和使用规则。每一层都应该能解释为什么这样设计。",
      "Principles first, then tokens, then components and rules. Each layer should explain why.",
    ),
  },
  {
    id: "tokens",
    n: "03",
    label: loc("基础样式与变量", "Tokens"),
    body: loc(
      "颜色、字号、间距、圆角先成为 token，组件只消费 token，不为单页发明新值。",
      "Color, type, space, and radius become tokens. Components consume them; pages do not invent values.",
    ),
  },
  {
    id: "components",
    n: "04",
    label: loc("组件与使用规则", "Components"),
    body: loc(
      "组件进入真实业务，还要记录例外、版本和验证结果，否则系统会慢慢失真。",
      "Once a component hits real work, record exceptions, versions, and checks, or the system drifts.",
    ),
  },
  {
    id: "version",
    n: "05",
    label: loc("版本与维护", "Versioning"),
    body: loc(
      "把变更写成可回滚的版本，而不是一次次口头对齐。系统靠节奏活着。",
      "Write change as a version you can roll back. A system lives on rhythm, not a launch.",
    ),
  },
];

export function OffCanvasDemo({ defaultOpen = false }: { defaultOpen?: boolean } = {}) {
  const locale = useLocale();
  const [open, setOpen] = useState(defaultOpen);
  const [section, setSection] = useState(TOC[0].id);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const current = TOC.find((item) => item.id === section) ?? TOC[0];

  function close() {
    const next = dismissOverlay();
    setOpen(next.open);
    if (next.restoreFocus) btnRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <Frame title={locale === "en" ? "Design Notes · essay" : "Design Notes · 长文"}>
      <div className="relative min-h-[22rem] overflow-hidden bg-surface">
        <div
          className={cn(
            "absolute inset-0 z-[1] bg-fg/25 transition-opacity duration-300",
            open ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={close}
        />

        <aside
          id={panelId}
          className="absolute inset-y-0 left-0 z-[2] flex w-64 max-w-[80%] flex-col bg-fg text-surface"
          style={{
            transform: open ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
          aria-hidden={!open}
        >
          <div className="flex h-16 items-center px-5 pl-16">
            <span className="text-[11px] tracking-[0.16em] text-white/45 uppercase">
              {locale === "en" ? "Contents" : "目录"}
            </span>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 px-3 pb-3" aria-label={locale === "en" ? "Essay" : "文章目录"}>
            {TOC.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSection(item.id);
                  close();
                }}
                className={cn(
                  "flex h-9 items-center gap-3 rounded-md px-3 text-left text-[13px]",
                  section === item.id
                    ? "bg-white/10 text-surface"
                    : "text-white/55 hover:bg-white/5 hover:text-surface",
                )}
              >
                <span className="w-5 font-mono text-[11px] tabular-nums text-white/45">{item.n}</span>
                <span className="truncate">{pick(item.label, locale)}</span>
              </button>
            ))}
          </nav>
        </aside>

        <button
          ref={btnRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? (locale === "en" ? "Close contents" : "关闭目录") : locale === "en" ? "Open contents" : "打开目录"}
          onClick={() => setOpen((v) => !v)}
          className="absolute top-4 left-4 z-[3] grid size-10 place-items-center rounded-full bg-accent text-accent-fg shadow-card"
        >
          <span className="relative size-5">
            <Menu
              className={cn(
                "absolute inset-0 size-5 transition-[opacity,transform,filter] duration-200",
                open ? "scale-[0.25] opacity-0 blur-[4px]" : "scale-100 opacity-100 blur-none",
              )}
            />
            <X
              className={cn(
                "absolute inset-0 size-5 transition-[opacity,transform,filter] duration-200",
                open ? "scale-100 opacity-100 blur-none" : "scale-[0.25] opacity-0 blur-[4px]",
              )}
            />
          </span>
        </button>

        <article className="h-full px-5 py-5">
          <div className="mb-4 flex h-10 items-center pl-12">
            <p className="text-[11px] tracking-[0.16em] text-fg-subtle uppercase">Design Notes · 08</p>
          </div>

          <p className="text-[12px] text-fg-subtle">
            {locale === "en" ? "12 min · occupancy is zero until asked" : "12 分钟 · 默认宽度为零"}
          </p>
          <h3 className="mt-2 max-w-xl text-[1.25rem] font-semibold tracking-tight">
            {locale === "en" ? "How to keep a design system alive" : "如何建立一套可持续的设计系统"}
          </h3>
          <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-fg-muted">{pick(current.body, locale)}</p>
          <div className="mt-5 flex max-w-xl gap-4">
            <div className="min-w-0 flex-1 space-y-2 text-[13px] leading-relaxed text-fg-muted">
              <p>
                {locale === "en"
                  ? "The column is gone until the button is pressed. Collapse would have left an icon rail."
                  : "没点按钮之前，这一栏不存在。可折叠会留下一条图标栏。"}
              </p>
            </div>
            <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-lg bg-fg">
              <span className="absolute top-1/2 left-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
            </div>
          </div>
        </article>
      </div>
    </Frame>
  );
}
