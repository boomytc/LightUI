import { useEffect, useMemo, useRef, useState } from "react";
import { SandboxStage } from "./components/SandboxStage";
import { playbackSteps, type Step } from "./lib/machines";
import { recordedSample } from "./lib/recorded-sample";
import { TEACHING_SOURCE } from "./lib/samples";

type SourceChoice = {
  id: string;
  label: string;
  note: string;
  source: string;
};

const SOURCES: SourceChoice[] = [
  {
    id: "teaching",
    label: "离线教学流",
    note: "手写样例，按字段顺序回放。页面不调用模型。",
    source: TEACHING_SOURCE,
  },
  ...(recordedSample
    ? [
        {
          id: "recorded",
          label: "DeepSeek 录制",
          note: `${recordedSample.model} · ${recordedSample.recordedOn}`,
          source: recordedSample.source,
        },
      ]
    : []),
];

export function StudyView() {
  const [sourceId, setSourceId] = useState(SOURCES[0]!.id);
  const choice = SOURCES.find((item) => item.id === sourceId) ?? SOURCES[0]!;
  const steps = useMemo(() => playbackSteps(choice.source), [choice.source]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const firstSource = useRef(true);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setIndex(reduce ? Math.max(0, steps.length - 1) : 0);
    setPlaying(!reduce);
    if (firstSource.current) {
      firstSource.current = false;
      return;
    }
    setResetKey((value) => value + 1);
  }, [steps]);

  useEffect(() => {
    if (!playing) return;
    if (index >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setIndex(index + 1), 70);
    return () => window.clearTimeout(timer);
  }, [playing, index, steps.length]);

  const step = steps[Math.min(index, steps.length - 1)] ?? steps[0];
  if (!step) return null;

  return (
    <div className="page-width min-w-0 pb-16 pt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-xl">
          <p className="text-[13px] leading-relaxed text-fg-muted">{choice.note}</p>
          {recordedSample ? null : (
            <p className="mt-1 text-[12px] text-fg-subtle">当前回放的是手写离线流，不是一次模型生成。</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {SOURCES.length > 1 ? (
            <div className="flex rounded-lg border border-border bg-surface-2/70 p-0.5">
              {SOURCES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`rounded-md px-2.5 py-1 text-[12px] ${
                    item.id === choice.id ? "bg-surface text-fg shadow-card" : "text-fg-muted"
                  }`}
                  onClick={() => setSourceId(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] text-fg"
            onClick={() => setPlaying((value) => !value)}
          >
            {playing ? "暂停" : "播放"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] text-fg"
            onClick={() => jump(index, nextBoundary(steps, index), setIndex, setResetKey)}
          >
            下一字段
          </button>
          <button
            type="button"
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] text-fg"
            onClick={() => {
              setPlaying(false);
              setIndex(0);
              setResetKey((value) => value + 1);
            }}
          >
            重头
          </button>
        </div>
      </div>

      <label className="mt-4 block text-[12px] text-fg-subtle">
        流进度 {index + 1} / {steps.length}
        <span className="ml-2 font-mono">{step.state.generating ? "generating" : "generating = false"}</span>
        <input
          className="mt-1 block w-full accent-[var(--color-accent)]"
          type="range"
          min={0}
          max={Math.max(0, steps.length - 1)}
          value={Math.min(index, steps.length - 1)}
          onChange={(event) => {
            const next = Number(event.target.value);
            jump(index, next, setIndex, setResetKey);
            setPlaying(false);
          }}
        />
      </label>

      <div className="mt-4">
        <SandboxStage key={resetKey} step={step} interactive />
      </div>

      <pre className="mt-4 max-h-40 overflow-auto rounded-xl border border-border bg-surface-2 p-3 font-mono text-[11px] leading-relaxed text-fg-muted">
        {choice.source.slice(0, step.at)}
        <span className="text-accent">▍</span>
      </pre>
    </div>
  );
}

function jump(
  current: number,
  next: number,
  setIndex: (value: number) => void,
  setResetKey: (value: (current: number) => number) => void,
) {
  if (next < current) setResetKey((value) => value + 1);
  setIndex(next);
}

function nextBoundary(steps: Step[], index: number): number {
  const flags = (step: Step) =>
    [
      step.state.initialHeightComplete,
      step.state.placeholderMessagesComplete,
      step.state.cssComplete,
      step.state.htmlComplete,
      step.state.jsFunctionsComplete,
      step.state.jsExpressionsComplete,
    ].join("");
  const here = flags(steps[index] ?? steps[0]!);
  for (let i = index + 1; i < steps.length; i += 1) {
    if (flags(steps[i]!) !== here) return i;
  }
  return steps.length - 1;
}
