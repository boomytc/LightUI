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
      <h1 className="text-3xl font-semibold tracking-tight">
        {en
          ? "Find what escapes before hiding it."
          : "先找谁越界，再修它的约束。"}
      </h1>
      <p className="mt-4 max-w-2xl text-fg-muted">
        {en
          ? "The same elements, three treatments. Hidden scrollbars do not mean repaired geometry."
          : "同一组内容，三种处理。滚动条消失，不代表宽度、收缩和断行约束已经修好。"}
      </p>
      <div
        className="my-6 flex flex-wrap gap-2"
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
            className={`rounded-full border px-4 py-2 text-sm ${mode === id ? "bg-fg text-surface" : "bg-surface"}`}
          >
            {en ? label : zh}
          </button>
        ))}
      </div>
      <label className="mb-5 flex max-w-md flex-wrap items-center gap-3 text-sm">
        {en ? "Container width" : "容器宽度"} {width}px
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
      <Fixture mode={mode} width={width} />
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
