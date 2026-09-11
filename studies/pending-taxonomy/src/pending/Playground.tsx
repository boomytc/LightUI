import { useEffect, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { BRIEFS } from "../lib/fixtures";
import { KINDS, OCCUPANCY_ASKS, type KindId } from "../lib/kinds";
import {
  CROSSFADE_MS,
  occupancy,
  shimmerMotion,
  type Occupancy,
  type StageState,
} from "../lib/machines";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { cn } from "../lib/utils";
import { Window } from "./Frame";
import { BoneList, BriefList, EmptyPanel, PageVeil, SceneHeading } from "./Scene";
import "./pending.css";

const ARRIVE_MS = 1600;

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("skeleton");
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0]!;
  const ask = OCCUPANCY_ASKS.find((item) => item.id === active) ?? OCCUPANCY_ASKS[0]!;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      const n = Number(e.key);
      if (n >= 1 && n <= KINDS.length) {
        e.preventDefault();
        setActive(KINDS[n - 1]!.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      data-playground="pending"
      data-lesson={meta.id}
      className="grid min-w-0 gap-8 lg:grid-cols-[minmax(28rem,32rem)_minmax(0,1fr)] lg:items-start lg:gap-10"
    >
      <section data-pane="demo" className="min-w-0">
        <KindDemo key={meta.id} id={meta.id} />
      </section>

      <section data-pane="lesson" className="min-w-0 lg:pt-1">
        <p className="mb-3 text-[12px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
          {locale === "en" ? "What occupies the screen?" : "屏幕上该留什么"}
        </p>

        <nav
          aria-label={locale === "en" ? "Pending occupancy" : "等待占位"}
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
        >
          {KINDS.map((kind) => {
            const on = kind.id === active;
            const kindAsk = OCCUPANCY_ASKS.find((item) => item.id === kind.id);
            return (
              <button
                key={kind.id}
                type="button"
                data-kind={kind.id}
                aria-pressed={on}
                onClick={() => setActive(kind.id)}
                className={cn(
                  "pending-ask flex min-w-52 shrink-0 items-start gap-3 rounded-2xl border px-3.5 py-3 text-left lg:min-w-0",
                  on
                    ? "border-border-strong bg-surface shadow-card"
                    : "border-border bg-surface hover:bg-surface-2",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full font-mono text-[11px] tabular-nums",
                    on ? "bg-accent text-accent-fg" : "bg-surface-2 text-fg-subtle",
                  )}
                >
                  {kind.index}
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold tracking-tight">
                    {pick(kind.zh, locale)}
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-fg-muted">
                    {kindAsk ? pick(kindAsk.ask, locale) : pick(kind.oneLiner, locale)}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-6 min-w-0">
          <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 03</p>
          <h2 className="mt-1 text-[1.45rem] font-semibold tracking-tight">{meta.name}</h2>
          <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
          <p className="mt-2 text-[12px] leading-relaxed text-fg-subtle">
            {pick(ask.ask, locale)}
            <span className="mx-1.5 text-border-strong">·</span>
            {pick(meta.tells, locale)}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {meta.scenes.map((scene) => (
            <span
              key={scene.zh}
              className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent"
            >
              {pick(scene, locale)}
            </span>
          ))}
        </div>

        {meta.note ? <p className="mt-4 text-[13px] text-accent">{pick(meta.note, locale)}</p> : null}

        <div className="mt-4">
          <SpecCard text={pick(meta.spec, locale)} locale={locale} />
        </div>

        <ul className="mt-4 flex flex-wrap gap-2">
          {meta.rules.map((rule) => (
            <li
              key={rule.zh}
              className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-fg-muted"
            >
              {pick(rule, locale)}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function SpecCard({ text, locale }: { text: string; locale: Locale }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-2xl border border-fg bg-fg px-4 py-3.5 text-surface">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium tracking-wide text-surface/45">
          {locale === "en" ? "Say it this way" : "说清楚"}
        </p>
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-surface/45 transition-colors hover:text-surface"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? (locale === "en" ? "Copied" : "已复制") : locale === "en" ? "Copy" : "复制"}
        </button>
      </div>
      <p className="mt-1.5 text-[14px] leading-relaxed text-surface/90">{text}</p>
    </div>
  );
}

export function KindDemo({ id, state }: { id: KindId; state?: StageState }) {
  const locale = useLocale();
  const reduced = useReducedMotion();
  const locked = state !== undefined;
  const liveDefault: StageState = id === "empty" ? "empty" : "loading";
  const [phase, setPhase] = useState<StageState>(locked ? state : liveDefault);
  const [leaving, setLeaving] = useState(false);
  const current = locked ? state : phase;
  const seat = occupancy(id, current);
  const meta = KINDS.find((k) => k.id === id) ?? KINDS[0]!;
  const shine = shimmerMotion(reduced);
  const covered = seat === "veil" || (leaving && id === "page" && seat === "content");

  useEffect(() => {
    if (!leaving) return;
    const done = window.setTimeout(() => setLeaving(false), CROSSFADE_MS);
    return () => window.clearTimeout(done);
  }, [leaving]);

  useEffect(() => {
    if (locked || id === "empty") return;
    if (phase !== "loading") return;
    const arrive = window.setTimeout(() => {
      if (shine && (id === "skeleton" || id === "page")) setLeaving(true);
      setPhase("ready");
    }, reduced ? 0 : ARRIVE_MS);
    return () => window.clearTimeout(arrive);
  }, [id, locked, reduced, phase, shine]);

  function go(next: StageState) {
    if (locked) return;
    if (next === "ready" && phase !== "ready" && shine && (id === "skeleton" || id === "page")) {
      setLeaving(true);
    }
    setPhase(next);
  }

  const action = locked ? undefined : (
    <ChromeAction locale={locale} id={id} seat={seat} onGo={go} />
  );

  return (
    <Window
      title={pick(meta.window, locale)}
      action={action}
      covered={seat === "veil"}
      overlay={
        covered ? (
          <PageVeil
            locale={locale}
            leaving={leaving && seat === "content"}
            onReveal={locked || seat === "content" ? undefined : () => go("ready")}
          />
        ) : null
      }
    >
      <Workbench
        id={id}
        seat={seat === "veil" ? "content" : seat}
        locale={locale}
        reduced={reduced}
        leaving={leaving && !reduced && id === "skeleton"}
        locked={locked}
        onCreate={() => go("ready")}
      />
    </Window>
  );
}

function ChromeAction({
  locale,
  id,
  seat,
  onGo,
}: {
  locale: Locale;
  id: KindId;
  seat: Occupancy;
  onGo: (next: StageState) => void;
}) {
  if (id === "skeleton" || id === "page") {
    return (
      <ActionButton onClick={() => onGo(seat === "content" ? "loading" : "ready")}>
        {seat === "content"
          ? locale === "en"
            ? "Replay"
            : "再看一次"
          : locale === "en"
            ? "Reveal"
            : "就绪"}
      </ActionButton>
    );
  }

  if (seat !== "content") return null;

  return (
    <ActionButton onClick={() => onGo("empty")}>
      {locale === "en" ? "Empty" : "清空"}
    </ActionButton>
  );
}

function ActionButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-fg px-2.5 py-1 text-[11px] font-medium text-surface"
    >
      {children}
    </button>
  );
}

function Workbench({
  id,
  seat,
  locale,
  reduced,
  leaving,
  locked,
  onCreate,
}: {
  id: KindId;
  seat: Occupancy;
  locale: Locale;
  reduced: boolean;
  leaving: boolean;
  locked: boolean;
  onCreate: () => void;
}) {
  const count = seat === "empty" ? 0 : seat === "content" ? BRIEFS.length : undefined;
  const fadeIn = seat === "content" && !reduced && !locked && (id === "skeleton" || id === "page");

  return (
    <div className="relative min-w-0 overflow-x-hidden">
      {seat === "empty" ? null : <SceneHeading locale={locale} count={count} />}
      <div
        className="relative min-w-0"
        aria-busy={seat === "skeleton"}
        aria-live="polite"
      >
        {seat === "skeleton" ? <BoneList locale={locale} reduceMotion={reduced} /> : null}
        {seat === "content" ? (
          <div className={fadeIn ? "pending-fade-in" : undefined}>
            <BriefList briefs={BRIEFS} locale={locale} />
          </div>
        ) : null}
        {seat === "empty" ? (
          <EmptyPanel locale={locale} onCreate={locked ? undefined : onCreate} />
        ) : null}
        {leaving && seat === "content" ? (
          <div className="pending-fade-out pointer-events-none absolute inset-x-0 top-0">
            <BoneList locale={locale} reduceMotion={reduced} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
