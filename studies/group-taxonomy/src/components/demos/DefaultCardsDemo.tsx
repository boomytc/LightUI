import type { GroupMode } from "../../lib/machines.js";

function MiniBar({ value }: { value: number }) {
  return (
    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
      <div className="h-full rounded-full bg-accent" style={{ width: `${value}%` }} />
    </div>
  );
}

function Cards() {
  return (
    <div className="flex flex-col gap-3 p-5 sm:p-6 bg-surface-2/40">
      <article className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-fg">项目概览</h3>
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[0.65rem] font-medium tracking-wide text-accent">
            进行中
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-md bg-accent text-xs font-semibold text-accent-fg">
            AT
          </div>
          <div>
            <p className="text-sm font-medium text-fg">知识库改版</p>
            <p className="text-xs text-fg-muted">12 个任务 · 8 人协作</p>
          </div>
        </div>
        <MiniBar value={62} />
      </article>

      <article className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-fg">本月数据</h3>
          <span className="text-[0.65rem] text-fg-subtle">8 月</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            ["24K", "访问量"],
            ["68%", "完成率"],
            ["+32", "新成员"],
          ].map(([stat, label]) => (
            <div key={label} className="text-center">
              <p className="text-xl font-bold text-accent tabular-nums">{stat}</p>
              <p className="mt-1 text-[0.65rem] text-fg-muted">{label}</p>
              <div className="mx-auto mt-2 flex h-6 items-end justify-center gap-0.5">
                {[40, 70, 55, 90].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-sm bg-accent/40"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-fg">产品介绍</h3>
          <span className="text-[0.65rem] text-fg-subtle">Pro</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-fg text-xs font-bold text-surface">
              分
            </div>
            <div>
              <p className="text-sm font-medium text-fg">Atlas Workspace</p>
              <p className="text-xs text-fg-muted">把知识、项目和团队放进同一个工作台</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg">
            查看产品
          </span>
        </div>
      </article>
    </div>
  );
}

function Grouped() {
  return (
    <div className="p-5 sm:p-7 bg-surface">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-medium tracking-wider text-accent uppercase">Project</p>
          <h3 className="mt-1 text-lg font-bold text-fg">知识库改版</h3>
          <p className="mt-1 text-xs text-fg-muted">12 个任务 · 8 人协作 · 进行中</p>
        </div>
        <div className="w-36">
          <div className="mb-1 flex justify-between text-[0.65rem] text-fg-muted">
            <span>进度</span>
            <span className="tabular-nums font-mono">62%</span>
          </div>
          <MiniBar value={62} />
        </div>
      </header>

      <div className="mt-7 grid grid-cols-3 gap-0 border-y border-border">
        {[
          ["24K", "访问量"],
          ["68%", "完成率"],
          ["+32", "新成员"],
        ].map(([stat, label], i) => (
          <div
            key={label}
            className={`py-5 text-center ${i > 0 ? "border-l border-border" : ""}`}
          >
            <p className="text-2xl font-bold text-accent tabular-nums">{stat}</p>
            <p className="mt-1 text-xs text-fg-muted">{label}</p>
          </div>
        ))}
      </div>

      <section className="mt-7">
        <p className="text-[0.65rem] font-medium tracking-wider text-accent uppercase">Product</p>
        <h3 className="mt-2 text-lg font-bold text-fg">Atlas Workspace</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-fg-muted">
          把知识、项目和团队放进同一个工作台。介绍是上下承接的叙述，不必再套一张产品卡。
        </p>
      </section>
    </div>
  );
}

export function DefaultCardsDemo({ mode }: { mode: GroupMode }) {
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
