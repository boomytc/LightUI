import { useEffect, useRef, useState } from "react";
import { loc, pick, useLocale } from "../lib/site-locale";
import { beginJump, pickActive } from "../lib/spy";
import { cn } from "../lib/utils";
import { FakeCards, FakeLines, Frame } from "./Frame";

const SECTIONS = [
  { id: "overview", label: loc("概览", "Overview") },
  { id: "features", label: loc("功能", "Features") },
  { id: "pricing", label: loc("价格", "Pricing") },
  { id: "reviews", label: loc("评价", "Reviews") },
];

export function ScrollspyDemo() {
  const locale = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const lock = useRef(false);
  const [active, setActive] = useState(SECTIONS[0].id);
  const activeRef = useRef(active);
  const seen = useRef<Record<string, { id: string; intersecting: boolean; ratio: number }>>({});
  activeRef.current = active;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nodes = SECTIONS.map((s) => root.querySelector<HTMLElement>(`#${s.id}`)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          seen.current[entry.target.id] = {
            id: entry.target.id,
            intersecting: entry.isIntersecting,
            ratio: entry.intersectionRatio,
          };
        }
        setActive(pickActive(Object.values(seen.current), lock.current, activeRef.current));
      },
      { root, rootMargin: "-15% 0px -55% 0px", threshold: [0, 0.2, 0.4, 0.7, 1] },
    );
    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, []);

  function jump(id: string) {
    const root = rootRef.current;
    const el = root?.querySelector<HTMLElement>(`#${id}`);
    if (!root || !el) return;
    const next = beginJump(id);
    lock.current = next.locked;
    setActive(next.active);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      lock.current = false;
    }, 450);
  }

  return (
    <Frame title={locale === "en" ? "Landing" : "落地页"}>
      <div className="flex h-full min-w-0">
        <nav className="flex w-[4.75rem] shrink-0 flex-col gap-0.5 overflow-x-hidden border-r border-border bg-surface-2 py-3 pr-1 pl-2 @min-[32rem]:w-36">
          {SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => jump(item.id)}
              className={cn(
                "rounded-md px-2 py-1.5 text-left text-[12px]",
                active === item.id ? "bg-surface font-medium text-accent" : "text-fg-muted hover:bg-surface",
              )}
            >
              {pick(item.label, locale)}
            </button>
          ))}
        </nav>
        <div ref={rootRef} className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          {SECTIONS.map((item) => (
            <section key={item.id} id={item.id} className="scroll-mt-3 px-4 py-4">
              <h3 className="mb-3 text-[15px] font-semibold text-accent">{pick(item.label, locale)}</h3>
              <FakeCards />
              <div className="mt-3">
                <FakeLines n={3} />
              </div>
            </section>
          ))}
        </div>
      </div>
    </Frame>
  );
}
