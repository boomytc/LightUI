import { useEffect, useRef, useState } from "react";
import { Inbox } from "lucide-react";
import { dropzoneHit } from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import type { StageLock } from "../lib/stage-query";
import { cn } from "../lib/utils";
import { CHIPS, type Chip } from "./fixtures";
import { Btn, ChipFace, DemoShell } from "./Frame";
import { animateReversePath } from "./reverse-path";
import { ghostStyle, usePointerDrag, type DragLive } from "./use-pointer-drag";

export function DropzoneDemo({ compact = false, lock = "idle" }: { compact?: boolean; lock?: StageLock }) {
  const locale = useLocale();
  const locked = lock === "lift";
  const [pool, setPool] = useState<Chip[]>(CHIPS);
  const [inbox, setInbox] = useState<Chip[]>([]);
  const [hit, setHit] = useState(locked);
  const [returning, setReturning] = useState<DragLive | null>(null);
  const [status, setStatus] = useState(() =>
    locale === "en" ? "Idle · drop only inside the zone" : "待机 · 只有区内才接收",
  );

  const zoneRef = useRef<HTMLDivElement>(null);
  const poolRef = useRef(pool);
  const reverseStop = useRef<(() => void) | null>(null);
  poolRef.current = pool;

  function zoneBox() {
    const el = zoneRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
  }

  const { live, bind } = usePointerDrag({
    disabled: locked,
    onLift: () => setStatus(locale === "en" ? "Lifted · zone lights up only inside" : "已抬起 · 区内才高亮"),
    onMove: (session) => {
      const box = zoneBox();
      setHit(box ? dropzoneHit(box, session.x, session.y) : false);
    },
    onDrop: (session) => {
      const box = zoneBox();
      const inside = box ? dropzoneHit(box, session.x, session.y) : false;
      setHit(false);
      if (!inside) {
        reverseStop.current?.();
        setReturning(session);
        reverseStop.current = animateReversePath(
          session.path,
          (point) => setReturning((g) => (g ? { ...g, x: point.x, y: point.y } : g)),
          () => setReturning(null),
        );
        setStatus(locale === "en" ? "Outside · no commit" : "区外 · 未提交");
        return;
      }
      const chip = poolRef.current.find((item) => item.id === session.id);
      if (!chip) return;
      setPool((list) => list.filter((item) => item.id !== session.id));
      setInbox((list) => [...list, chip]);
      setStatus(
        locale === "en"
          ? `Received ${pick(chip.title, "en")}`
          : `已接收 ${pick(chip.title, "zh")}`,
      );
    },
    onCancel: (session) => {
      setHit(false);
      reverseStop.current?.();
      setReturning(session);
      reverseStop.current = animateReversePath(
        session.path,
        (point) => setReturning((g) => (g ? { ...g, x: point.x, y: point.y } : g)),
        () => setReturning(null),
      );
      setStatus(locale === "en" ? "Cancelled · no receive" : "已取消 · 没有接收");
    },
  });

  useEffect(() => () => reverseStop.current?.(), []);

  const flying = returning ?? live;
  const hiding = live?.id ?? returning?.id ?? (locked ? "alpha" : null);

  return (
    <DemoShell
      compact={compact}
      title={locale === "en" ? "Orbit · inbox" : "Orbit · 收件"}
      action={
        compact ? null : (
          <Btn
            onClick={() => {
              setPool(CHIPS);
              setInbox([]);
              setStatus(locale === "en" ? "Reset · four chips" : "已重置 · 四个筹码");
            }}
          >
            {locale === "en" ? "Reset" : "重置"}
          </Btn>
        )
      }
      footer={
        locked
          ? locale === "en"
            ? "Inside the zone · will receive once"
            : "指针在区内 · 将接收一次"
          : status
      }
    >
      <div className="grid h-full min-h-0 grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3 p-3">
        <div className="flex min-h-0 flex-col gap-2">
          <p className="text-[11px] font-medium text-fg-subtle">
            {locale === "en" ? "Chips" : "筹码"}
            <span className="ml-1 tabular-nums">{pool.length}</span>
          </p>
          <div className="flex flex-wrap content-start gap-2">
            {pool.map((chip) => (
              <button
                key={chip.id}
                type="button"
                {...(locked ? {} : bind(chip.id))}
                className={cn("drag-item", !locked && "cursor-grab active:cursor-grabbing")}
                aria-grabbed={hiding === chip.id}
              >
                <ChipFace title={pick(chip.title, locale)} dim={hiding === chip.id} />
              </button>
            ))}
          </div>
        </div>
        <div
          ref={zoneRef}
          data-hit={hit ? "true" : undefined}
          className="drag-zone relative flex min-h-0 flex-col rounded-2xl p-3"
        >
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-fg-subtle">
            <Inbox className="size-3.5" aria-hidden="true" />
            {locale === "en" ? "Inbox · drop here" : "收件箱 · 丢进这里"}
            <span className="ml-auto tabular-nums">{inbox.length}</span>
          </p>
          <div className="flex flex-wrap content-start gap-2">
            {inbox.map((chip) => (
              <ChipFace key={chip.id} title={pick(chip.title, locale)} className="border-accent/30 bg-accent-soft" />
            ))}
          </div>
          {locked ? (
            <div
              className="drag-ghost pointer-events-none absolute"
              style={{ left: "28%", top: "42%", width: 72 }}
            >
              <ChipFace title={pick(CHIPS[0]!.title, locale)} />
            </div>
          ) : null}
        </div>
      </div>
      {flying && !locked ? (
        <div className="drag-ghost" style={ghostStyle(flying)}>
          <ChipFace
            title={pick(pool.find((item) => item.id === flying.id)?.title ?? CHIPS[0]!.title, locale)}
          />
        </div>
      ) : null}
    </DemoShell>
  );
}
