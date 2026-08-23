import { useEffect, useState } from "react";
import { INITIAL_DRAFTS, type Draft } from "../lib/fixtures";
import { autoDismissMs, stageOn } from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import { AppNav, AvatarMark, Frame, Ghost } from "./Frame";

export function SnackbarDemo({ state }: { state?: string } = {}) {
  const locale = useLocale();
  const locked = state !== undefined && stageOn(state);
  const [drafts, setDrafts] = useState<Draft[]>(() =>
    locked ? INITIAL_DRAFTS.slice(1) : INITIAL_DRAFTS,
  );
  const [snack, setSnack] = useState<{ draft: Draft; index: number } | null>(() =>
    locked ? { draft: INITIAL_DRAFTS[0]!, index: 0 } : null,
  );

  useEffect(() => {
    if (!snack || locked) return;
    const id = window.setTimeout(() => setSnack(null), autoDismissMs("snackbar"));
    return () => window.clearTimeout(id);
  }, [snack, locked]);

  function remove(id: string) {
    const index = drafts.findIndex((d) => d.id === id);
    if (index < 0) return;
    const draft = drafts[index]!;
    setDrafts(drafts.filter((d) => d.id !== id));
    setSnack({ draft, index });
  }

  function undo() {
    if (!snack) {
      setSnack(null);
      return;
    }
    const next = drafts.slice();
    const at = Math.max(0, Math.min(snack.index, next.length));
    next.splice(at, 0, snack.draft);
    setDrafts(next);
    setSnack(null);
  }

  return (
    <Frame
      title={locale === "en" ? "Orbit · Drafts" : "Orbit · 草稿列表"}
      nav={
        <AppNav brand="Orbit">
          <AvatarMark mark="S" />
        </AppNav>
      }
    >
      <div className="px-6 py-6">
        <h2 className="text-[13px] font-semibold">{locale === "en" ? "Drafts" : "草稿列表"}</h2>
        <p className="mt-0.5 text-[11px] text-fg-muted">
          {locale === "en"
            ? `${drafts.length} pieces · last edit 18 Aug`
            : `${drafts.length} 篇 · 最近编辑 8月18日`}
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {drafts.map((draft) => (
            <li
              key={draft.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-surface-2 px-3 py-2.5"
            >
              <div className="min-w-0">
                <div className="truncate text-[13px]">{pick(draft.title, locale)}</div>
                <div className="text-[11px] text-fg-subtle">{pick(draft.time, locale)}</div>
              </div>
              <Ghost onClick={() => remove(draft.id)} className="shrink-0 px-2 text-accent hover:text-fg">
                {locale === "en" ? "Delete" : "删除"}
              </Ghost>
            </li>
          ))}
          {drafts.length === 0 ? (
            <li className="rounded-lg bg-surface-2 px-3 py-6 text-center text-[12px] text-fg-muted">
              {locale === "en" ? "No drafts" : "暂无草稿"}
            </li>
          ) : null}
        </ul>
        <p className="mt-3 text-[11px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Deletes immediately. Undo restores the row. No “are you sure?” first."
            : "立刻删除。撤销原位恢复。不要先弹「确定删除吗」。"}
        </p>
      </div>

      {snack ? (
        <div className="absolute inset-x-4 top-3 z-30">
          <div className="flex items-center justify-between gap-3 rounded-md bg-fg px-3 py-2 text-surface shadow-card">
            <span className="min-w-0 truncate text-[12px]">
              {locale === "en" ? "Draft deleted" : "草稿已删除"}
            </span>
            <button
              type="button"
              onClick={undo}
              className="shrink-0 text-[12px] font-medium text-accent-soft hover:text-accent-fg"
            >
              {locale === "en" ? "Undo" : "撤销"}
            </button>
          </div>
        </div>
      ) : null}
    </Frame>
  );
}
