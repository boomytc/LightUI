import { PATTERNS, type PatternId } from "../lib/machines.js";

export function TaxonomyRail({
  active,
  onOpen,
}: {
  active: PatternId | null;
  onOpen: (id: PatternId) => void;
}) {
  return (
    <div className="taxonomy-rail">
      <div className="mb-2 hidden grid-cols-[2.25rem_6.5rem_minmax(7rem,1.1fr)_6rem_minmax(7rem,1fr)] gap-3 px-3 text-[0.65rem] font-medium tracking-wider text-fg-subtle uppercase md:grid">
        <span className="font-mono">#</span>
        <span>技法</span>
        <span>关系</span>
        <span>隔断</span>
        <span>何时</span>
      </div>
      <div role="listbox" aria-label="分组技法对照" className="flex flex-col">
        {PATTERNS.map((pattern) => {
          const selected = active === pattern.id;
          const isAnti = pattern.id === "cards";
          return (
            <button
              key={pattern.id}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onOpen(pattern.id)}
              className={`taxonomy-row pressable ${selected ? "is-active" : ""} ${
                isAnti ? "is-anti" : ""
              }`}
            >
              <span className="font-mono text-[0.7rem] font-semibold tracking-wider text-accent">
                {pattern.num}
              </span>
              <span className="min-w-0">
                <span className="flex items-baseline gap-2">
                  <span className="text-[0.95rem] font-semibold text-fg">
                    {pattern.name}
                  </span>
                  {isAnti ? (
                    <span className="text-[0.65rem] font-medium tracking-wide text-fg-subtle">
                      反例
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-[0.7rem] text-fg-subtle md:hidden">
                  {pattern.relation} · {pattern.cut} · {pattern.when}
                </span>
              </span>
              <span className="hidden text-[0.8rem] leading-snug text-fg-muted md:block">
                {pattern.relation}
              </span>
              <span className="hidden text-[0.8rem] leading-snug text-fg md:block">
                {pattern.cut}
              </span>
              <span className="hidden text-[0.8rem] leading-snug text-fg-muted md:block">
                {pattern.when}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
