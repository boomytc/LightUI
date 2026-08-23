import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PLUGIN_ACTIONS, PLUGIN_DOC, PLUGIN_FAKE, type PluginAction } from "../lib/fixtures";
import { KINDS } from "../lib/kinds";
import { pick, useLocale } from "../lib/site-locale";
import { Window } from "./Frame";

type Toolbar = {
  x: number;
  y: number;
  range: Range;
  below: boolean;
};

export function PluginDemo({ open = false }: { open?: boolean }) {
  const locale = useLocale();
  const meta = KINDS[2]!;
  const rootRef = useRef<HTMLDivElement>(null);
  const [toolbar, setToolbar] = useState<Toolbar | null>(null);
  const [lockPos, setLockPos] = useState({ x: 120, y: 118, below: false });

  useLayoutEffect(() => {
    if (!open) return;
    const root = rootRef.current;
    const hit = root?.querySelector("[data-plugin-hit]");
    if (!root || !hit) return;
    const rect = hit.getBoundingClientRect();
    const host = root.getBoundingClientRect();
    const localTop = rect.top - host.top;
    const below = localTop <= 64;
    setLockPos({
      x: Math.min(Math.max(rect.left + rect.width / 2 - host.left, 64), Math.max(64, host.width - 64)),
      y: below ? rect.bottom - host.top + 8 : localTop,
      below,
    });
  }, [open, locale]);

  useEffect(() => {
    if (open) return;
    function onMouseUp(e: MouseEvent) {
      const root = rootRef.current;
      if (!root) return;
      const target = e.target;
      if (target instanceof Element && target.closest("[data-plugin-bar]")) return;
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setToolbar(null);
        return;
      }
      const range = sel.getRangeAt(0);
      if (!root.contains(range.commonAncestorContainer)) {
        setToolbar(null);
        return;
      }
      if (!sel.toString().trim()) {
        setToolbar(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      const host = root.getBoundingClientRect();
      const localTop = rect.top - host.top;
      const below = localTop <= 64;
      setToolbar({
        x: Math.min(Math.max(rect.left + rect.width / 2 - host.left, 64), Math.max(64, host.width - 64)),
        y: below ? rect.bottom - host.top + 8 : localTop,
        range: range.cloneRange(),
        below,
      });
    }
    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
  }, [open]);

  function run(action: PluginAction) {
    const text = pick(PLUGIN_FAKE[action], locale);
    if (open) {
      const hit = rootRef.current?.querySelector("[data-plugin-hit]");
      if (hit) hit.textContent = text;
      return;
    }
    if (!toolbar) return;
    try {
      toolbar.range.deleteContents();
      toolbar.range.insertNode(document.createTextNode(text));
    } catch {
      /* range may be stale */
    }
    window.getSelection()?.removeAllRanges();
    setToolbar(null);
  }

  const showBar = open || toolbar != null;

  return (
    <Window title={pick(meta.window, locale)}>
      <div ref={rootRef} className="relative h-full min-w-0 overflow-hidden">
        <article data-plugin-doc className="chrome-doc h-full min-w-0 overflow-auto overflow-x-hidden px-5 py-5">
          <div className="max-w-2xl">
            <p className="text-[10px] tracking-widest text-accent">{pick(PLUGIN_DOC.kicker, locale)}</p>
            <h2 className="mt-2 text-[1.2rem] font-semibold tracking-tight">{pick(PLUGIN_DOC.title, locale)}</h2>
            <p className="mt-0.5 text-[11px] text-fg-subtle">{pick(PLUGIN_DOC.meta, locale)}</p>
            <hr className="my-3 border-border" />
            <div className="space-y-3 text-[13px] leading-7 text-fg">
              <p>
                <span data-plugin-hit className={open ? "chrome-plugin-hit" : undefined}>
                  {pick(PLUGIN_DOC.hit, locale)}
                </span>{" "}
                {pick(PLUGIN_DOC.afterHit, locale)}
              </p>
              {PLUGIN_DOC.paras.map((para) => (
                <p key={para.zh}>{pick(para, locale)}</p>
              ))}
              <p className="text-[11px] text-fg-subtle">{pick(PLUGIN_DOC.hint, locale)}</p>
            </div>
          </div>
        </article>

        {showBar ? (
          <div
            data-plugin-bar
            className="chrome-plugin-bar"
            data-above={(open ? lockPos.below : toolbar?.below) ? "false" : "true"}
            style={
              open
                ? { left: lockPos.x, top: lockPos.below ? lockPos.y : lockPos.y - 8 }
                : { left: toolbar!.x, top: toolbar!.below ? toolbar!.y : toolbar!.y - 8 }
            }
          >
            <div className="flex items-center gap-0.5 rounded-lg border border-accent/30 bg-surface px-1 py-1 shadow-card">
              {PLUGIN_ACTIONS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => run(a.id)}
                  className="rounded-md px-2 py-1 text-[11px] text-fg hover:bg-accent hover:text-accent-fg"
                >
                  {locale === "en" ? a.en : a.zh}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Window>
  );
}
