import { useEffect, useRef, useState, type ReactNode } from "react";
import { Archive, Inbox, Lock } from "lucide-react";
import { dropzoneHit, snapbackKeepsModel } from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import type { StageLock } from "../lib/stage-query";
import { cn } from "../lib/utils";
import { ARCHIVE_SEED, DESK_SEED, type Task } from "./fixtures";
import { Btn, CardFace, DemoShell } from "./Frame";
import { animateReversePath } from "./reverse-path";
import { ghostStyle, usePointerDrag, type DragLive } from "./use-pointer-drag";

export function SnapbackDemo({ compact = false, lock = "idle" }: { compact?: boolean; lock?: StageLock }) {
  const locale = useLocale();
  const locked = lock === "lift";
  const [desk, setDesk] = useState<Task[]>(DESK_SEED);
  const [inbox, setInbox] = useState<Task[]>([]);
  const archive = ARCHIVE_SEED;
  const [reject, setReject] = useState(locked);
  const [hitInbox, setHitInbox] = useState(false);
  const [returning, setReturning] = useState<DragLive | null>(null);
  const [status, setStatus] = useState(() =>
    locale === "en" ? "Idle · archive is read-only" : "待机 · 归档是只读的",
  );

  const inboxRef = useRef<HTMLDivElement>(null);
  const archiveRef = useRef<HTMLDivElement>(null);
  const deskRef = useRef(desk);
  const reverseStop = useRef<(() => void) | null>(null);
  deskRef.current = desk;

  function boxOf(el: HTMLElement | null) {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
  }

  const { live, bind } = usePointerDrag({
    disabled: locked,
    onLift: () =>
      setStatus(locale === "en" ? "Lifted · only Inbox receives" : "已抬起 · 只有收件箱能收下"),
    onMove: (session) => {
      const inboxBox = boxOf(inboxRef.current);
      const archiveBox = boxOf(archiveRef.current);
      setHitInbox(inboxBox ? dropzoneHit(inboxBox, session.x, session.y) : false);
      setReject(archiveBox ? dropzoneHit(archiveBox, session.x, session.y) : false);
    },
    onDrop: (session) => {
      const inboxBox = boxOf(inboxRef.current);
      const archiveBox = boxOf(archiveRef.current);
      const valid = inboxBox ? dropzoneHit(inboxBox, session.x, session.y) : false;
      const onArchive = archiveBox ? dropzoneHit(archiveBox, session.x, session.y) : false;
      setHitInbox(false);
      setReject(false);
      if (snapbackKeepsModel(valid)) {
        reverseStop.current?.();
        setReturning(session);
        reverseStop.current = animateReversePath(
          session.path,
          (point) => setReturning((g) => (g ? { ...g, x: point.x, y: point.y } : g)),
          () => setReturning(null),
        );
        setStatus(
          onArchive
            ? locale === "en"
              ? "Read-only · path reversed · arrays unchanged"
              : "只读 · 路径倒回 · 数组不变"
            : locale === "en"
              ? "Invalid target · snap-back"
              : "无效目标 · 回弹",
        );
        return;
      }
      const card = deskRef.current.find((item) => item.id === session.id);
      if (!card) return;
      setDesk((list) => list.filter((item) => item.id !== session.id));
      setInbox((list) => [...list, card]);
      setStatus(locale === "en" ? "Inbox received · archive untouched" : "收件箱收下 · 归档未动");
    },
    onCancel: (session) => {
      setHitInbox(false);
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
    hit,
    lockedTray = false,
  }: {
    boxRef: typeof inboxRef;
    title: string;
    icon: ReactNode;
    count: number;
    children: ReactNode;
    hit?: boolean;
    lockedTray?: boolean;
  }) {
    return (
      <div
        ref={boxRef}
        data-hit={hit && !lockedTray ? "true" : undefined}
        data-reject={lockedTray && reject ? "true" : undefined}
        className={cn(
          "drag-zone drag-tray relative flex min-h-0 flex-col rounded-2xl p-3",
          lockedTray && "border-dashed",
        )}
      >
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-fg-subtle">
          {icon}
          {title}
          {lockedTray ? <Lock className="size-3" aria-hidden="true" /> : null}
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
              setInbox([]);
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
            boxRef: inboxRef,
            title: locale === "en" ? "Inbox" : "收件箱",
            icon: <Inbox className="size-3.5" aria-hidden="true" />,
            count: inbox.length,
            hit: hitInbox,
            children: inbox.map((item) => (
              <CardFace key={item.id} title={pick(item.title, locale)} meta={pick(item.meta, locale)} />
            )),
          })}
          {tray({
            boxRef: archiveRef,
            title: locale === "en" ? "Archive · read-only" : "归档 · 只读",
            icon: <Archive className="size-3.5" aria-hidden="true" />,
            count: archive.length,
            lockedTray: true,
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
