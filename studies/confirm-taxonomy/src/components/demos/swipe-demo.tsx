import { useRef, useState, type PointerEvent } from "react";
import { resolveSwipeReveal } from "../../lib/machines";
import { cn } from "../../lib/utils";
import { MacWindow } from "../mac-window";

type ItineraryItem = {
  id: string;
  time: string;
  title: string;
  note: string;
};

const INITIAL_ITEMS: ItineraryItem[] = [
  { id: "1", time: "09:30", title: "虹桥 T2 → 静安设计中心", note: "专车接送 · 司机已就位" },
  { id: "2", time: "11:00", title: "设计系统可用性评审", note: "会议室 402 · 8 位成员" },
  { id: "3", time: "14:30", title: "录制 LightUI 交互拆解播客", note: "静安录音棚 · 60 分钟" },
  { id: "4", time: "17:00", title: "二次确认阶梯方案对齐", note: "远程视频 · 架构组" },
];

export function SwipeDemo() {
  const [seed, setSeed] = useState(0);
  return <SwipeInner key={seed} onReset={() => setSeed((n) => n + 1)} />;
}

function SwipeInner({ onReset }: { onReset: () => void }) {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <MacWindow
      title="日程管理 · 今日行程"
      eyebrow="Web / Itinerary"
      badge={
        <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[10px] font-medium text-fg-muted border border-border">
          {items.length} 条安排
        </span>
      }
      onReset={onReset}
    >
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-fg">今天的行程与待办</h3>
          <p className="text-[11px] text-accent font-medium">← 向左拖拽行露出删除</p>
        </div>
      </div>

      <ul className="divide-y divide-border rounded-xl border border-border bg-surface mx-4 my-3 overflow-hidden shadow-sm">
        {items.map((item) => (
          <SwipeRow
            key={item.id}
            item={item}
            isOpen={openId === item.id}
            onOpen={(id) => setOpenId(id)}
            onClose={() => setOpenId(null)}
            onDelete={() => {
              setItems((prev) => prev.filter((x) => x.id !== item.id));
              setOpenId(null);
            }}
          />
        ))}
      </ul>

      {items.length === 0 && (
        <div className="py-12 text-center text-xs text-fg-muted">
          今日行程已全部清理完毕。
        </div>
      )}
    </MacWindow>
  );
}

function SwipeRow({
  item,
  isOpen,
  onOpen,
  onClose,
  onDelete,
}: {
  item: ItineraryItem;
  isOpen: boolean;
  onOpen: (id: string) => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const startX = useRef(0);
  const startOpen = useRef(false);
  const dragging = useRef(false);
  const dxRef = useRef(0);
  const [dx, setDx] = useState(0);
  const [live, setLive] = useState(false);

  const { revealedPx } = resolveSwipeReveal(
    live ? dx : isOpen ? -80 : 0,
    56,
    80,
  );

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    startX.current = event.clientX;
    startOpen.current = isOpen;
    const initial = isOpen ? -80 : 0;
    dxRef.current = initial;
    setDx(initial);
    setLive(true);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const current = event.clientX - startX.current + (startOpen.current ? -80 : 0);
    dxRef.current = current;
    setDx(current);
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const willOpen = dxRef.current < -56;
    setLive(false);
    setDx(0);
    dxRef.current = 0;
    if (willOpen) onOpen(item.id);
    else onClose();
  };

  return (
    <li className="relative overflow-hidden bg-surface">
      {/* Hidden Destructive Action */}
      <button
        type="button"
        onClick={onDelete}
        className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-wrong text-xs font-semibold text-white transition-colors hover:bg-wrong/90"
        tabIndex={isOpen ? 0 : -1}
      >
        删除
      </button>

      {/* Sliding Content Layer */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={cn(
          "relative z-10 flex items-start gap-3 bg-surface px-4 py-3 cursor-grab active:cursor-grabbing select-none touch-pan-y",
          !live && "transition-transform duration-200 ease-out",
        )}
        style={{ transform: `translateX(${revealedPx}px)` }}
      >
        <span className="w-12 shrink-0 pt-0.5 font-mono text-xs font-semibold text-accent">
          {item.time}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-medium text-fg">{item.title}</h4>
          <p className="mt-0.5 text-[11px] text-fg-muted">{item.note}</p>
        </div>
      </div>
    </li>
  );
}
