import { useEffect, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { BRIEFS } from "../lib/fixtures";
import { KINDS, type KindId } from "../lib/kinds";
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

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("skeleton");
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0]!;

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
    <div className="min-w-0">
      <section className="min-w-0 overflow-x-hidden">
        <KindSwitch active={active} locale={locale} onChange={setActive} />

        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 03</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{meta.name}</h2>
            <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
          </div>
          <p className="max-w-xs text-right text-[12px] leading-relaxed text-fg-subtle">
            {pick(meta.tells, locale)}
          </p>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {meta.scenes.map((scene) => (
            <span
              key={scene.zh}
              className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent"
            >
              {pick(scene, locale)}
            </span>
          ))}
        </div>

        {meta.note ? <p className="mb-4 text-[13px] text-accent">{pick(meta.note, locale)}</p> : null}

        <SpecCard text={pick(meta.spec, locale)} locale={locale} />

        <KindDemo key={meta.id} id={meta.id} />

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

function KindSwitch({
  active,
  locale,
  onChange,
}: {
  active: KindId;
  locale: Locale;
  onChange: (id: KindId) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label={locale === "en" ? "Pending kinds" : "等待种类"}
      className="mb-5 inline-flex rounded-full border border-border bg-surface-2 p-1"
    >
      {KINDS.map((kind) => {
        const on = kind.id === active;
        return (
          <button
            key={kind.id}
            type="button"
            role="tab"
            data-kind={kind.id}
            aria-selected={on}
            onClick={() => onChange(kind.id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
              on ? "bg-surface text-fg shadow-card" : "text-fg-muted hover:text-fg",
            )}
          >
            {pick(kind.zh, locale)}
          </button>
        );
      })}
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
    <div className="mb-5 rounded-2xl border border-fg bg-fg px-4 py-3.5 text-surface">
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

  useEffect(() => {
    if (!leaving) return;
    const done = window.setTimeout(() => setLeaving(false), CROSSFADE_MS);
    return () => window.clearTimeout(done);
  }, [leaving]);

  function go(next: StageState) {
    if (locked) return;
    if (id === "skeleton" && next === "ready" && phase !== "ready" && shine) {
      setLeaving(true);
    }
    setPhase(next);
  }

  const action = locked ? undefined : (
    <ChromeAction locale={locale} id={id} seat={seat} onGo={go} />
  );

  return (
    <Window title={pick(meta.window, locale)} action={action}>
      <Workbench
        id={id}
        seat={seat}
        locale={locale}
        reduced={reduced}
        leaving={leaving && !reduced}
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
            ? "Reset"
            : "重置"
          : locale === "en"
            ? "Load"
            : "载入"}
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
  const fadeIn = seat === "content" && !reduced && !locked && id === "skeleton";

  if (seat === "veil") {
    return <PageVeil locale={locale} />;
  }

  return (
    <div className="relative min-w-0 overflow-x-hidden">
      <SceneHeading locale={locale} count={count} />
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

