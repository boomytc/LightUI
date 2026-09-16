import { Check } from "lucide-react";
import { emptyAction, type EmptyCause } from "../lib/machines";
import { useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import type { WorkspaceAction, WorkspaceState } from "../lib/workspace";

export function FollowUps({
  locked,
  state,
  cause,
  run,
}: {
  locked: boolean;
  state: WorkspaceState;
  cause: EmptyCause;
  run: (action: WorkspaceAction) => void;
}) {
  const locale = useLocale();
  const action = emptyAction(cause);
  const today = state.followUps.filter((item) => !item.done);
  const history = state.followUps.filter((item) => item.done);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-4 pt-4 pb-2">
        <h2 className="text-[15px] font-medium">
          {locale === "en" ? `Today ${today.length}` : `今日待跟进 ${today.length}`}
        </h2>
        <div className="mt-3 flex gap-4 text-[12px]">
          {(
            [
              ["today", locale === "en" ? "Today" : "今日待办"],
              ["history", locale === "en" ? "History" : "历史记录"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => run({ type: "followTab", tab: id })}
              className={cn(
                "h-8 border-b-2",
                state.followTab === id
                  ? "border-accent font-medium text-fg"
                  : "border-transparent text-fg-muted hover:text-fg",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-6">
        {state.followTab === "today" ? (
          action === "create" ? (
            <FollowFirstUse locked={locked} run={run} />
          ) : action === "celebrate" ? (
            <AllDone />
          ) : (
            <ul className="space-y-2 pt-2" data-region="list">
              {today.map((item) => (
                <li
                  key={item.id}
                  className="empty-row rounded-xl border border-border bg-surface-2 px-4 py-4"
                >
                  <p className="text-[13px] font-medium">
                    {locale === "en" ? item.titleEn : item.titleZh}
                  </p>
                  {locked ? null : (
                    <button
                      type="button"
                      onClick={() => run({ type: "complete", id: item.id })}
                      className="mt-3 rounded-full bg-fg px-3 py-1 text-[11px] font-medium text-surface"
                    >
                      {locale === "en" ? "Mark done" : "标记完成"}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )
        ) : history.length === 0 ? (
          <p className="pt-8 text-center text-[13px] text-fg-muted">
            {locale === "en" ? "No completed records yet" : "还没有已完成的记录"}
          </p>
        ) : (
          <ul className="pt-1" data-region="history">
            {history.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 border-b border-border py-3 text-[13px]"
              >
                <span>{locale === "en" ? item.titleEn : item.titleZh}</span>
                <span className="text-fg-muted">{locale === "en" ? "Done" : "已完成"}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FollowFirstUse({
  locked,
  run,
}: {
  locked: boolean;
  run: (action: WorkspaceAction) => void;
}) {
  const locale = useLocale();
  return (
    <div className="empty-occupy empty-enter px-4 py-8" data-region="empty">
      <h3 className="text-[15px] font-semibold tracking-tight">
        {locale === "en" ? "No follow-ups yet" : "还没有跟进任务"}
      </h3>
      <p className="mt-1.5 max-w-[16rem] text-[13px] leading-relaxed text-fg-muted">
        {locale === "en"
          ? "Follow-ups start after the first customer. This is not “no data” — it has not begun."
          : "先有客户，才有今日待办。这不是「暂无数据」，是还没开始。"}
      </p>
      <button
        type="button"
        disabled={locked}
        onClick={() => run({ type: "composeFromFollowups" })}
        className="mt-5 rounded-full bg-fg px-3.5 py-1.5 text-[12px] font-medium text-surface disabled:opacity-100"
      >
        {locale === "en" ? "Add the first customer" : "添加第一位客户"}
      </button>
    </div>
  );
}

function AllDone() {
  const locale = useLocale();
  return (
    <div className="empty-occupy empty-enter px-4 py-8" data-region="empty">
      <span className="empty-check" aria-hidden="true">
        <Check className="size-6" strokeWidth={1.75} />
      </span>
      <h3 className="mt-4 text-[15px] font-semibold tracking-tight">
        {locale === "en" ? "Today’s follow-ups are done" : "今天的跟进已全部完成"}
      </h3>
      <p className="mt-1.5 text-[13px] text-fg-muted">
        {locale === "en"
          ? "Completed records stay on the history tab"
          : "已完成的记录仍可在历史中查看"}
      </p>
    </div>
  );
}
