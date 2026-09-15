import { useState } from "react";
import { ConeField } from "./ConeField";
import {
  DEFAULT_BEAM_WIDTH,
  DEMO_SECRET,
  type RevealKind,
} from "./lib/machines";
import "./cone-reveal.css";

const KINDS: { id: RevealKind; label: string; hint: string }[] = [
  { id: "cone", label: "锥光", hint: "角域覆盖，只有碰到的字现身" },
  { id: "toggle", label: "整段揭开", hint: "一个布尔，一次看完整密" },
  { id: "nearest", label: "最近一格", hint: "最近邻跳格，读不成词" },
];

export function StudyView() {
  const [kind, setKind] = useState<RevealKind>("cone");
  const [awake, setAwake] = useState(true);
  const [secret, setSecret] = useState(DEMO_SECRET);
  const [beamWidth, setBeamWidth] = useState(DEFAULT_BEAM_WIDTH);
  const [followPointer, setFollowPointer] = useState(true);
  const [autoSearch, setAutoSearch] = useState(() =>
    typeof window === "undefined"
      ? true
      : !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const cone = kind === "cone";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-wider text-accent uppercase">Cone reveal</p>
        <h1 className="text-2xl font-bold tracking-tight text-fg md:text-3xl">
          密文只让锥光碰到的字现身
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-fg-muted">
          灯座抬在输入框右上方，近字和远字对原点的张角才拉开。每帧对每个字形中心做锥覆盖：角差、距离、软边、阈值。锥外是圆点，锥内是字符。整段揭开和最近一格是对照。
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

      <ConeField
        kind={kind}
        awake={awake}
        beamWidth={beamWidth}
        followPointer={followPointer}
        autoSearch={autoSearch}
        secret={secret}
        editable
        onSecretChange={setSecret}
        onAwakeChange={setAwake}
      />

      <div className="grid gap-4 rounded-2xl border border-border bg-surface p-4 shadow-card sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-2">
          <span className="flex items-baseline justify-between text-[13px] text-fg-muted">
            <span>光束全角</span>
            <span className="font-mono tabular-nums text-fg-subtle">{Math.round(beamWidth)}°</span>
          </span>
          <input
            className="cone-range"
            type="range"
            min={18}
            max={56}
            value={beamWidth}
            disabled={!cone}
            onChange={(e) => setBeamWidth(Number(e.target.value))}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-[13px]">
          <span className="text-fg-muted">跟随指针</span>
          <input
            type="checkbox"
            checked={followPointer}
            disabled={!cone}
            onChange={(e) => setFollowPointer(e.target.checked)}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-[13px]">
          <span className="text-fg-muted">自动巡扫</span>
          <input
            type="checkbox"
            checked={autoSearch}
            disabled={!cone}
            onChange={(e) => setAutoSearch(e.target.checked)}
          />
        </label>
        <p className="text-[12px] leading-relaxed text-fg-subtle sm:col-span-2 lg:col-span-1">
          全角默认 34°（半角 17°）。判定锥是绘制锥的 0.72。
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          {
            n: "1",
            title: "灯座抬离基线",
            body: "原点在右上方。近字和远字张角不同，锥才能切开这一行。",
          },
          {
            n: "2",
            title: "软边 + 收窄",
            body: "半角外留 0.22 软边；判定锥再收到 0.72，擦边不算明文。",
          },
          {
            n: "3",
            title: "追角，不跳格",
            body: "指针或巡扫给出目标角，指数平滑跟上。最近邻一格是另一问。",
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
