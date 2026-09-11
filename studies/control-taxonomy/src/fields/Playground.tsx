import { useEffect, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import {
  answersFor,
  chooseControl,
  nextStep,
  type Answers,
  type ControlId,
} from "../lib/machines";
import { KINDS, type KindId, type KindMeta } from "../lib/kinds";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { CheckboxDemo } from "./CheckboxDemo";
import { Chooser, trailFor } from "./Chooser";
import { ComboboxDemo } from "./ComboboxDemo";
import { LiveFill } from "./Frame";
import { RadioDemo } from "./RadioDemo";
import { SelectDemo } from "./SelectDemo";
import { TextareaDemo } from "./TextareaDemo";
import { TextFieldDemo } from "./TextFieldDemo";
import "./fields.css";

const FILL_IDS: ControlId[] = ["text-field", "textarea"];
const PICK_IDS: ControlId[] = ["radio", "select", "combobox", "checkbox"];

export function Playground() {
  const locale = useLocale();
  const [answers, setAnswers] = useState<Answers>({});
  const [sceneKey, setSceneKey] = useState(0);
  const active = chooseControl(answers);
  const meta = active ? (KINDS.find((k) => k.id === active) ?? KINDS[0]) : null;
  const step = nextStep(answers);

  function jump(id: ControlId) {
    setAnswers(answersFor(id));
    setSceneKey((n) => n + 1);
  }

  function walk(next: Answers) {
    setAnswers(next);
    if (chooseControl(next)) setSceneKey((n) => n + 1);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const n = Number(e.key);
      const leaves = [...FILL_IDS, ...PICK_IDS];
      if (n >= 1 && n <= leaves.length) {
        e.preventDefault();
        jump(leaves[n - 1]!);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div data-grid="12" className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
      <div data-col="kinds" className="flex min-w-0 flex-col gap-4 lg:col-span-4">
        <BranchRail active={active} locale={locale} onPick={jump} />
        <Chooser answers={answers} onChange={walk} />
        {meta ? <Lesson meta={meta} locale={locale} answers={answers} /> : null}
      </div>

      <section data-col="live" className="flex min-h-0 min-w-0 flex-col lg:col-span-8">
        {meta ? (
          <LiveFill>
            <div key={`${meta.id}-${sceneKey}`} className="ctl-enter h-full min-h-0">
              <KindDemo id={meta.id} />
            </div>
          </LiveFill>
        ) : step === "demand" ? (
          <LiveSlot>
            <DemandSplit locale={locale} onPick={jump} />
          </LiveSlot>
        ) : (
          <LiveSlot dashed>
            <p className="ctl-enter text-[14px] text-fg-subtle">
              {locale === "en" ? "Finish the tree first." : "先走完判断树。"}
            </p>
            <p className="mt-2 text-[12px] text-fg-subtle">
              {stepHint(step, locale)}
            </p>
          </LiveSlot>
        )}
      </section>
    </div>
  );
}

function BranchRail({
  active,
  locale,
  onPick,
}: {
  active: ControlId | null;
  locale: Locale;
  onPick: (id: ControlId) => void;
}) {
  const fillOn = active != null && FILL_IDS.includes(active);
  const pickOn = active != null && PICK_IDS.includes(active);

  return (
    <nav aria-label={locale === "en" ? "Fill or pick" : "填还是选"} className="min-w-0">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-[12px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
          {locale === "en" ? "First ask fill or pick" : "先问是填还是选"}
        </p>
        <p className="text-[11px] text-fg-subtle">{locale === "en" ? "1–6" : "1–6"}</p>
      </div>

      <div className="grid gap-3">
        <Branch
          title={locale === "en" ? "Fill it in" : "自己填"}
          hint={locale === "en" ? "One line or a paragraph" : "一行，或写一段"}
          on={fillOn}
          ids={FILL_IDS}
          active={active}
          locale={locale}
          onPick={onPick}
        />
        <Branch
          title={locale === "en" ? "Pick from answers" : "从答案里选"}
          hint={locale === "en" ? "Compare, scan, search, or several" : "可见比较、短列表、边搜边选、同时多个"}
          on={pickOn}
          ids={PICK_IDS}
          active={active}
          locale={locale}
          onPick={onPick}
          accent
        />
      </div>
    </nav>
  );
}

function Branch({
  title,
  hint,
  on,
  ids,
  active,
  locale,
  onPick,
  accent,
}: {
  title: string;
  hint: string;
  on: boolean;
  ids: ControlId[];
  active: ControlId | null;
  locale: Locale;
  onPick: (id: ControlId) => void;
  accent?: boolean;
}) {
  return (
    <div className={cn("relative rounded-2xl border p-2", on ? "border-border-strong bg-surface shadow-card" : "border-border bg-surface-2")}>
      <div className="mb-1.5 flex items-center gap-2 px-1.5 pt-0.5">
        <span
          aria-hidden="true"
          className={cn("ctl-branch-dot size-2.5 rounded-full", on ? (accent ? "bg-accent" : "bg-fg") : "bg-border-strong")}
        />
        <div className="min-w-0">
          <p className={cn("text-[13px] font-semibold", on && accent ? "text-accent" : "text-fg")}>{title}</p>
          <p className="text-[11px] text-fg-subtle">{hint}</p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {ids.map((id) => {
          const kind = KINDS.find((k) => k.id === id);
          if (!kind) return null;
          const selected = kind.id === active;
          return (
            <button
              key={kind.id}
              type="button"
              data-kind={kind.id}
              aria-pressed={selected}
              onClick={() => onPick(kind.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-[border-color,background-color,box-shadow] duration-200",
                selected
                  ? "border-border-strong bg-surface shadow-card"
                  : "border-transparent bg-transparent hover:bg-surface",
              )}
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full font-mono text-[10px] tabular-nums",
                  selected ? "bg-accent text-accent-fg" : "bg-bg text-fg-subtle",
                )}
              >
                {kind.index}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium">{pick(kind.zh, locale)}</span>
                <span className="block truncate text-[11px] text-fg-muted">{leafSplit(kind.id, locale)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function leafSplit(id: ControlId, locale: Locale): string {
  const map: Record<ControlId, { zh: string; en: string }> = {
    "text-field": { zh: "一行就够", en: "One line" },
    textarea: { zh: "要写一段", en: "A paragraph" },
    radio: { zh: "可见比较", en: "Compare in view" },
    select: { zh: "短列表", en: "Short list" },
    combobox: { zh: "边搜边选", en: "Type to find" },
    checkbox: { zh: "同时多个", en: "Several at once" },
  };
  return locale === "en" ? map[id].en : map[id].zh;
}

function LiveSlot({ children, dashed }: { children: ReactNode; dashed?: boolean }) {
  return (
    <div
      data-live="pane"
      className={cn(
        "flex h-full min-h-[20rem] flex-1 flex-col rounded-2xl border bg-surface p-5 sm:p-6 lg:min-h-[32rem]",
        dashed ? "items-center justify-center border-dashed border-border" : "border-border shadow-card",
      )}
    >
      {children}
    </div>
  );
}

function Lesson({
  meta,
  locale,
  answers,
}: {
  meta: KindMeta;
  locale: Locale;
  answers: Answers;
}) {
  const trail = trailFor(answers, locale);
  return (
    <div className="min-w-0">
      {trail.length > 0 ? <Trail parts={trail} /> : null}
      <p className="mt-3 font-mono text-[12px] tabular-nums text-accent">{meta.index} / 06</p>
      <h2 className="mt-1 text-[1.35rem] font-semibold tracking-tight">{meta.name}</h2>
      <p className="mt-1 text-[13px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
      <p className="mt-2 text-[12px] leading-relaxed text-fg-subtle">{pick(meta.tells, locale)}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {meta.scenes.map((scene) => (
          <span
            key={scene.zh}
            className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent"
          >
            {pick(scene, locale)}
          </span>
        ))}
      </div>

      {meta.note ? <p className="mt-3 text-[13px] text-accent">{pick(meta.note, locale)}</p> : null}

      <div className="mt-4">
        <SpecCard text={pick(meta.spec, locale)} locale={locale} />
      </div>

      <ul className="mt-3 flex flex-wrap gap-2">
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
  );
}

function Trail({ parts }: { parts: string[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-1 text-[11px] text-fg-subtle">
      {parts.map((part, i) => (
        <li key={`${part}-${i}`} className="inline-flex items-center gap-1">
          {i > 0 ? <span aria-hidden="true" className="text-border-strong">→</span> : null}
          <span className={i === parts.length - 1 ? "font-medium text-accent" : undefined}>{part}</span>
        </li>
      ))}
    </ol>
  );
}

function DemandSplit({
  locale,
  onPick,
}: {
  locale: "zh" | "en";
  onPick: (id: ControlId) => void;
}) {
  const fill = FILL_IDS.map((id) => KINDS.find((k) => k.id === id)).filter(
    (k): k is (typeof KINDS)[number] => Boolean(k),
  );
  const pickKind = PICK_IDS.map((id) => KINDS.find((k) => k.id === id)).filter(
    (k): k is (typeof KINDS)[number] => Boolean(k),
  );
  return (
    <div className="grid h-full min-h-0 flex-1 gap-3 sm:grid-cols-2">
      <Column
        title={locale === "en" ? "Fill it in" : "自己填写"}
        hint={locale === "en" ? "No ready-made answers" : "没有现成答案"}
        items={fill}
        locale={locale}
        onPick={onPick}
      />
      <Column
        title={locale === "en" ? "Pick from answers" : "从答案里选"}
        hint={locale === "en" ? "The answers already exist" : "答案已经在那里"}
        items={pickKind}
        locale={locale}
        onPick={onPick}
        accent
      />
    </div>
  );
}

function Column({
  title,
  hint,
  items,
  locale,
  onPick,
  accent,
}: {
  title: string;
  hint: string;
  items: typeof KINDS;
  locale: "zh" | "en";
  onPick: (id: ControlId) => void;
  accent?: boolean;
}) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col rounded-2xl border bg-surface-2 p-4", accent ? "border-accent/40" : "border-border")}>
      <h3 className={cn("text-[15px] font-semibold", accent ? "text-accent" : "text-fg")}>{title}</h3>
      <p className="mt-0.5 text-[12px] text-fg-subtle">{hint}</p>
      <div className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            data-kind={item.id}
            onClick={() => onPick(item.id)}
            className="ctl-choice rounded-lg bg-surface px-3 py-2.5 text-left hover:bg-bg"
          >
            <span className="block text-[13px] font-medium">{pick(item.zh, locale)}</span>
            <span className="block text-[11px] text-fg-muted">{leafSplit(item.id, locale)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function stepHint(step: ReturnType<typeof nextStep>, locale: Locale): string {
  if (step === "length") return locale === "en" ? "One line, or a paragraph?" : "一行就够，还是要写一段？";
  if (step === "cardinality") return locale === "en" ? "Several at once, or only one?" : "可以同时多个，还是只能一个？";
  if (step === "find") return locale === "en" ? "Compare, scan, or type to find?" : "可见比较、短列表，还是边搜边选？";
  return "";
}

function SpecCard({ text, locale }: { text: string; locale: "zh" | "en" }) {
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
  switch (id) {
    case "text-field":
      return <TextFieldDemo state={state} />;
    case "textarea":
      return <TextareaDemo state={state} />;
    case "select":
      return <SelectDemo state={state} />;
    case "combobox":
      return <ComboboxDemo state={state} />;
    case "radio":
      return <RadioDemo state={state} />;
    case "checkbox":
      return <CheckboxDemo state={state} />;
  }
}
