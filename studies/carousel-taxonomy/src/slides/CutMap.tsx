import { KINDS, type KindId } from "../lib/kinds";
import { pick, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";

export function CutMap({
  active,
  locale,
  onPick,
}: {
  active: KindId;
  locale: Locale;
  onPick: (id: KindId) => void;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <p className="text-[12px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
          {locale === "en" ? "Name the cut" : "先定切法"}
        </p>
        <p className="hidden text-[11px] text-fg-subtle sm:block">
          {locale === "en" ? "Keys 1–8 pick a motion." : "数字键 1–8 选一种切法。"}
        </p>
      </div>
      <nav
        aria-label={locale === "en" ? "Carousel kinds" : "轮播种类"}
        className="cut-map"
      >
        {KINDS.map((kind) => {
          const on = kind.id === active;
          return (
            <button
              key={kind.id}
              type="button"
              data-kind={kind.id}
              aria-pressed={on}
              onClick={() => onPick(kind.id)}
              className={cn("cut-tile", on && "is-on")}
            >
              <span className="flex items-center justify-between gap-2">
                <span className={cn("font-mono text-[10px] tabular-nums", on ? "text-accent" : "text-fg-subtle")}>
                  {kind.index}
                </span>
                <span className={cn("text-[10px] font-medium", on ? "text-accent" : "text-fg-subtle")}>
                  {pick(kind.cut, locale)}
                </span>
              </span>
              <CutGlyph id={kind.id} on={on} />
              <span className="mt-1.5 block text-left text-[13px] font-semibold tracking-tight text-fg">
                {pick(kind.zh, locale)}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function CutGlyph({ id, on }: { id: KindId; on: boolean }) {
  return (
    <span className={cn("cut-glyph", `cut-glyph-${id}`, on && "is-on")} aria-hidden="true">
      {id === "classic" ? (
        <>
          <i />
          <i />
          <i />
          <i />
        </>
      ) : null}
      {id === "fade" ? (
        <>
          <i />
          <i />
        </>
      ) : null}
      {id === "coverflow" ? (
        <>
          <i />
          <i />
          <i />
        </>
      ) : null}
      {id === "stack" ? (
        <>
          <i />
          <i />
          <i />
        </>
      ) : null}
      {id === "flip" ? (
        <>
          <i />
          <i />
          <b />
        </>
      ) : null}
      {id === "accordion" ? (
        <>
          <i />
          <i />
          <i />
          <i />
        </>
      ) : null}
      {id === "spin" ? (
        <>
          <i />
          <i />
        </>
      ) : null}
      {id === "parallax" ? (
        <>
          <i />
          <i />
          <i />
        </>
      ) : null}
    </span>
  );
}

export function Contrast({
  locale,
  naive,
  matched,
  cut,
}: {
  locale: Locale;
  naive: string;
  matched: string;
  cut: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <aside className="rounded-xl border border-border bg-surface-2/70 px-3.5 py-3">
        <p className="text-[10px] font-medium tracking-wide text-fg-subtle uppercase">
          {locale === "en" ? "Always a slide" : "一律左右滑"}
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{naive}</p>
      </aside>
      <aside className="rounded-xl border border-intent/30 bg-intent-soft px-3.5 py-3">
        <p className="text-[10px] font-medium tracking-wide text-intent uppercase">
          {locale === "en" ? "This cut" : "这一刀"}
          <span className="ml-1.5 font-sans normal-case tracking-normal text-intent/70">{cut}</span>
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-fg">{matched}</p>
      </aside>
    </div>
  );
}
