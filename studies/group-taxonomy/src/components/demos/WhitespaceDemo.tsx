import type { GroupMode } from "../../lib/machines.js";

const SECTIONS = [
  {
    kicker: "Why",
    title: "为什么重新设计",
    body: "旧流程让信息分散在多个入口，团队难以快速理解项目全貌与当前瓶颈。",
  },
  {
    kicker: "How",
    title: "我们如何解决",
    body: "统一工作区和信息层级，让协作围绕同一上下文发生，减少跨工具上下文切换。",
  },
  {
    kicker: "Result",
    title: "最终带来的改变",
    body: "减少 40% 的重复沟通成本，让团队成员能沿着自然的垂直节奏顺畅阅读页面。",
  },
];

function Cards() {
  return (
    <div className="flex flex-col gap-3 p-5 sm:p-6 bg-surface-2/40">
      <h3 className="px-1 text-sm font-semibold text-fg">产品介绍（卡片便利贴）</h3>
      {SECTIONS.map((section) => (
        <article key={section.kicker} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-[0.65rem] font-medium tracking-wider text-accent uppercase">
            {section.kicker}
          </p>
          <h4 className="mt-1.5 text-sm font-semibold text-fg">{section.title}</h4>
          <p className="mt-1.5 text-xs leading-relaxed text-fg-muted">{section.body}</p>
        </article>
      ))}
    </div>
  );
}

function Grouped() {
  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8 bg-surface">
      <h3 className="text-lg font-bold text-fg">产品介绍</h3>
      <div className="mt-2">
        {SECTIONS.map((section) => (
          <section key={section.kicker} className="border-t border-border py-6 first:border-t-0 first:pt-4">
            <p className="text-[0.65rem] font-medium tracking-wider text-accent uppercase">
              {section.kicker}
            </p>
            <h4 className="mt-1.5 text-base font-semibold text-fg">{section.title}</h4>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-fg-muted">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

export function WhitespaceDemo({ mode }: { mode: GroupMode }) {
  return (
    <div className="relative min-h-[360px]">
      <div
        className={`transition-opacity duration-200 ${
          mode === "cards" ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
        }`}
      >
        <Cards />
      </div>
      <div
        className={`transition-opacity duration-200 ${
          mode === "grouped" ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
        }`}
      >
        <Grouped />
      </div>
    </div>
  );
}
