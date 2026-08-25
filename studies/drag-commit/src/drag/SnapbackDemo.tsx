import { useEffect, useRef, useState, type ReactNode } from "react";
import { Archive, Lock } from "lucide-react";
import { dropzoneHit, snapbackKeepsModel } from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import type { StageLock } from "../lib/stage-query";
import { cn } from "../lib/utils";
import { ARCHIVE_SEED, DESK_SEED, type Task } from "./fixtures";
import { Btn, CardFace, DemoShell } from "./Frame";
import { animateReversePath } from "./reverse-path";
import { ghostStyle, usePointerDrag, type DragLive } from "./use-pointer-drag";

const LOCKED_QUEUE: Task[] = [
  {
    id: "f3",
    title: { zh: "冻结队列 · 只读", en: "Frozen queue · read-only" },
    meta: { zh: "不可追加", en: "Cannot append" },
  },
];

export function SnapbackDemo({ compact = false, lock = "idle" }: { compact?: boolean; lock?: StageLock }) {
  const locale = useLocale();
  const locked = lock === "lift";
  const [desk, setDesk] = useState<Task[]>(DESK_SEED);
  const archive = ARCHIVE_SEED;
  const lockedQueue = LOCKED_QUEUE;
  const [reject, setReject] = useState(locked);
  const [returning, setReturning] = useState<DragLive | null>(null);
  const [status, setStatus] = useState(() =>
    locale === "en" ? "Idle · trays are read-only" : "待机 · 托盘是只读的",
  );

  const archiveRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<HTMLDivElement>(null);
  const reverseStop = useRef<(() => void) | null>(null);

  function boxOf(el: HTMLElement | null) {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
  }

  const { live, bind } = usePointerDrag({
    disabled: locked,
    onLift: () =>
      setStatus(locale === "en" ? "Lifted · read-only trays will reject" : "已抬起 · 只读托盘会拒收"),
    onMove: (session) => {
      const archiveBox = boxOf(archiveRef.current);
      const queueBox = boxOf(queueRef.current);
      const onArchive = archiveBox ? dropzoneHit(archiveBox, session.x, session.y) : false;
      const onQueue = queueBox ? dropzoneHit(queueBox, session.x, session.y) : false;
      setReject(onArchive || onQueue);
    },
    onDrop: (session) => {
      const archiveBox = boxOf(archiveRef.current);
      const queueBox = boxOf(queueRef.current);
      const onArchive = archiveBox ? dropzoneHit(archiveBox, session.x, session.y) : false;
      const onQueue = queueBox ? dropzoneHit(queueBox, session.x, session.y) : false;
      const onReadOnly = onArchive || onQueue;
      setReject(false);

      // Snap-back purely teaches the reject commit model: arrays never mutate
      if (snapbackKeepsModel(false)) {
        reverseStop.current?.();
        setReturning(session);
        reverseStop.current = animateReversePath(
          session.path,
          (point) => setReturning((g) => (g ? { ...g, x: point.x, y: point.y } : g)),
          () => setReturning(null),
        );
        setStatus(
          onReadOnly
            ? locale === "en"
              ? "Read-only tray · rejected · arrays unchanged"
              : "只读托盘 · 拒绝提交 · 数组不变"
            : locale === "en"
              ? "Invalid target · snap-back"
              : "无效目标 · 回弹",
        );
      }
    },
    onCancel: (session) => {
      setReject(false);
      reverseStop.current?.();
      setReturning(session);
      reverseStop.current = animateReversePath(
        session.path,
        (point) => setReturning((g) => (g ? { ...g, x: point.x, y: point.y } : g)),
        () => setReturning(null),
      );
      setStatus(locale === "en" ? "Cancelled · arrays unchanged" : "已取消 · 数组不变");
    },
  });

  useEffect(() => () => reverseStop.current?.(), []);

  const flying = returning ?? live;
  const hiding = live?.id ?? returning?.id ?? (locked ? "a" : null);

  function tray({
    boxRef,
    title,
    icon,
    count,
    children,
  }: {
    boxRef: typeof archiveRef;
    title: string;
    icon: ReactNode;
    count: number;
    children: ReactNode;
  }) {
    return (
      <div
        ref={boxRef}
        data-reject={reject ? "true" : undefined}
        className="drag-zone drag-tray relative flex min-h-0 flex-col rounded-2xl border-dashed p-3"
      >
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-fg-subtle">
          {icon}
          {title}
          <Lock className="size-3" aria-hidden="true" />
          <span className="ml-auto tabular-nums">{count}</span>
        </p>
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">{children}</div>
      </div>
    );
  }

  return (
    <DemoShell
      compact={compact}
      title={locale === "en" ? "Orbit · trays" : "Orbit · 托盘"}
      action={
        compact ? null : (
          <Btn
            onClick={() => {
              setDesk(DESK_SEED);
              setStatus(locale === "en" ? "Reset · desk restored" : "已重置 · 桌面回来");
            }}
          >
            {locale === "en" ? "Reset" : "重置"}
          </Btn>
        )
      }
      footer={
        locked
          ? locale === "en"
            ? "Read-only turned red · model must not change"
            : "只读变红 · 模型不能变"
          : status
      }
    >
      <div className="grid h-full min-h-0 grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3 p-3">
        <div className="flex min-h-0 flex-col gap-2">
          <p className="text-[11px] font-medium text-fg-subtle">
            {locale === "en" ? "Desk" : "桌面"}
            <span className="ml-1 tabular-nums">{desk.length}</span>
          </p>
          <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
            {desk.map((item) => (
              <div
                key={item.id}
                {...(locked ? {} : bind(item.id))}
                className={cn("drag-item", !locked && "cursor-grab active:cursor-grabbing")}
                aria-grabbed={hiding === item.id}
              >
                <CardFace
                  title={pick(item.title, locale)}
                  meta={pick(item.meta, locale)}
                  dim={hiding === item.id}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="grid min-h-0 grid-rows-2 gap-3">
          {tray({
            boxRef: archiveRef,
            title: locale === "en" ? "Archive · read-only" : "归档 · 只读",
            icon: <Archive className="size-3.5" aria-hidden="true" />,
            count: archive.length,
            children: (
              <>
                {archive.map((item) => (
                  <CardFace
                    key={item.id}
                    title={pick(item.title, locale)}
                    meta={pick(item.meta, locale)}
                    className="opacity-70"
                  />
                ))}
                {locked ? (
                  <div
                    className="drag-ghost drag-ghost-reject pointer-events-none absolute"
                    style={{ right: "10%", top: "58%", width: "38%" }}
                  >
                    <CardFace title={pick(DESK_SEED[0]!.title, locale)} meta={pick(DESK_SEED[0]!.meta, locale)} />
                  </div>
                ) : null}
              </>
            ),
          })}
          {tray({
            boxRef: queueRef,
            title: locale === "en" ? "Locked storage · read-only" : "锁定库 · 只读",
            icon: <Archive className="size-3.5" aria-hidden="true" />,
            count: lockedQueue.length,
            children: lockedQueue.map((item) => (
              <CardFace
                key={item.id}
                title={pick(item.title, locale)}
                meta={pick(item.meta, locale)}
                className="opacity-70"
              />
            )),
          })}
        </div>
      </div>
      {flying && !locked ? (
        <div className={cn("drag-ghost", reject && "drag-ghost-reject")} style={ghostStyle(flying)}>
          <CardFace
            title={pick(desk.find((item) => item.id === flying.id)?.title ?? DESK_SEED[0]!.title, locale)}
            meta={pick(desk.find((item) => item.id === flying.id)?.meta ?? DESK_SEED[0]!.meta, locale)}
          />
        </div>
      ) : null}
    </DemoShell>
  );
}
