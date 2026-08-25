import { useEffect, useRef, useState, type ReactNode } from "react";
import { dropzoneHit, insertIndexY, transferItem, type SlotBox } from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import type { StageLock } from "../lib/stage-query";
import { cn } from "../lib/utils";
import { QUEUE_SEED, TODAY_SEED, type Task } from "./fixtures";
import { Btn, CardFace, DemoShell } from "./Frame";
import { animateReversePath } from "./reverse-path";
import { ghostStyle, usePointerDrag, type DragLive } from "./use-pointer-drag";

function measureSlots(ids: string[], els: Map<string, HTMLElement>, content: HTMLElement): SlotBox[] {
  const cTop = content.getBoundingClientRect().top;
  return ids.map((id) => {
    const el = els.get(id);
    if (!el) return { id, top: 0, height: 0 };
    const r = el.getBoundingClientRect();
    return { id, top: r.top - cTop, height: r.height };
  });
}

export function TransferDemo({ compact = false, lock = "idle" }: { compact?: boolean; lock?: StageLock }) {
  const locale = useLocale();
  const locked = lock === "lift";
  const [queue, setQueue] = useState<Task[]>(QUEUE_SEED);
  const [today, setToday] = useState<Task[]>(TODAY_SEED);
  const [destIndex, setDestIndex] = useState(locked ? 0 : -1);
  const [overDest, setOverDest] = useState(locked);
  const [returning, setReturning] = useState<DragLive | null>(null);
  const [status, setStatus] = useState(() =>
    locale === "en" ? "Idle · source stays until drop" : "待机 · 源列留着，松手才交",
  );

  const queueBox = useRef<HTMLDivElement>(null);
  const todayBox = useRef<HTMLDivElement>(null);
  const queueList = useRef<HTMLDivElement>(null);
  const todayList = useRef<HTMLDivElement>(null);
  const itemEls = useRef(new Map<string, HTMLElement>());
  const reverseStop = useRef<(() => void) | null>(null);
  const queueRef = useRef(queue);
  const todayRef = useRef(today);
  queueRef.current = queue;
  todayRef.current = today;

  function rectOf(el: HTMLElement | null) {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
  }

  const { live, bind } = usePointerDrag({
    disabled: locked,
    onLift: () =>
      setStatus(locale === "en" ? "Lifted · source ghost stays" : "已抬起 · 源列幽灵留着"),
    onMove: (session) => {
      const fromQueue = queueRef.current.some((item) => item.id === session.id);
      const destEl = fromQueue ? todayBox.current : queueBox.current;
      const destList = fromQueue ? todayList.current : queueList.current;
      const destItems = fromQueue ? todayRef.current : queueRef.current;
      const box = rectOf(destEl);
      const hit = box ? dropzoneHit(box, session.x, session.y) : false;
      setOverDest(hit);
      if (!hit || !destList) {
        setDestIndex(-1);
        return;
      }
      const slots = measureSlots(
        destItems.map((item) => item.id),
        itemEls.current,
        destList,
      );
      const y = session.y - destList.getBoundingClientRect().top;
      setDestIndex(insertIndexY(slots, y, session.id));
    },
    onDrop: (session) => {
      const fromQueue = queueRef.current.some((item) => item.id === session.id);
      const destEl = fromQueue ? todayBox.current : queueBox.current;
      const destList = fromQueue ? todayList.current : queueList.current;
      const destItems = fromQueue ? todayRef.current : queueRef.current;
      const sourceItems = fromQueue ? queueRef.current : todayRef.current;
      const box = rectOf(destEl);
      const hit = box ? dropzoneHit(box, session.x, session.y) : false;
      setOverDest(false);
      if (!hit || !destList) {
        setDestIndex(-1);
        reverseStop.current?.();
        setReturning(session);
        reverseStop.current = animateReversePath(
          session.path,
          (point) => setReturning((g) => (g ? { ...g, x: point.x, y: point.y } : g)),
          () => setReturning(null),
        );
        setStatus(locale === "en" ? "Missed dest · no transfer" : "没进目标列 · 未转移");
        return;
      }
      const slots = measureSlots(
        destItems.map((item) => item.id),
        itemEls.current,
        destList,
      );
      const y = session.y - destList.getBoundingClientRect().top;
      const at = insertIndexY(slots, y, session.id);
      const next = transferItem(sourceItems, destItems, session.id, at);
      if (fromQueue) {
        setQueue(next.source);
        setToday(next.dest);
      } else {
        setToday(next.source);
        setQueue(next.dest);
      }
      setDestIndex(-1);
      setStatus(
        locale === "en"
          ? `Transferred · destIndex ${at} · ${next.source.length}/${next.dest.length}`
          : `已转移 · 下标 ${at} · ${next.source.length}/${next.dest.length}`,
      );
    },
    onCancel: (session) => {
      setOverDest(false);
      setDestIndex(-1);
      reverseStop.current?.();
      setReturning(session);
      reverseStop.current = animateReversePath(
        session.path,
        (point) => setReturning((g) => (g ? { ...g, x: point.x, y: point.y } : g)),
        () => setReturning(null),
      );
      setStatus(locale === "en" ? "Cancelled · both lists unchanged" : "已取消 · 两列都不变");
    },
  });

  useEffect(() => () => reverseStop.current?.(), []);

  const flying = returning ?? live;
  const dragId = live?.id ?? returning?.id ?? (locked ? "a" : null);
  const fromQueue = dragId ? queue.some((item) => item.id === dragId) : true;
  const showGap = (overDest && destIndex >= 0) || locked;

  function column(
    title: string,
    count: number,
    list: Task[],
    boxRef: typeof queueBox,
    listRef: typeof queueList,
    isDest: boolean,
  ) {
    const gapAt = isDest && showGap ? (locked ? 0 : destIndex) : -1;
    const nodes: ReactNode[] = [];
    list.forEach((item, i) => {
      if (i === gapAt) {
        nodes.push(
          <div
            key="hole"
            className="drag-hole h-14 shrink-0"
            aria-hidden="true"
          />,
        );
      }
      nodes.push(
        <div
          key={item.id}
          ref={(el) => {
            if (el) itemEls.current.set(item.id, el);
            else itemEls.current.delete(item.id);
          }}
          {...(locked ? {} : bind(item.id))}
          className={cn("drag-item", !locked && "cursor-grab active:cursor-grabbing")}
          aria-grabbed={dragId === item.id}
        >
          <CardFace
            title={pick(item.title, locale)}
            meta={pick(item.meta, locale)}
            dim={dragId === item.id}
          />
        </div>,
      );
    });
    if (gapAt >= list.length) {
      nodes.push(<div key="hole-end" className="drag-hole h-14 shrink-0" aria-hidden="true" />);
    }
    return (
      <div ref={boxRef} className="flex min-h-0 min-w-0 flex-col rounded-xl bg-surface-2/80 p-2">
        <p className="mb-2 px-1 text-[11px] font-medium text-fg-subtle">
          {title}
          <span className="ml-1 tabular-nums">{count}</span>
        </p>
        <div ref={listRef} className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
          {nodes}
        </div>
      </div>
    );
  }

  return (
    <DemoShell
      compact={compact}
      title={locale === "en" ? "Orbit · boards" : "Orbit · 看板"}
      action={
        compact ? null : (
          <Btn
            onClick={() => {
              setQueue(QUEUE_SEED);
              setToday(TODAY_SEED);
              setStatus(locale === "en" ? "Reset · two lists" : "已重置 · 两列");
            }}
          >
            {locale === "en" ? "Reset" : "重置"}
          </Btn>
        )
      }
      footer={
        locked
          ? locale === "en"
            ? "Source ghost stays · dest shows a gap"
            : "源列幽灵留着 · 目标列出洞"
          : status
      }
    >
      <div className="grid h-full min-h-0 grid-cols-2 gap-3 p-3">
        {column(
          locale === "en" ? "Queue" : "队列",
          queue.length,
          queue,
          queueBox,
          queueList,
          !fromQueue,
        )}
        {column(
          locale === "en" ? "Today" : "今日",
          today.length,
          today,
          todayBox,
          todayList,
          fromQueue,
        )}
      </div>
      {locked ? (
        <div
          className="drag-ghost pointer-events-none absolute"
          style={{ right: "12%", top: "34%", width: "42%" }}
        >
          <CardFace title={pick(QUEUE_SEED[0]!.title, locale)} meta={pick(QUEUE_SEED[0]!.meta, locale)} />
        </div>
      ) : null}
      {flying && !locked ? (
        <div className="drag-ghost" style={ghostStyle(flying)}>
          <CardFace
            title={pick(
              [...queue, ...today].find((item) => item.id === flying.id)?.title ?? QUEUE_SEED[0]!.title,
              locale,
            )}
            meta={pick(
              [...queue, ...today].find((item) => item.id === flying.id)?.meta ?? QUEUE_SEED[0]!.meta,
              locale,
            )}
          />
        </div>
      ) : null}
    </DemoShell>
  );
}
