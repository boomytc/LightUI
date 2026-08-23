import { useEffect, useMemo, useRef, useState } from "react";
import { CANVAS_GROW, CANVAS_SEED } from "../lib/fixtures";
import { KINDS } from "../lib/kinds";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Btn, Window } from "./Frame";

type Tone = "note" | "note-3" | "chip";

type Card = {
  id: string;
  title: string;
  body: string;
  x: number;
  y: number;
  tone: Tone;
  parentId?: string;
};

export function CanvasDemo() {
  const locale = useLocale();
  const meta = KINDS[4]!;
  const vpRef = useRef<HTMLDivElement>(null);
  const [cards, setCards] = useState<Card[]>(() =>
    CANVAS_SEED.map((c) => ({
      id: c.id,
      title: pick(c.title, locale),
      body: pick(c.body, locale),
      x: c.x,
      y: c.y,
      tone: c.tone,
    })),
  );
  const [selected, setSelected] = useState("b");
  const [pan, setPan] = useState({ x: 8, y: 6 });
  const [scale, setScale] = useState(1);
  const panDrag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const cardDrag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const panRef = useRef(pan);
  const scaleRef = useRef(scale);
  panRef.current = pan;
  scaleRef.current = scale;

  const selectedCard = cards.find((c) => c.id === selected);

  const edges = useMemo(
    () =>
      cards
        .filter((c) => c.parentId)
        .flatMap((c) => {
          const p = cards.find((x) => x.id === c.parentId);
          return p ? [{ from: p, to: c }] : [];
        }),
    [cards],
  );

  function clientToWorld(cx: number, cy: number) {
    const rect = vpRef.current!.getBoundingClientRect();
    return {
      x: (cx - rect.left - pan.x) / scale,
      y: (cy - rect.top - pan.y) / scale,
    };
  }

  useEffect(() => {
    const el = vpRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const s = scaleRef.current;
      const p = panRef.current;
      const worldX = (e.clientX - rect.left - p.x) / s;
      const worldY = (e.clientY - rect.top - p.y) / s;
      const next = Math.min(1.5, Math.max(0.7, s * (e.deltaY > 0 ? 0.92 : 1.08)));
      setScale(next);
      setPan({
        x: e.clientX - rect.left - worldX * next,
        y: e.clientY - rect.top - worldY * next,
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function grow() {
    if (!selectedCard) return;
    const born: Card[] = CANVAS_GROW.map((item, i) => ({
      id: `g-${selectedCard.id}-${i}`,
      title: pick(item.title, locale),
      body: pick(item.body, locale),
      x: selectedCard.x + 148,
      y: selectedCard.y + (i - 0.5) * 88,
      tone: i === 0 ? "note" : "note-3",
      parentId: selectedCard.id,
    }));
    setCards((prev) => [...prev.filter((c) => c.parentId !== selectedCard.id), ...born]);
  }

  return (
    <Window
      title={pick(meta.window, locale)}
      action={
        <Btn tone="outline" onClick={grow} disabled={!selectedCard}>
          {locale === "en" ? "Grow nodes" : "长出节点"}
        </Btn>
      }
    >
      <div
        ref={vpRef}
        data-canvas
        className="relative h-full min-w-0 cursor-grab overflow-hidden touch-none active:cursor-grabbing"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("[data-card]")) return;
          panDrag.current = { x: pan.x, y: pan.y, px: e.clientX, py: e.clientY };
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (cardDrag.current) {
            const w = clientToWorld(e.clientX, e.clientY);
            const { id, dx, dy } = cardDrag.current;
            setCards((prev) => prev.map((c) => (c.id === id ? { ...c, x: w.x - dx, y: w.y - dy } : c)));
            return;
          }
          if (!panDrag.current) return;
          setPan({
            x: panDrag.current.x + (e.clientX - panDrag.current.px),
            y: panDrag.current.y + (e.clientY - panDrag.current.py),
          });
        }}
        onPointerUp={() => {
          panDrag.current = null;
          cardDrag.current = null;
        }}
      >
        <div
          className="chrome-canvas absolute inset-0 origin-top-left"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
        >
          <svg className="pointer-events-none absolute inset-0 overflow-visible">
            {edges.map(({ from, to }) => {
              const x1 = from.x + 112;
              const y1 = from.y + 32;
              const x2 = to.x;
              const y2 = to.y + 32;
              const mx = (x1 + x2) / 2;
              return (
                <path
                  key={to.id}
                  d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeOpacity="0.45"
                  strokeWidth="1.4"
                />
              );
            })}
          </svg>

          {cards.map((card) => (
            <button
              data-card
              type="button"
              key={card.id}
              onPointerDown={(e) => {
                e.stopPropagation();
                setSelected(card.id);
                const w = clientToWorld(e.clientX, e.clientY);
                cardDrag.current = { id: card.id, dx: w.x - card.x, dy: w.y - card.y };
              }}
              className={cn(
                "absolute w-28 rounded-xl p-2.5 text-left shadow-card",
                card.tone === "note" && "chrome-card-note",
                card.tone === "note-3" && "chrome-card-note-3",
                card.tone === "chip" && "chrome-card-chip",
                selected === card.id && "ring-2 ring-accent",
              )}
              style={{ left: card.x, top: card.y }}
            >
              <p className="text-[12px] font-medium leading-snug">{card.title}</p>
              <p className="mt-1 text-[10px] text-fg-muted">{card.body}</p>
            </button>
          ))}
        </div>
        <p className="pointer-events-none absolute bottom-2 left-3 text-[10px] text-fg-subtle">
          {locale === "en" ? "Drag to pan · cards are nodes" : "拖动画布平移 · 点子是卡片"}
        </p>
      </div>
    </Window>
  );
}
