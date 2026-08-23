import { useEffect, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { KINDS, type KindMeta } from "../lib/kinds";
import {
  category,
  MID_PROGRESS,
  prefersStatic,
  resolveLock,
  type KindId,
} from "../lib/machines";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { useRunProgress } from "../lib/use-run-progress";
import { cn } from "../lib/utils";
import { Scene } from "./Scenes";

const DETERMINATE = KINDS.filter((k) => k.category === "determinate");
const LOOP = KINDS.filter((k) => k.category === "indeterminate");

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("liquid");
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0];

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
    <div data-playground="progress" className="min-w-0">
      <nav aria-label={locale === "en" ? "Progress kinds" : "进度种类"} className="flex flex-col gap-2">
        <Group
          label={locale === "en" ? "Determinate" : "能算"}
          kinds={DETERMINATE}
          active={active}
          locale={locale}
          onPick={setActive}
        />
        <Group
          label={locale === "en" ? "Loop" : "循环"}
          kinds={LOOP}
          active={active}
          locale={locale}
          onPick={setActive}
        />
      </nav>

      <section className="mt-8 min-w-0">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 08</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{meta.name}</h2>
            <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
          </div>
          <p className="max-w-xs text-right text-[12px] leading-relaxed text-fg-subtle">
            {pick(meta.tells, locale)}
          </p>
        </div>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)] lg:items-start">
          <KindDemo key={meta.id} id={meta.id} />

          <div className="min-w-0">
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
          </div>
        </div>
      </section>
    </div>
  );
}

function Group({
  label,
  kinds,
  active,
  locale,
  onPick,
}: {
  label: string;
  kinds: KindMeta[];
  active: KindId;
  locale: Locale;
  onPick: (id: KindId) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <p className="shrink-0 font-mono text-[10px] tracking-[0.14em] text-fg-subtle uppercase sm:w-28">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {kinds.map((kind) => {
          const on = kind.id === active;
          return (
            <button
              key={kind.id}
              type="button"
              data-kind={kind.id}
              aria-pressed={on}
              onClick={() => onPick(kind.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors",
                on
                  ? "border-fg bg-fg text-surface"
                  : "border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg",
              )}
            >
              <span className={cn("font-mono text-[10px] tabular-nums", on ? "text-surface/70" : "text-fg-subtle")}>
                {kind.index}
              </span>
              <span className="font-medium">{locale === "en" ? kind.name : pick(kind.zh, locale)}</span>
            </button>
          );
        })}
      </div>
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

export function KindDemo({ id, state }: { id: KindId; state?: string }) {
  if (state) {
    return <LockedScene id={id} state={state} />;
  }
  return <LiveScene key={id} id={id} />;
}

function LockedScene({ id, state }: { id: KindId; state: string }) {
  const locale = useLocale();
  const reduced = useReducedMotion();
  const snap = resolveLock(id, state);
  const looping = snap.looping && !prefersStatic(reduced, id);
  return (
    <Scene
      id={id}
      progress={snap.progress}
      looping={looping}
      wave={false}
      locale={locale}
      scale="compact"
    />
  );
}

function LiveScene({ id }: { id: KindId }) {
  const locale = useLocale();
  const reduced = useReducedMotion();
  const cat = category(id);
  const [phase, setPhase] = useState<"idle" | "run" | "done">("idle");
  const [restartKey, setRestartKey] = useState(0);
  const [looping, setLooping] = useState(true);
  const { value, done } = useRunProgress({
    playing: cat === "determinate" && phase === "run",
    reduced,
    restartKey,
  });

  useEffect(() => {
    if (done && phase === "run") setPhase("done");
  }, [done, phase]);

  const progress =
    cat === "determinate" ? (phase === "idle" ? MID_PROGRESS : phase === "done" ? 1 : value) : 0;
  const loop = cat === "indeterminate" && looping && !prefersStatic(reduced, id);
  const wave = cat === "determinate" && !reduced;

  function startDeterminate() {
    setRestartKey((n) => n + 1);
    setPhase("run");
  }

  return (
    <Scene
      id={id}
      progress={progress}
      looping={loop}
      wave={wave}
      locale={locale}
      scale="hero"
      action={
        cat === "determinate" ? (
          <ActionButton disabled={phase === "run"} onClick={startDeterminate}>
            {phase === "done"
              ? locale === "en"
                ? "Again"
                : "再来"
              : locale === "en"
                ? "Start"
                : "开始"}
          </ActionButton>
        ) : looping ? (
          <ActionButton onClick={() => setLooping(false)}>
            {locale === "en" ? "Done" : "完成"}
          </ActionButton>
        ) : (
          <ActionButton onClick={() => setLooping(true)}>
            {locale === "en" ? "Start" : "开始"}
          </ActionButton>
        )
      }
    />
  );
}

function ActionButton({
  disabled,
  onClick,
  children,
}: {
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-full bg-fg px-4 py-1.5 text-[13px] font-medium text-surface disabled:opacity-40"
    >
      {children}
    </button>
  );
}
