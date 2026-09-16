import { useCallback, useEffect, useReducer, useRef } from "react";
import { KINDS } from "../lib/kinds";
import {
  emptyAction,
  showsPrimaryCta,
  visibleCustomers,
  type KindId,
} from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import {
  causeOf,
  reduceWorkspace,
  sceneSeed,
  type WorkspaceAction,
} from "../lib/workspace";
import { Customers } from "./Customers";
import { FollowUps } from "./FollowUps";
import { Window } from "./Frame";

export function KindDemo({ id, locked = false }: { id: KindId; locked?: boolean }) {
  const locale = useLocale();
  const meta = KINDS.find((kind) => kind.id === id) ?? KINDS[0]!;
  const [state, dispatch] = useReducer(reduceWorkspace, id, sceneSeed);
  const loadToken = useRef(0);
  const cause = causeOf(state);
  const action = emptyAction(cause);
  const visible = visibleCustomers(state.customers, state.query, state.filters);
  const pending = state.followUps.filter((item) => !item.done).length;

  useEffect(() => {
    return () => {
      loadToken.current += 1;
    };
  }, []);

  const run = useCallback(
    (next: WorkspaceAction) => {
      if (locked) return;
      dispatch(next);
    },
    [locked],
  );

  function retry() {
    if (locked) return;
    const token = ++loadToken.current;
    dispatch({ type: "loadStatus", status: "loading" });
    window.setTimeout(() => {
      if (token !== loadToken.current) return;
      dispatch({ type: "loadStatus", status: "success" });
      window.setTimeout(() => {
        if (token !== loadToken.current) return;
        dispatch({ type: "loadStatus", status: "idle" });
      }, 1400);
    }, 900);
  }

  const header =
    state.view === "customers" && !showsPrimaryCta(cause) && !locked ? (
      <button
        type="button"
        onClick={() => run({ type: "openComposer" })}
        className="rounded-full bg-fg px-2.5 py-1 text-[11px] font-medium text-surface"
      >
        {locale === "en" ? "Add" : "添加客户"}
      </button>
    ) : undefined;

  return (
    <Window title={pick(meta.window, locale)} action={header}>
      <div
        className="empty-body"
        data-kind={id}
        data-cause={cause}
        data-action={action}
        data-locked={locked ? "true" : undefined}
      >
        {locked ? null : (
          <nav
            className="hidden w-36 shrink-0 flex-col border-r border-border bg-surface-2 px-2.5 py-3 sm:flex"
            aria-label={locale === "en" ? "Workspace" : "工作台导航"}
          >
            <p className="px-2 text-[10px] font-medium tracking-wide text-fg-subtle uppercase">
              {locale === "en" ? "Workspace" : "客户工作台"}
            </p>
            <ul className="mt-2 space-y-1">
              {(
                [
                  ["customers", locale === "en" ? "Customers" : "客户列表"],
                  [
                    "followups",
                    pending > 0
                      ? locale === "en"
                        ? `Follow-ups ${pending}`
                        : `今日跟进 ${pending}`
                      : locale === "en"
                        ? "Follow-ups"
                        : "今日跟进",
                  ],
                ] as const
              ).map(([view, label]) => (
                <li key={view}>
                  <button
                    type="button"
                    onClick={() => run({ type: "setView", view })}
                    className={cn(
                      "flex h-9 w-full items-center rounded-md px-2 text-left text-[12px]",
                      state.view === view
                        ? "bg-accent-soft font-medium text-fg"
                        : "text-fg-muted hover:bg-surface hover:text-fg",
                    )}
                    aria-current={state.view === view ? "page" : undefined}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {state.view === "customers" ? (
            <Customers
              locked={locked}
              state={state}
              cause={cause}
              visible={visible}
              run={run}
              onRetry={retry}
            />
          ) : (
            <FollowUps locked={locked} state={state} cause={cause} run={run} />
          )}
        </div>
      </div>
    </Window>
  );
}
