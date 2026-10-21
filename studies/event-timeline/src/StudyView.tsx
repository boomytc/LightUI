import { useEffect, useReducer, useState } from "react";
import { Timeline } from "./Timeline";
import { EVENTS } from "./lib/fixtures";
import { initialState, transition } from "./lib/machines";
import { useLocale } from "./lib/site-locale";
export function StudyView() {
  const en = useLocale() === "en";
  const [state, dispatch] = useReducer(
    (
      state: ReturnType<typeof initialState>,
      action: Parameters<typeof transition>[1],
    ) => transition(state, action, EVENTS.length),
    EVENTS.length,
    initialState,
  );
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (reduced) {
      if (state.visible !== EVENTS.length || state.playing) dispatch({ type: "complete" });
      return;
    }
    if (!state.playing) return;
    const timer = window.setTimeout(
      () => dispatch({ type: "tick", run: state.run }),
      680,
    );
    return () => window.clearTimeout(timer);
  }, [reduced, state.playing, state.run, state.visible]);
  const complete = state.visible === EVENTS.length;
  return (
    <div className="page-width pb-20 pt-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        {en
          ? "A history is not a progress bar."
          : "发生过什么，不等于做到哪一步。"}
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-fg-muted">
        {en
          ? "Dates belong to events. Playback reveals them without changing their dates or completion."
          : "日期属于事件。播放只逐条展示，不改日期，也不把展示位置标成业务进度。"}
      </p>
      <div className="my-6 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={reduced || complete}
          onClick={() => dispatch({ type: state.playing ? "pause" : "play" })}
          className="rounded-full bg-fg px-4 py-2 text-sm text-surface disabled:opacity-40"
        >
          {state.playing ? (en ? "Pause" : "暂停") : en ? "Play" : "播放"}
        </button>
        <button
          type="button"
          disabled={reduced || complete}
          onClick={() => dispatch({ type: "next" })}
          className="rounded-full border border-border px-4 py-2 text-sm disabled:opacity-40"
        >
          {en ? "Next event" : "下一条"}
        </button>
        <button
          type="button"
          disabled={reduced}
          onClick={() => dispatch({ type: "restart" })}
          className="rounded-full border border-border px-4 py-2 text-sm disabled:opacity-40"
        >
          {en ? "Replay" : "重播"}
        </button>
      </div>
      <div className="max-w-xl rounded-2xl border border-border bg-surface p-5">
        <Timeline visible={reduced ? EVENTS.length : state.visible} />
      </div>
      <p aria-live="polite" className="mt-4 text-xs text-fg-muted">
        {en
          ? `${state.visible} of ${EVENTS.length} entries shown`
          : `已展示 ${state.visible} / ${EVENTS.length} 条事件`}
        {reduced
          ? en
            ? " · Reduced motion: all shown"
            : " · 减少动态效果：全部显示"
          : ""}
      </p>
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-fg-muted">
        {en
          ? "A task stepper has a destination. History can grow. The latest marker belongs to the last dated event, never to the playback cursor."
          : "任务步骤有终点，历史还会继续增长。最新标记属于最后一条日期事件，不能跟着播放游标走。"}
      </p>
    </div>
  );
}
