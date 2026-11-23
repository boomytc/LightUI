import { useState } from "react";
import { SlingTrack } from "./SlingTrack";
import { DEMO_VALUE, type SlingKind } from "./lib/machines";
import { loc, pick, useLocale, type Localized } from "./lib/site-locale";

const KINDS: { id: SlingKind; label: Localized; hint: Localized }[] = [
  {
    id: "sling",
    label: loc("弹弓落地", "Sling throw"),
    hint: loc("离轨变成抛体，落点即新值", "Pulling off-track launches a projectile; landing sets the value"),
  },
  {
    id: "clamp",
    label: loc("离轨夹回", "Clamped 1D"),
    hint: loc("丢掉 Y，只能沿轨道蹭", "Discards Y and clamps movement strictly to the rail"),
  },
];

const CARDS: { n: string; title: Localized; body: Localized }[] = [
  {
    n: "1",
    title: loc("14px 离轨", "14px breakaway"),
    body: loc(
      "竖向离开不足 14px 仍锁在轨道上。超过才进入弹弓，避免普通微调误抛。",
      "Vertical drift under 14px stays locked to the rail. Crossing the threshold enters sling mode so fine adjustments never misfire.",
    ),
  },
  {
    n: "2",
    title: loc("落点是交点", "Landing is the intersection"),
    body: loc(
      "水平速度反向拉力；竖直速度保证回到轨道。X 夹在两端，再量化。",
      "Horizontal velocity opposes the pull; vertical velocity returns the ball to the rail. Landing X is clamped and quantized to step.",
    ),
  },
  {
    n: "3",
    title: loc("拉着就能看见", "Preview while pulling"),
    body: loc(
      "叉带和虚线轨迹标出将要落地的值。松手才飞过去。",
      "Bands and a dashed arc preview the target value while pulling. Release launches the flight.",
    ),
  },
];

export function StudyView() {
  const locale = useLocale();
  const en = locale === "en";
  const [kind, setKind] = useState<SlingKind>("sling");
  const [value, setValue] = useState(DEMO_VALUE);
  const activeKind = KINDS.find((k) => k.id === kind) ?? KINDS[0]!;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-wider text-accent uppercase">Sling throw</p>
        <h1 className="text-2xl font-bold tracking-tight text-fg md:text-3xl">
          {en ? "Pulling off the rail is a throw, not a 1D clamp" : "离轨是一次抛掷，不是夹回一维"}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-fg-muted">
          {en
            ? "Drag along the rail and the value follows X. Pull more than 14px vertically (up or down) to enter sling mode: tension sets horizontal velocity while vertical velocity guarantees a return to the rail. Releasing sends the ball to the trajectory intersection and quantizes by step."
            : "沿轨道拖，值跟 X。竖向离开超过 14px（上或下），进入弹弓：拉力决定水平速度，竖直速度保证回到轨道。松手把球送到抛物线与轨道的交点，再按 step 量化。"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {KINDS.map((item) => {
          const on = kind === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={on}
              onClick={() => setKind(item.id)}
              className={`rounded-full border px-3 py-1.5 text-[13px] transition-colors ${
                on
                  ? "border-fg bg-fg text-bg"
                  : "border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg"
              }`}
            >
              {pick(item.label, locale)}
            </button>
          );
        })}
      </div>
      <p className="text-[13px] text-fg-subtle">{pick(activeKind.hint, locale)}</p>

      <SlingTrack kind={kind} value={value} onChange={setValue} />

      <section className="grid gap-3 sm:grid-cols-3">
        {CARDS.map((item) => (
          <div key={item.n} className="rounded-2xl border border-border bg-surface px-4 py-4 shadow-card">
            <span className="inline-grid size-6 place-items-center rounded-md bg-fg text-[11px] font-semibold text-bg">
              {item.n}
            </span>
            <h2 className="mt-3 text-[15px] font-semibold">{pick(item.title, locale)}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{pick(item.body, locale)}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
