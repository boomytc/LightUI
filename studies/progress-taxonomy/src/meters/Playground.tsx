import { useEffect, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { KINDS, type KindMeta } from "../lib/kinds";
import {
  category,
  prefersStatic,
  resolveLock,
  type KindId,
} from "../lib/machines";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { useRunProgress } from "../lib/use-run-progress";
import { cn } from "../lib/utils";
import { Scene } from "./Scenes";

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("fill");
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0];

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav
        aria-label={locale === "en" ? "Progress kinds" : "进度种类"}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
      >
        <Group
          label={locale === "en" ? "Determinate" : "确定进度"}
          kinds={KINDS.filter((k) => k.category === "determinate")}
          active={active}
          locale={locale}
          onPick={setActive}
        />
        <Group
          label={locale === "en" ? "Indeterminate" : "不确定进度"}
          kinds={KINDS.filter((k) => k.category === "indeterminate")}
          active={active}
          locale={locale}
          onPick={setActive}
        />
      </nav>

      <section className="min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 08</p>
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

        <KindDemo id={meta.id} />

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
    <div className="flex gap-2 lg:flex-col">
      <p className="hidden px-1 pt-2 font-mono text-[10px] tracking-[0.14em] text-fg-subtle uppercase lg:block">
        {label}
      </p>
      {kinds.map((kind) => {
        const on = kind.id === active;
        return (
          <button
            key={kind.id}
            type="button"
            data-kind={kind.id}
            onClick={() => onPick(kind.id)}
            className={cn(
              "flex min-w-40 shrink-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors lg:min-w-0 lg:w-full",
              on
                ? "border-border-strong bg-surface shadow-card"
                : "border-transparent bg-transparent hover:bg-surface-2",
            )}
          >
            <span className={cn("font-mono text-[11px] tabular-nums", on ? "text-accent" : "text-fg-subtle")}>
              {kind.index}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-medium">{kind.name}</span>
              <span className="block truncate text-[11px] text-fg-muted">{pick(kind.zh, locale)}</span>
            </span>
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
    cat === "determinate" ? (phase === "idle" ? 0 : phase === "done" ? 1 : value) : 0;
  const loop = cat === "indeterminate" && looping && !prefersStatic(reduced, id);
  const wave = cat === "determinate" && !reduced && (phase === "run" || phase === "done");

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
      className="rounded-full bg-fg px-2.5 py-1 text-[11px] font-medium text-surface disabled:opacity-40"
    >
      {children}
    </button>
  );
}
