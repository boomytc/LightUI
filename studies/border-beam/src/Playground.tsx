import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { MembershipCard } from "./MembershipCard";
import { KINDS } from "./lib/kinds";
import { isNaive, type KindId, type StageState } from "./lib/machines";
import { pick, useLocale, type Locale } from "./lib/site-locale";
import { useReducedMotion } from "./lib/use-reduced-motion";
import { cn } from "./lib/utils";
import "./beam.css";

export function Playground() {
  const locale = useLocale();
  const reduced = useReducedMotion();
  const [park, setPark] = useState(false);
  const state: StageState = park ? "park" : "run";
  const beam = KINDS.find((k) => k.id === "beam") ?? KINDS[0]!;

  return (
    <div className="min-w-0">
      <section className="min-w-0 overflow-x-hidden">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">01 / 02</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">
              {locale === "en" ? "Border beam vs flood" : "边框光束 | 铺满（错）"}
            </h2>
            <p className="mt-1 text-[14px] text-fg-muted">
              {locale === "en"
                ? "Same membership card. Contrast is the path: stroke, or fill."
                : "同一张会员卡。对照的是路径：走边框，还是铺满。"}
            </p>
          </div>
          <label className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[13px]">
            <span>{locale === "en" ? "Park the beam" : "停住"}</span>
            <input
              type="checkbox"
              checked={park}
              onChange={(e) => setPark(e.target.checked)}
              className="accent-accent"
            />
          </label>
        </div>

        <SpecCard text={pick(beam.spec, locale)} locale={locale} />

        <div className="beam-compare" data-layout="compare">
          {KINDS.map((kind) => (
            <KindColumn
              key={kind.id}
              id={kind.id}
              state={state}
              reduced={reduced}
              locale={locale}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function KindColumn({
  id,
  state,
  reduced,
  locale,
}: {
  id: KindId;
  state: StageState;
  reduced: boolean;
  locale: Locale;
}) {
  const meta = KINDS.find((k) => k.id === id) ?? KINDS[0]!;
  const wrong = isNaive(id);

  return (
    <article className="beam-slot min-w-0" data-column={id}>
      <p className={cn("font-mono text-[12px] tabular-nums", wrong ? "text-fg-subtle" : "text-accent")}>
        {meta.index}
        {wrong ? (locale === "en" ? " · wrong" : " · 错") : ""}
      </p>
      <h3 className="mt-1 text-[1.15rem] font-semibold tracking-tight">{pick(meta.zh, locale)}</h3>
      <p className="mt-1 text-[13px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
      <div className="mt-4 min-w-0">
        <MembershipCard kind={id} state={state} reduced={reduced} locale={locale} />
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-fg-subtle">{pick(meta.tells, locale)}</p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {meta.rules.map((rule) => (
          <li
            key={rule.zh}
            className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-fg-muted"
          >
            {pick(rule, locale)}
          </li>
        ))}
      </ul>
    </article>
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
