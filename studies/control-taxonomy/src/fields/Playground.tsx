import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { answersFor, chooseControl, nextStep, type Answers, type ControlId } from "../lib/machines";
import { KINDS, type KindId } from "../lib/kinds";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { CheckboxDemo } from "./CheckboxDemo";
import { Chooser } from "./Chooser";
import { ComboboxDemo } from "./ComboboxDemo";
import { RadioDemo } from "./RadioDemo";
import { SelectDemo } from "./SelectDemo";
import { TextareaDemo } from "./TextareaDemo";
import { TextFieldDemo } from "./TextFieldDemo";

export function Playground() {
  const locale = useLocale();
  const [answers, setAnswers] = useState<Answers>({});
  const active = chooseControl(answers);
  const meta = active ? (KINDS.find((k) => k.id === active) ?? KINDS[0]) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <Chooser answers={answers} onChange={setAnswers} />

      <section className="min-w-0">
        <nav
          aria-label={locale === "en" ? "Control kinds" : "控件种类"}
          className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0"
        >
          {KINDS.map((kind) => {
            const on = kind.id === active;
            return (
              <button
                key={kind.id}
                type="button"
                data-kind={kind.id}
                onClick={() => setAnswers(answersFor(kind.id))}
                className={cn(
                  "flex min-w-40 shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors",
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
        </nav>

        {meta ? (
          <>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 06</p>
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
          </>
        ) : nextStep(answers) === "demand" ? (
          <DemandSplit locale={locale} onPick={(id) => setAnswers(answersFor(id))} />
        ) : (
          <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-[14px] text-fg-subtle">
            {locale === "en" ? "Finish the tree first." : "先走完判断树。"}
          </p>
        )}
      </section>
    </div>
  );
}

function DemandSplit({
  locale,
  onPick,
}: {
  locale: "zh" | "en";
  onPick: (id: ControlId) => void;
}) {
  const fill = KINDS.filter((k) => k.id === "text-field" || k.id === "textarea");
  const pickKind = KINDS.filter((k) => k.id !== "text-field" && k.id !== "textarea");
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Column
        title={locale === "en" ? "Fill it in" : "自己填写"}
        items={fill}
        locale={locale}
        onPick={onPick}
      />
      <Column
        title={locale === "en" ? "Pick from answers" : "从答案里选"}
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
  items,
  locale,
  onPick,
  accent,
}: {
  title: string;
  items: typeof KINDS;
  locale: "zh" | "en";
  onPick: (id: ControlId) => void;
  accent?: boolean;
}) {
  return (
    <div className={cn("rounded-2xl border bg-surface-2 p-4", accent ? "border-accent/40" : "border-border")}>
      <h3 className={cn("text-[15px] font-semibold", accent ? "text-accent" : "text-fg")}>{title}</h3>
      <div className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            data-kind={item.id}
            onClick={() => onPick(item.id)}
            className="rounded-lg bg-surface px-3 py-2.5 text-left hover:bg-bg"
          >
            <span className="block text-[13px] font-medium">{item.name}</span>
            <span className="block text-[11px] text-fg-muted">{pick(item.zh, locale)}</span>
          </button>
        ))}
      </div>
    </div>
  );
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
