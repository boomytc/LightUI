import { useEffect, useState } from "react";
import { ConeField } from "./ConeField";
import {
  DEFAULT_BEAM_WIDTH,
  DEMO_SECRET,
  type RevealKind,
} from "./lib/machines";
import { loc, pick, useLocale, type Localized } from "./lib/site-locale";
import "./cone-reveal.css";

const KINDS: { id: RevealKind; label: Localized; hint: Localized }[] = [
  {
    id: "cone",
    label: loc("锥光", "Cone beam"),
    hint: loc("角域覆盖，只有碰到的字现身", "Angular coverage — only touched glyphs appear"),
  },
  {
    id: "toggle",
    label: loc("整段揭开", "Full toggle"),
    hint: loc("一个布尔，一次看完整密", "One boolean — reveals the whole secret at once"),
  },
  {
    id: "nearest",
    label: loc("最近一格", "Nearest glyph"),
    hint: loc("最近邻跳格，读不成词", "Snaps to the single nearest cell — hard to read a word"),
  },
];

const CARDS: { n: string; title: Localized; body: Localized }[] = [
  {
    n: "1",
    title: loc("灯座抬离基线", "Lift the lamp off the baseline"),
    body: loc(
      "原点在右上方。近字和远字张角不同，锥才能切开这一行。",
      "Raising the origin to the upper right separates the angular span of near and far glyphs so the cone can slice the row.",
    ),
  },
  {
    n: "2",
    title: loc("软边 + 收窄", "Soft edge + tighter hit cone"),
    body: loc(
      "半角外留 0.22 软边；判定锥再收到 0.72，擦边不算明文。",
      "Keep a 0.22 soft feather outside the half-angle, while tightening the reveal test to 0.72 so grazed glyphs stay masked.",
    ),
  },
  {
    n: "3",
    title: loc("追角，不跳格", "Chase the angle, not the cell"),
    body: loc(
      "指针或巡扫给出目标角，指数平滑跟上。最近邻一格是另一问。",
      "Pointer or sweep supplies a target angle and exponential smoothing follows it. Nearest-cell snapping is a different problem.",
    ),
  },
];

export function StudyView() {
  const locale = useLocale();
  const en = locale === "en";
  const [kind, setKind] = useState<RevealKind>("cone");
  const [awake, setAwake] = useState(true);
  const [secret, setSecret] = useState(DEMO_SECRET);
  const [beamWidth, setBeamWidth] = useState(DEFAULT_BEAM_WIDTH);
  const [followPointer, setFollowPointer] = useState(true);
  const [reduced, setReduced] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [autoSearch, setAutoSearch] = useState(() => !reduced);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReduced(mq.matches);
      if (mq.matches) setAutoSearch(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const cone = kind === "cone";
  const activeKind = KINDS.find((k) => k.id === kind) ?? KINDS[0]!;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-wider text-accent uppercase">Cone reveal</p>
        <h1 className="text-2xl font-bold tracking-tight text-fg md:text-3xl">
          {en ? "Reveal only the glyphs touched by the cone" : "密文只让锥光碰到的字现身"}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-fg-muted">
          {en
            ? "Lifting the lamp above the right end separates angular spans between near and far characters. Each frame tests every glyph center against the cone: angle delta, distance, soft edge, and threshold. Bullets outside, characters inside. Full toggle and nearest-cell act as contrasts."
            : "灯座抬在输入框右上方，近字和远字对原点的张角才拉开。每帧对每个字形中心做锥覆盖：角差、距离、软边、阈值。锥外是圆点，锥内是字符。整段揭开和最近一格是对照。"}
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

      <ConeField
        kind={kind}
        awake={awake}
        beamWidth={beamWidth}
        followPointer={followPointer}
        autoSearch={autoSearch && !reduced}
        secret={secret}
        editable
        onSecretChange={setSecret}
        onAwakeChange={setAwake}
      />

      <div className="grid gap-4 rounded-2xl border border-border bg-surface p-4 shadow-card sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-2">
          <span className="flex items-baseline justify-between text-[13px] text-fg-muted">
            <span>{en ? "Beam full angle" : "光束全角"}</span>
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
          <span className="text-fg-muted">{en ? "Follow pointer" : "跟随指针"}</span>
          <input
            type="checkbox"
            checked={followPointer}
            disabled={!cone}
            onChange={(e) => setFollowPointer(e.target.checked)}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-[13px]">
          <span className="text-fg-muted">
            {en ? (reduced ? "Auto sweep (reduced)" : "Auto sweep") : reduced ? "自动巡扫（减动效已停）" : "自动巡扫"}
          </span>
          <input
            type="checkbox"
            checked={autoSearch && !reduced}
            disabled={!cone || reduced}
            onChange={(e) => setAutoSearch(e.target.checked)}
          />
        </label>
        <p className="text-[12px] leading-relaxed text-fg-subtle sm:col-span-2 lg:col-span-1">
          {en
            ? "Default full angle is 34° (17° half). Hit cone is 0.72 of the drawn beam."
            : "全角默认 34°（半角 17°）。判定锥是绘制锥的 0.72。"}
        </p>
      </div>

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
