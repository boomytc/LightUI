import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  edgeScrollDelta,
  insertIndexY,
  moveItem,
  type SlotBox,
} from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import type { StageLock } from "../lib/stage-query";
import { cn } from "../lib/utils";
import { TASKS, type Task } from "./fixtures";
import { Btn, CardFace, DemoShell } from "./Frame";
import { animateReversePath } from "./reverse-path";
import { ghostStyle, usePointerDrag, type DragLive } from "./use-pointer-drag";

type Origin = { top: number; height: number; stride: number };

function snapshotOrigins(
  ids: string[],
  els: Map<string, HTMLElement>,
  content: HTMLElement,
): { slots: SlotBox[]; origin: Map<string, Origin> } {
  const cTop = content.getBoundingClientRect().top;
  const slots: SlotBox[] = ids.map((id) => {
    const el = els.get(id);
    if (!el) return { id, top: 0, height: 0 };
    const r = el.getBoundingClientRect();
    return { id, top: r.top - cTop, height: r.height };
  });
  const origin = new Map<string, Origin>();
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i]!;
    const next = slots[i + 1];
    origin.set(slot.id, {
      top: slot.top,
      height: slot.height,
      stride: next ? next.top - slot.top : slot.height,
    });
  }
  return { slots, origin };
}

function yieldTranslate(
  id: string,
  dragId: string,
  insertAt: number,
  order: string[],
  origin: Map<string, Origin>,
): number {
  const remaining = order.filter((item) => item !== dragId);
  const i = remaining.indexOf(id);
  if (i < 0) return 0;
  const drag = origin.get(dragId);
  const box = origin.get(id);
  if (!drag || !box) return 0;
  const packedTop = box.top - (box.top > drag.top ? drag.stride : 0);
  const targetTop = packedTop + (i >= insertAt ? drag.stride : 0);
  return targetTop - box.top;
}

function holeTop(
  dragId: string,
  insertAt: number,
  order: string[],
  origin: Map<string, Origin>,
): number {
  const remaining = order.filter((item) => item !== dragId);
  const drag = origin.get(dragId);
  if (!drag) return 0;
  if (insertAt >= remaining.length) {
    if (remaining.length === 0) return drag.top;
    const last = origin.get(remaining[remaining.length - 1]!);
    if (!last) return drag.top;
    const packedTop = last.top - (last.top > drag.top ? drag.stride : 0);
    return packedTop + last.stride;
  }
  const box = origin.get(remaining[insertAt]!);
  if (!box) return drag.top;
  return box.top - (box.top > drag.top ? drag.stride : 0);
}

function reduceMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ReorderDemo({ compact = false, lock = "idle" }: { compact?: boolean; lock?: StageLock }) {
  const locale = useLocale();
  const locked = lock === "lift";
  const [items, setItems] = useState<Task[]>(TASKS);
  const [insertAt, setInsertAt] = useState(0);
  const [status, setStatus] = useState(() =>
    locale === "en" ? "Idle · drag a card 6px to lift" : "待机 · 拖一张卡，移动 6px 抬起",
  );
  const [returning, setReturning] = useState<DragLive | null>(null);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const itemEls = useRef(new Map<string, HTMLElement>());
  const slotsRef = useRef<SlotBox[] | null>(null);
  const originRef = useRef<Map<string, Origin> | null>(null);
  const lastTops = useRef<Map<string, number> | null>(null);
  const insertAtRef = useRef(0);
  const itemsRef = useRef(items);
  const liveRef = useRef<DragLive | null>(null);
  const pendingFlip = useRef<Map<string, number> | null>(null);
  const reverseStop = useRef<(() => void) | null>(null);
  itemsRef.current = items;
  insertAtRef.current = insertAt;

  function recomputeInsert(pointerY: number) {
    const content = contentRef.current;
    const slots = slotsRef.current;
    const session = liveRef.current;
    if (!content || !slots || !session) return;
    const y = pointerY - content.getBoundingClientRect().top;
    const next = insertIndexY(slots, y, session.id);
    setInsertAt((prev) => (prev === next ? prev : next));
  }

  const { live, bind } = usePointerDrag({
    disabled: locked,
    onLift: (session) => {
      const content = contentRef.current;
      if (!content) return;
      liveRef.current = session;
      const shot = snapshotOrigins(
        itemsRef.current.map((item) => item.id),
        itemEls.current,
        content,
      );
      slotsRef.current = shot.slots;
      originRef.current = shot.origin;
      lastTops.current = null;
      recomputeInsert(session.y);
      setStatus(
        locale === "en"
          ? "Lifted · others yield on the midline"
          : "已抬起 · 其余项按中线让洞",
      );
    },
    onMove: (session) => {
      liveRef.current = session;
      recomputeInsert(session.y);
    },
    onDrop: (session) => {
      liveRef.current = null;
      const at = insertAtRef.current;
      pendingFlip.current = snapshotTops();
      setItems(moveItem(itemsRef.current, session.id, at));
      setInsertAt(0);
      originRef.current = null;
      slotsRef.current = null;
      lastTops.current = null;
      setStatus(
        locale === "en" ? `Committed a new order · insert ${at}` : `已提交新顺序 · 插入 ${at}`,
      );
    },
    onCancel: (session) => {
      liveRef.current = null;
      originRef.current = null;
      slotsRef.current = null;
      lastTops.current = null;
      setInsertAt(0);
      reverseStop.current?.();
      setReturning(session);
      reverseStop.current = animateReversePath(
        session.path,
        (point) => setReturning((g) => (g ? { ...g, x: point.x, y: point.y } : g)),
        () => setReturning(null),
      );
      setStatus(locale === "en" ? "Cancelled · order unchanged" : "已取消 · 顺序不变");
    },
  });

  useEffect(() => () => reverseStop.current?.(), []);

  useEffect(() => {
    if (!live) return;
    let raf = 0;
    const step = () => {
      const box = scrollerRef.current;
      const session = liveRef.current;
      if (box && session) {
        const r = box.getBoundingClientRect();
        const delta = edgeScrollDelta(session.y, r.top, r.bottom);
        if (delta !== 0) {
          box.scrollTop += delta;
          recomputeInsert(session.y);
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [live]);

  useLayoutEffect(() => {
    if (locked || reduceMotion()) return;
    const first = pendingFlip.current;
    pendingFlip.current = null;
    if (!first) return;
    for (const [id, el] of itemEls.current) {
      const prev = first.get(id);
      if (prev == null) continue;
      const now = el.getBoundingClientRect().top;
      const dy = prev - now;
      if (Math.abs(dy) < 1) continue;
      el.animate(
        [{ transform: `translateY(${dy}px)` }, { transform: "translateY(0)" }],
        { duration: 220, easing: "cubic-bezier(0.2, 0, 0, 1)" },
      );
    }
  }, [items, locked]);

  useLayoutEffect(() => {
    if (locked || !live || reduceMotion()) return;
    const content = contentRef.current;
    if (!content) return;
    const cTop = content.getBoundingClientRect().top;
    const next = new Map<string, number>();
    for (const [id, el] of itemEls.current) {
      if (id === live.id) continue;
      next.set(id, el.getBoundingClientRect().top - cTop);
    }
    const first = lastTops.current;
    const origin = originRef.current;
    const order = items.map((item) => item.id);
    if (first && origin) {
      for (const [id, el] of itemEls.current) {
        if (id === live.id) continue;
        const prev = first.get(id);
        const now = next.get(id);
        if (prev == null || now == null) continue;
        const dy = prev - now;
        if (Math.abs(dy) < 1) continue;
        const ty = yieldTranslate(id, live.id, insertAt, order, origin);
        el.animate(
          [{ transform: `translateY(${ty + dy}px)` }, { transform: `translateY(${ty}px)` }],
          { duration: 200, easing: "cubic-bezier(0.2, 0, 0, 1)" },
        );
      }
    }
    lastTops.current = next;
  }, [insertAt, live, items, locked]);

  const flying = returning ?? live;
  const dragId = live?.id ?? returning?.id ?? (locked ? "b" : null);
  const origin = originRef.current;
  const order = items.map((item) => item.id);

  function snapshotTops() {
    const map = new Map<string, number>();
    for (const [id, el] of itemEls.current) map.set(id, el.getBoundingClientRect().top);
    return map;
  }

  return (
    <DemoShell
      compact={compact}
      title={locale === "en" ? "Orbit · queue" : "Orbit · 队列"}
      action={
        compact ? null : (
          <Btn
            onClick={() => {
              setItems(TASKS);
              setStatus(locale === "en" ? "Reset · five cards" : "已重置 · 五张卡");
            }}
          >
            {locale === "en" ? "Reset" : "重置"}
          </Btn>
        )
      }
      footer={
        locked
          ? locale === "en"
            ? "Lifted · hole is a hint, not a commit"
            : "已抬起 · 占位洞只是提示，不是提交"
          : status
      }
    >
      <div
        ref={scrollerRef}
        className={cn("h-full min-h-0 overflow-y-auto", !compact && "max-h-full")}
      >
        <div ref={contentRef} className={cn("relative flex flex-col gap-2 p-3", !compact && "pb-16")}>
          {items.map((item) => {
            const lifting = dragId === item.id;
            const ty =
              live && origin && item.id !== live.id
                ? yieldTranslate(item.id, live.id, insertAt, order, origin)
                : 0;
            return (
              <div
                key={item.id}
                ref={(el) => {
                  if (el) itemEls.current.set(item.id, el);
                  else itemEls.current.delete(item.id);
                }}
                {...(locked ? {} : bind(item.id))}
                className={cn("drag-item relative", !locked && "cursor-grab active:cursor-grabbing")}
                style={{
                  transform: ty ? `translateY(${ty}px)` : undefined,
                  zIndex: lifting ? 0 : undefined,
                }}
                aria-grabbed={lifting}
              >
                {locked && item.id === "b" ? (
                  <div className="drag-hole absolute inset-0" aria-hidden="true" />
                ) : null}
                <CardFace
                  title={pick(item.title, locale)}
                  meta={pick(item.meta, locale)}
                  className={lifting ? "opacity-0" : undefined}
                />
                {locked && item.id === "b" ? (
                  <div
                    className="drag-ghost pointer-events-none absolute inset-0"
                    style={{ transform: "translate(12px, -14px) rotate(2deg)" }}
                  >
                    <CardFace title={pick(item.title, locale)} meta={pick(item.meta, locale)} />
                  </div>
                ) : null}
              </div>
            );
          })}
          {live && origin ? (
            <div
              className="drag-hole pointer-events-none absolute right-3 left-3"
              style={{
                top: holeTop(live.id, insertAt, order, origin),
                height: live.height,
              }}
              aria-hidden="true"
            />
          ) : null}
        </div>
      </div>
      {flying && !locked ? (
        <div className="drag-ghost" style={ghostStyle(flying)}>
          <CardFace
            title={pick(items.find((item) => item.id === flying.id)?.title ?? TASKS[0]!.title, locale)}
            meta={pick(items.find((item) => item.id === flying.id)?.meta ?? TASKS[0]!.meta, locale)}
          />
        </div>
      ) : null}
    </DemoShell>
  );
}
