import type { GroupMode } from "../../lib/machines.js";

const BANDS = [
  {
    category: "团队沟通",
    style: "bg-accent-soft/50 dark:bg-accent-soft/10 border-accent/20",
    items: [
      { title: "任务讨论", body: "围绕特定任务上下文同步讨论与决策" },
      { title: "即时会话", body: "与协作者发起一对一或群组快速碰头" },
      { title: "评论提醒", body: "在设计稿与文档关键节点留下批注与反馈" },
    ],
  },
  {
    category: "项目进度",
    style: "bg-intent-soft/50 dark:bg-intent-soft/10 border-intent/20",
    items: [
      { title: "看板视图", body: "按状态列直观推进卡片流转与阻碍排查" },
      { title: "里程碑", body: "对齐核心交付节点与跨部门依赖排期" },
      { title: "甘特排期", body: "全局统筹资源负荷与工期缓冲预留" },
    ],
  },
  {
    category: "知识资料",
    style: "bg-surface-2 border-border",
    items: [
      { title: "共享文档", body: "沉淀结构化团队知识库与规范资产" },
      { title: "版本历史", body: "随时回溯每次关键修改与审计记录" },
      { title: "资产导出", body: "一键导出多格式产物用于跨系统归档" },
    ],
  },
];

function Cards() {
  return (
    <div className="p-5 sm:p-6 bg-surface-2/40">
      <h3 className="mb-3 text-sm font-semibold text-fg">团队协作（九张卡片便利贴）</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {BANDS.flatMap((band) => band.items).map((item) => (
          <article key={item.title} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-fg">{item.title}</h4>
            <p className="mt-1.5 text-xs leading-relaxed text-fg-muted">{item.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function Grouped() {
  return (
    <div className="p-5 sm:p-6 bg-surface">
      <h3 className="mb-4 text-lg font-bold text-fg">团队协作</h3>
      <div className="flex flex-col gap-3">
        {BANDS.map((band) => (
          <div
            key={band.category}
            className={`rounded-xl p-4 sm:p-5 border ${band.style}`}
          >
            <p className="mb-3 text-xs font-bold text-fg tracking-wide uppercase">
              {band.category}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {band.items.map((item) => (
                <div key={item.title}>
                  <h4 className="text-sm font-semibold text-fg">{item.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-fg-muted">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ColorBandsDemo({ mode }: { mode: GroupMode }) {
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
