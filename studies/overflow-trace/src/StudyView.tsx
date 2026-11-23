import { useState } from "react";
import { Fixture } from "./Fixture";
import type { Mode } from "./lib/machines";
import { useLocale } from "./lib/site-locale";

export function StudyView() {
  const en = useLocale() === "en";
  const [mode, setMode] = useState<Mode>("bug");
  const [width, setWidth] = useState(375);
  return (
    <div className="page-width min-w-0 pb-20 pt-6">
      <section className="grid gap-6 pb-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-12">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-[2.25rem] sm:leading-[1.15]">
            {en
              ? "Find what escapes before hiding it."
              : "先找谁越界，再修它的约束。"}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fg-muted">
            {en
              ? "The same elements, three treatments. Hidden scrollbars do not mean repaired geometry."
              : "同一组内容，三种处理。滚动条消失，不代表宽度、收缩和断行约束已经修好。"}
          </p>
        </div>
        <div className="flex flex-col gap-3 lg:items-end">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label={en ? "Treatment" : "处理方式"}
          >
            {(
              [
                ["bug", "原始越界", "Original"],
                ["hide", "仅隐藏", "Clip only"],
                ["fix", "修复根因", "Repair"],
              ] as const
            ).map(([id, zh, label]) => (
              <button
                type="button"
                key={id}
                aria-pressed={mode === id}
                onClick={() => setMode(id)}
                className={`rounded-full border border-border px-4 py-2 text-sm transition-colors ${mode === id ? "border-fg bg-fg text-surface" : "bg-surface text-fg hover:bg-surface-2"}`}
              >
                {en ? label : zh}
              </button>
            ))}
          </div>
          <label className="flex flex-wrap items-center gap-3 text-sm text-fg-muted">
            <span className="tabular-nums">
              {en ? "Container width" : "容器宽度"} {width}px
            </span>
            <input
              aria-label={en ? "Container width" : "容器宽度"}
              type="range"
              min="280"
              max="640"
              step="1"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
            />
          </label>
        </div>
      </section>

      <div className="flex min-w-0 flex-col items-center rounded-2xl border border-border bg-surface-2/60 p-4 sm:p-8">
        <Fixture mode={mode} width={width} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          [
            "测量",
            "Measure",
            "比较容器与候选元素的左右边界，红框指向具体责任元素。",
            "Compare container and candidate edges; outlines identify the owner.",
          ],
          [
            "约束",
            "Constrain",
            "宽度回到父级，文本可断行，标签可换行，定位落在边界内。",
            "Use parent width, break text, wrap tags, and bound positioned elements.",
          ],
          [
            "复测",
            "Measure again",
            "改变宽度仍应成立；不要靠遮住内容让报告归零。",
            "Resize and verify again. Do not hide content to claim success.",
          ],
        ].map(([zh, label, text, english]) => (
          <article
            key={label}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <h2 className="font-semibold">{en ? label : zh}</h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              {en ? english : text}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
