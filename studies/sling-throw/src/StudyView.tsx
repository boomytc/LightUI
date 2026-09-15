import { useState } from "react";
import { SlingTrack } from "./SlingTrack";
import { DEMO_VALUE, type SlingKind } from "./lib/machines";

const KINDS: { id: SlingKind; label: string; hint: string }[] = [
  { id: "sling", label: "弹弓落地", hint: "离轨变成抛体，落点即新值" },
  { id: "clamp", label: "离轨夹回", hint: "丢掉 Y，只能沿轨道蹭" },
];

export function StudyView() {
  const [kind, setKind] = useState<SlingKind>("sling");
  const [value, setValue] = useState(DEMO_VALUE);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-wider text-accent uppercase">Sling throw</p>
        <h1 className="text-2xl font-bold tracking-tight text-fg md:text-3xl">
          离轨是一次抛掷，不是夹回一维
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-fg-muted">
          沿轨道拖，值跟 X。竖向离开超过 14px（上或下），进入弹弓：拉力决定水平速度，竖直速度保证回到轨道。松手把球送到抛物线与轨道的交点，再按 step 量化。
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {KINDS.map((item) => {
          const on = kind === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setKind(item.id)}
              className={`rounded-full border px-3 py-1.5 text-[13px] transition-colors ${
                on
                  ? "border-fg bg-fg text-bg"
                  : "border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <p className="text-[13px] text-fg-subtle">{KINDS.find((k) => k.id === kind)?.hint}</p>

      <SlingTrack kind={kind} value={value} onChange={setValue} />

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          {
            n: "1",
            title: "14px 离轨",
            body: "竖向离开不足 14px 仍锁在轨道上。超过才进入弹弓，避免普通微调误抛。",
          },
          {
            n: "2",
            title: "落点是交点",
            body: "水平速度反向拉力；竖直速度保证回到轨道。X 夹在两端，再量化。",
          },
          {
            n: "3",
            title: "拉着就能看见",
            body: "叉带和虚线轨迹标出将要落地的值。松手才飞过去。",
          },
        ].map((item) => (
          <div key={item.n} className="rounded-2xl border border-border bg-surface px-4 py-4 shadow-card">
            <span className="inline-grid size-6 place-items-center rounded-md bg-fg text-[11px] font-semibold text-bg">
              {item.n}
            </span>
            <h2 className="mt-3 text-[15px] font-semibold">{item.title}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{item.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
