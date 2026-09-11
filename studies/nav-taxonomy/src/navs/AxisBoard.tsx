import type { ReactNode } from "react";
import {
  placeLine,
  placeSketch,
  revealLine,
  revealSketch,
  scrollLine,
  scrollSketch,
  type PlaceSketch,
  type RevealSketch,
  type ScrollSketch,
} from "../lib/axes";
import type { KindId } from "../lib/kinds";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";

export function AxisBoard({ kind }: { kind: KindId }) {
  const locale = useLocale();
  const cells = [
    {
      key: "place",
      label: locale === "en" ? "Lives" : "住哪",
      value: pick(placeLine(kind), locale),
      sketch: <PlaceMini mode={placeSketch(kind)} />,
    },
    {
      key: "reveal",
      label: locale === "en" ? "Opens" : "怎么开",
      value: pick(revealLine(kind), locale),
      sketch: <RevealMini mode={revealSketch(kind)} />,
    },
    {
      key: "scroll",
      label: locale === "en" ? "On scroll" : "滚的时候",
      value: pick(scrollLine(kind), locale),
      sketch: <ScrollMini mode={scrollSketch(kind)} />,
    },
  ];

  return (
    <div className="mb-5 grid gap-2 sm:grid-cols-3">
      {cells.map((cell) => (
        <div
          key={cell.key}
          className="nav-axis-cell flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5"
        >
          <div className="shrink-0" aria-hidden="true">
            {cell.sketch}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
              {cell.label}
            </p>
            <p className="mt-0.5 truncate text-[13px] font-medium text-fg">{cell.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Page({ children }: { children: ReactNode }) {
  return (
    <div className="relative size-[2.75rem] overflow-hidden rounded-md border border-border bg-surface-2">
      {children}
    </div>
  );
}

function PlaceMini({ mode }: { mode: PlaceSketch }) {
  return (
    <Page>
      <span
        className={cn(
          "nav-sketch-bit absolute inset-x-1 top-1 h-1.5 rounded-sm",
          mode === "top-card" ? "inset-x-2 bg-accent" : "bg-border",
          mode === "top-bar" && "inset-x-1 bg-accent",
        )}
      />
      <span
        className={cn(
          "nav-sketch-bit absolute inset-x-1 top-3 h-1 rounded-sm",
          mode === "under" ? "bg-accent" : "bg-transparent",
        )}
      />
      <span
        className={cn(
          "nav-sketch-bit absolute top-1 bottom-1 left-1 w-1.5 rounded-sm",
          mode === "left" ? "bg-accent" : "bg-transparent",
        )}
      />
      <span
        className={cn(
          "nav-sketch-bit absolute inset-x-1 bottom-1 h-1.5 rounded-sm",
          mode === "bottom" ? "bg-accent" : "bg-border/80",
        )}
      />
      <span
        className={cn(
          "nav-sketch-bit absolute inset-y-0 right-0 w-[42%] bg-accent/80",
          mode === "right-veil" ? "opacity-100" : "opacity-0",
        )}
      />
      <span
        className={cn(
          "nav-sketch-bit absolute inset-0 bg-accent/70",
          mode === "full-veil" ? "opacity-100" : "opacity-0",
        )}
      />
    </Page>
  );
}

function RevealMini({ mode }: { mode: RevealSketch }) {
  return (
    <Page>
      <span className="absolute inset-x-1 top-1 h-1.5 rounded-sm bg-border" />
      <span
        className={cn(
          "nav-sketch-bit absolute top-3 left-1 h-4 w-3 rounded-sm bg-accent",
          mode === "column" ? "opacity-100" : "opacity-0",
        )}
      />
      <span
        className={cn(
          "nav-sketch-bit absolute inset-x-1 top-3 h-4 rounded-sm bg-accent",
          mode === "mega" ? "opacity-100" : "opacity-0",
        )}
      />
      <span
        className={cn(
          "nav-sketch-bit absolute inset-y-0 right-0 w-[40%] bg-accent",
          mode === "slide" ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0",
        )}
      />
      <span
        className={cn(
          "nav-sketch-bit absolute inset-0 grid place-items-center bg-accent/80",
          mode === "page" ? "opacity-100" : "opacity-0",
        )}
      >
        <i className="block size-1.5 rounded-full bg-accent-fg" />
      </span>
      <span
        className={cn(
          "nav-sketch-bit absolute inset-x-1 top-[1.15rem] h-1 rounded-sm bg-accent",
          mode === "always" ? "opacity-100" : "opacity-0",
        )}
      />
      <span
        className={cn(
          "nav-sketch-bit absolute inset-x-2 top-[1.45rem] h-1 rounded-sm bg-border-strong",
          mode === "none" ? "opacity-100" : "opacity-0",
        )}
      />
    </Page>
  );
}

function ScrollMini({ mode }: { mode: ScrollSketch }) {
  return (
    <Page>
      <span
        className={cn(
          "nav-sketch-bit absolute inset-x-1 top-1 h-1.5 rounded-sm",
          mode === "pin" || mode === "shrink" || mode === "lock" ? "bg-accent" : "bg-border",
          mode === "shrink" && "inset-x-1 h-1",
        )}
      />
      <span
        className={cn(
          "nav-sketch-bit absolute top-3 left-1 h-2 w-1.5 rounded-sm bg-accent",
          mode === "highlight" ? "opacity-100" : "opacity-0",
        )}
      />
      <span className="absolute inset-x-2 top-[1.35rem] h-0.5 rounded-full bg-border" />
      <span className="absolute inset-x-3 top-[1.7rem] h-0.5 rounded-full bg-border" />
      <span
        className={cn(
          "nav-sketch-bit absolute inset-0 bg-fg/25",
          mode === "lock" ? "opacity-100" : "opacity-0",
        )}
      />
    </Page>
  );
}
