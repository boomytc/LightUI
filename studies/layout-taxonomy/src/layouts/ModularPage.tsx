import { useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { GripVertical } from "lucide-react";
import { MODULAR_CARDS } from "../lib/fixtures";
import { moveModule } from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
export function ModularPage() {
  const locale = useLocale();
  const [order, setOrder] = useState(() =>
    MODULAR_CARDS.map((card) => card.id),
  );
  const [drag, setDrag] = useState<{
    id: string;
    target: string;
    pointer: number;
  } | null>(null);
  const dragRef = useRef<typeof drag>(null);
  const [notice, setNotice] = useState("");
  const list = useRef<HTMLUListElement>(null);
  const focus = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (!focus.current) return;
    list.current
      ?.querySelector<HTMLButtonElement>(`[data-handle="${focus.current}"]`)
      ?.focus({ preventScroll: true });
    focus.current = null;
  }, [order]);
  function move(id: string, target: string) {
    const from = order.indexOf(id),
      to = order.indexOf(target);
    if (from === to) return;
    focus.current = id;
    setOrder((prev) =>
      moveModule(prev, prev.indexOf(id), prev.indexOf(target)),
    );
    setNotice(
      locale === "en"
        ? `Moved to position ${to + 1}`
        : `已移动到第 ${to + 1} 位`,
    );
  }
  function end(event: PointerEvent<HTMLButtonElement>, commit: boolean) {
    const current = dragRef.current;
    if (current?.pointer !== event.pointerId) return;
    if (commit) move(current.id, current.target);
    dragRef.current = null;
    setDrag(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }
  return (
    <div className="layout-fill-page p-4">
      <h3 className="mb-2 shrink-0 text-lg font-semibold">
        {locale === "en" ? "One idea per module" : "一块一个主意"}
      </h3>
      <p className="mb-3 shrink-0 text-xs text-fg-muted">
        {locale === "en"
          ? "Drag a handle onto another card. Arrow keys reorder; release commits, cancel keeps the order."
          : "拖手柄到另一块，松手换序；方向键也能调整。取消拖动保留原顺序。"}
      </p>
      <ul
        ref={list}
        data-module-order={order.join(",")}
        className="layout-modular"
      >
        {order.map((id) => {
          const card = MODULAR_CARDS.find((item) => item.id === id)!;
          return (
            <li
              key={id}
              data-module={id}
              className={`flex h-full min-h-0 min-w-0 flex-col rounded-xl border bg-surface p-3 ${drag?.target === id ? "border-accent ring-1 ring-accent" : "border-border"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold">
                  {pick(card.title, locale)}
                </h4>
                <button
                  type="button"
                  data-handle={id}
                  aria-label={
                    locale === "en"
                      ? `Reorder ${pick(card.title, locale)}`
                      : `重排${pick(card.title, locale)}`
                  }
                  className="grid size-8 shrink-0 touch-none place-items-center rounded cursor-grab text-fg-muted focus-visible:ring-2 focus-visible:ring-accent"
                  onPointerDown={(event) => {
                    if (event.button !== 0 || !event.isPrimary) return;
                    event.preventDefault();
                    event.currentTarget.focus();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    dragRef.current = {
                      id,
                      target: id,
                      pointer: event.pointerId,
                    };
                    setDrag(dragRef.current);
                  }}
                  onPointerMove={(event) => {
                    const current = dragRef.current;
                    if (!current || current.pointer !== event.pointerId) return;
                    const target = Array.from(
                      list.current?.querySelectorAll<HTMLElement>(
                        "[data-module]",
                      ) ?? [],
                    ).find((el) => {
                      const box = el.getBoundingClientRect();
                      return (
                        event.clientX >= box.left &&
                        event.clientX <= box.right &&
                        event.clientY >= box.top &&
                        event.clientY <= box.bottom
                      );
                    });
                    dragRef.current = {
                      ...current,
                      target: target?.dataset.module ?? current.id,
                    };
                    setDrag(dragRef.current);
                  }}
                  onPointerUp={(event) => end(event, true)}
                  onPointerCancel={(event) => end(event, false)}
                  onLostPointerCapture={() => {
                    dragRef.current = null;
                    setDrag(null);
                  }}
                  onKeyDown={(event) => {
                    if (dragRef.current) return;
                    const delta =
                      event.key === "ArrowLeft" || event.key === "ArrowUp"
                        ? -1
                        : event.key === "ArrowRight" ||
                            event.key === "ArrowDown"
                          ? 1
                          : 0;
                    if (!delta) return;
                    event.preventDefault();
                    event.stopPropagation();
                    const target = order[order.indexOf(id) + delta];
                    if (target) move(id, target);
                  }}
                >
                  <GripVertical className="size-4" />
                </button>
              </div>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-fg-muted">
                {pick(card.body, locale)}
              </p>
              <p className="mt-auto pt-3 text-xs font-medium text-accent">
                {pick(card.action, locale)}
              </p>
            </li>
          );
        })}
      </ul>
      <p
        aria-live="polite"
        className="mt-2 min-h-4 shrink-0 text-xs text-fg-muted"
      >
        {notice}
      </p>
    </div>
  );
}
