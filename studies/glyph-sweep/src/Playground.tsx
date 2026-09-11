import { useState } from "react";
import { ShimmerLine } from "./ShimmerLine";
import { COMPARE_PATHS } from "./lib/kinds";
import {
  BOX_DURATION_S,
  BOX_SPREAD_PX,
  PER_CHAR_DEFAULT,
  STYLES,
  durationSeconds,
  isNaivePath,
  paceFromSecondsPerChar,
  secondsPerCharFromPace,
  type ShimmerStyle,
} from "./lib/shimmer";
import { pick, useLocale } from "./lib/site-locale";
import { useReducedMotion } from "./lib/use-reduced-motion";
import { cn } from "./lib/utils";
import "./sweep.css";

const DEFAULT_LINES = ["CSS is awesome, right?", "CSS is awesome", "Right?!", "CSS"];

const STYLE_LABEL: Record<ShimmerStyle, { zh: string; en: string }> = {
  classic: { zh: "单色", en: "Classic" },
  aurora: { zh: "极光", en: "Aurora" },
  flame: { zh: "火焰", en: "Flame" },
};

export function Playground() {
  const locale = useLocale();
  const reduced = useReducedMotion();
  const [style, setStyle] = useState<ShimmerStyle>("classic");
  const [pace, setPace] = useState(() => paceFromSecondsPerChar(PER_CHAR_DEFAULT));
  const [spread, setSpread] = useState(3);
  const angle = 295;
  const [park, setPark] = useState(false);
  const [position, setPosition] = useState(50);
  const [lines, setLines] = useState(DEFAULT_LINES);
  const secondsPerChar = secondsPerCharFromPace(pace);
  const running = !park && !reduced;

  return (
    <div className="min-w-0">
      <section className="min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">01 / 02</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">
              {locale === "en" ? "Follow glyphs vs sweep the box" : "跟字形 | 扫整块（错）"}
            </h2>
            <p className="mt-1 text-[14px] text-fg-muted">
              {locale === "en"
                ? "Same lines. Contrast is the path: letters, or the box."
                : "同一组字。对照的是路径：跟字形，还是扫整块。"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full border border-border bg-surface p-0.5">
              {(["run", "park"] as const).map((id) => {
                const on = id === "park" ? park : !park;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setPark(id === "park")}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                      on ? "bg-fg text-surface" : "text-fg-muted hover:text-fg",
                    )}
                  >
                    {id === "park"
                      ? locale === "en"
                        ? "Park"
                        : "停住"
                      : locale === "en"
                        ? "Run"
                        : "运转"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <fieldset className="rounded-2xl border border-border bg-surface px-3 py-2.5">
            <legend className="px-1 text-[11px] text-fg-subtle">
              {locale === "en" ? "Glyph skin" : "字形皮肤"}
            </legend>
            <div className="flex flex-wrap gap-1">
              {STYLES.map((id) => {
                const on = id === style;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setStyle(id)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors",
                      on ? "bg-fg text-surface" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                    )}
                  >
                    {locale === "en" ? STYLE_LABEL[id].en : STYLE_LABEL[id].zh}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <label className="block rounded-2xl border border-border bg-surface px-3 py-2.5 text-[12px] text-fg-muted">
            <span className="flex items-baseline justify-between gap-2">
              <span>{locale === "en" ? "Speed · glyphs only" : "速度 · 只改左边"}</span>
              <span className="font-mono text-[11px] text-fg-subtle">
                {locale === "en"
                  ? `${secondsPerChar.toFixed(2)}s / glyph`
                  : `每字 ${secondsPerChar.toFixed(2)}s`}
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={pace}
              onChange={(e) => setPace(Number(e.target.value))}
              className="mt-2 w-full accent-accent"
            />
          </label>
          <label className="block rounded-2xl border border-border bg-surface px-3 py-2.5 text-[12px] text-fg-muted">
            <span className="flex items-baseline justify-between gap-2">
              <span>{locale === "en" ? "Spread · glyphs only" : "宽度 · 只改左边"}</span>
              <span className="font-mono text-[11px] text-fg-subtle">{spread}ch</span>
            </span>
            <input
              type="range"
              min={1}
              max={8}
              step={0.5}
              value={spread}
              onChange={(e) => setSpread(Number(e.target.value))}
              className="mt-2 w-full accent-accent"
            />
          </label>
          {park ? (
            <label className="block rounded-2xl border border-border bg-surface px-3 py-2.5 text-[12px] text-fg-muted">
              <span className="flex items-baseline justify-between gap-2">
                <span>{locale === "en" ? "Position" : "位置"}</span>
                <span className="font-mono text-[11px] text-fg-subtle">{position}%</span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={position}
                onChange={(e) => setPosition(Number(e.target.value))}
                className="mt-2 w-full accent-accent"
              />
            </label>
          ) : (
            <p className="rounded-2xl border border-dashed border-border px-3 py-2.5 text-[12px] leading-relaxed text-fg-subtle">
              {locale === "en"
                ? "Speed and spread never move the box sheen. It stays 1.8s and 72px."
                : "速度和宽度动不了右边。盒子扫光锁在 1.8s、72px。"}
            </p>
          )}
        </div>

        {reduced ? (
          <p className="mb-4 text-[12px] leading-relaxed text-fg-subtle">
            {locale === "en"
              ? "Reduced motion: the glyph band sits still inside the letters. The box freezes a sheen on the face."
              : "已按系统设置停住扫光。左边高光停在字形里；右边冻在盒子表面。"}
          </p>
        ) : (
          <p className="mb-4 text-[14px] text-fg-muted">
            {locale === "en"
              ? "Click a line on the left to edit. Duration follows character count."
              : "点左边一行可以改字。时长跟着字数走。"}
          </p>
        )}

        <div className="gsweep-compare" data-layout="compare">
          {COMPARE_PATHS.map((meta) => {
            const wrong = isNaivePath(meta.id);
            return (
              <article key={meta.id} className="min-w-0" data-column={meta.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={cn(
                      "font-mono text-[12px] tabular-nums",
                      wrong ? "text-fg-subtle" : "text-accent",
                    )}
                  >
                    {meta.index}
                    {wrong ? (locale === "en" ? " · wrong" : " · 错") : ""}
                  </p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                      wrong ? "bg-wrong-soft text-wrong" : "bg-intent-soft text-intent",
                    )}
                  >
                    {wrong
                      ? locale === "en"
                        ? "Box"
                        : "跟块"
                      : locale === "en"
                        ? "Glyphs"
                        : "跟字"}
                  </span>
                </div>
                <h3 className="mt-1 text-[1.15rem] font-semibold tracking-tight">
                  {pick(meta.zh, locale)}
                </h3>
                <p className="mt-1 text-[13px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
                <div className="gsweep-well mt-4" data-tone={wrong ? "wrong" : "right"}>
                  <div className="gsweep-stack">
                    {lines.map((line, i) => (
                      <div key={`${meta.id}-${i}`} className="min-w-0">
                        <ShimmerLine
                          text={line}
                          style={style}
                          secondsPerChar={secondsPerChar}
                          spread={spread}
                          angle={angle}
                          park={park || reduced}
                          position={position}
                          path={meta.id}
                          running={running}
                          editable={meta.id === "glyph"}
                          onChange={(text) => {
                            setLines((prev) => prev.map((row, j) => (j === i ? text : row)));
                          }}
                          onCommit={(text) => {
                            setLines((prev) => prev.map((row, j) => (j === i ? text : row)));
                          }}
                        />
                        <p className="mt-1 font-mono text-[11px] tabular-nums text-fg-subtle">
                          {wrong
                            ? locale === "en"
                              ? `${BOX_DURATION_S.toFixed(1)}s · ${BOX_SPREAD_PX}px · same for every line`
                              : `${BOX_DURATION_S.toFixed(1)}s · ${BOX_SPREAD_PX}px · 每行一样`
                            : locale === "en"
                              ? `${Math.max(line.length, 1)} glyphs · ${durationSeconds(line.length, secondsPerChar).toFixed(2)}s · ${spread}ch`
                              : `${Math.max(line.length, 1)} 字 · ${durationSeconds(line.length, secondsPerChar).toFixed(2)}s · ${spread}ch`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-[12px] leading-relaxed text-fg-subtle">
                  {pick(meta.tells, locale)}
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {meta.rules.map((rule) => (
                    <li
                      key={rule.zh}
                      className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-fg-muted"
                    >
                      {pick(rule, locale)}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
