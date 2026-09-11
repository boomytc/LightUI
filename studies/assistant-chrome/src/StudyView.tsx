import { useState } from "react";
import { CONTRASTS, FORMULA, type KindId } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { cn } from "./lib/utils";
import { Playground } from "./chrome/Playground";

const MACHINE_LINES: { text: string; kinds: KindId[] }[] = [
  { text: 'occupiesPage("chat")     // true', kinds: ["chat"] },
  { text: 'occupiesPage("canvas")   // true', kinds: ["canvas"] },
  { text: 'needsSelection("plugin") // true', kinds: ["plugin"] },
  { text: 'needsSelection("panel")  // true', kinds: ["panel"] },
  { text: 'chromeVisible("invisible") // false', kinds: ["invisible"] },
  { text: "shouldSendOnEnter(true)  // false", kinds: ["chat"] },
  { text: "shouldSendOnEnter(false, 229) // false", kinds: ["chat"] },
];

export function StudyView() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("chat");

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "They are all assistants. They do not live in the same place."
              : "看起来都是助手，住的地方却完全不同。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make a chat” describes the skin. The thing that breaks is where it lives: a full-page list, a suggestion card, a selection toolbar, a draggable float, canvas nodes, or nowhere visible."
              : "「做个聊天」说的是外观。真正会坏掉的是助手住哪：整页对话、侧栏建议卡、选区工具条、可拖小窗、画布节点，还是看不见。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name where it lives, name the scene, then name whether it occupies the page. The six contrasts below are live."
            : "先说住哪，再说场景，再说占不占页、要不要选区。下面六个对照可以点。"}
        </p>
      </section>

      <Playground active={active} onActive={setActive} />

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {FORMULA.map((item) => (
          <div key={item.n} className="flex gap-3 rounded-xl border border-border bg-surface px-3 py-3">
            <span className="inline-grid size-5 shrink-0 place-items-center rounded-md bg-fg text-[10px] font-semibold text-surface">
              {item.n}
            </span>
            <div className="min-w-0">
              <h2 className="text-[13px] font-semibold">{pick(item.title, locale)}</h2>
              <p className="mt-0.5 text-[12px] text-fg-muted">{pick(item.example, locale)}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="grid grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)_minmax(0,1.15fr)] gap-2 border-b border-border bg-surface-2/70 px-4 py-2 text-[10px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
          <span>{locale === "en" ? "Scene" : "场景"}</span>
          <span>{locale === "en" ? "Always a chat" : "一律聊天窗"}</span>
          <span>{locale === "en" ? "Match the home" : "按住处分"}</span>
        </div>
        {CONTRASTS.map((row) => {
          const on = row.id === active;
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => setActive(row.id)}
              className={cn(
                "grid w-full grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)_minmax(0,1.15fr)] gap-2 border-b border-border px-4 py-2.5 text-left last:border-b-0 transition-colors",
                on ? "bg-play-glow" : "hover:bg-surface-2",
              )}
            >
              <p className="text-[13px] font-medium text-fg">{pick(row.scene, locale)}</p>
              <p className="text-[12px] text-fg-muted">{pick(row.naive, locale)}</p>
              <p className="text-[12px] text-fg">{pick(row.matched, locale)}</p>
            </button>
          );
        })}
      </section>

      <section className="mt-14 grid min-w-0 gap-10 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "How to tell them apart" : "怎么把它们分开"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "1. Where it lives is not the page skeleton" : "1. 助手住哪不是整页骨架"}
              </span>
              <br />
              {locale === "en"
                ? "The skeleton is how this page is laid out. Whether the assistant lives in chat, a rail, a plugin, a float, a canvas, or nowhere visible is a different question."
                : "骨架回答这一页怎么铺。助手住对话、侧栏、插件、浮层、画布，还是看不见，是另一问。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. A selection toolbar is not a dialog" : "2. 选区工具条不是弹窗"}
              </span>
              <br />
              {locale === "en"
                ? "A plugin appears on the selection; the host page does not change. A dialog is about interrupt and whether it sticks to a trigger."
                : "插件式贴着选区冒出来，宿主页面不动。弹窗才谈打不打断、贴不贴触发点。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. A suggestion card is not a chat stream" : "3. 侧栏建议卡不是对话流"}
              </span>
              <br />
              {locale === "en"
                ? "The panel is one note plus apply / undo. A full-page message list is chat. Canvas output is nodes, not bubbles."
                : "面板是一段话 + 应用 / 撤销。整页消息列表才是对话。画布的输出是节点，不是气泡。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            occupiesPage
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed">
            {MACHINE_LINES.map((line) => (
              <span
                key={line.text}
                className={cn(
                  "block transition-colors duration-200",
                  line.kinds.includes(active) ? "text-surface" : "text-surface/40",
                )}
              >
                {line.text}
              </span>
            ))}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Chat and canvas take the page. Plugin and panel need a selection. Invisible has no resident chrome. Enter while composing does not send."
              : "对话和画布占满这一页。插件和面板要选区。看不见没有常驻铬。组字中的 Enter 不发送。"}
          </p>
        </article>
      </section>
    </div>
  );
}
