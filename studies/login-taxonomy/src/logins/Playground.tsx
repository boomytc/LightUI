import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { KINDS, type KindId } from "../lib/kinds";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { KindDemo } from "./Scenes";
import "./login.css";

export { KindDemo };

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("centered");
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
    <div className="min-w-0">
      <p className="mb-3 text-[12px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
        {locale === "en" ? "How arrival sits" : "进门怎么站"}
      </p>

      <div className="login-scan">
        <div className="login-scan-head" aria-hidden="true">
          <span className="font-mono">#</span>
          <span>{locale === "en" ? "Stage" : "舞台"}</span>
          <span>{locale === "en" ? "How it sits" : "摆法"}</span>
          <span>{locale === "en" ? "Machine" : "机器"}</span>
        </div>
        <nav
          aria-label={locale === "en" ? "Login kinds" : "登录种类"}
          className="flex flex-col"
        >
          {KINDS.map((kind) => {
            const on = kind.id === active;
            return (
              <button
                key={kind.id}
                type="button"
                data-kind={kind.id}
                aria-pressed={on}
                onClick={() => setActive(kind.id)}
                className={cn("login-scan-row", on && "is-on")}
              >
                <span className={cn("font-mono text-[11px] tabular-nums", on ? "text-accent" : "text-fg-subtle")}>
                  {kind.index}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold tracking-tight">
                    {pick(kind.zh, locale)}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-fg-muted md:hidden">
                    {pick(kind.stage, locale)}
                  </span>
                </span>
                <span className="hidden min-w-0 truncate text-[13px] font-medium text-fg md:block">
                  {pick(kind.stage, locale)}
                </span>
                <span className="hidden font-mono text-[11px] text-fg-subtle md:block">
                  {pick(kind.machine, locale)}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 mb-3 min-w-0">
        <p className="font-mono text-[11px] tabular-nums text-accent">{meta.index} / 05</p>
        <h2 className="mt-0.5 text-[1.35rem] font-semibold tracking-tight">{pick(meta.zh, locale)}</h2>
        <p className="mt-1 text-[13px] leading-snug text-fg-muted">
          {pick(meta.oneLiner, locale)}
          <span className="text-fg-subtle"> · {pick(meta.tells, locale)}</span>
        </p>
      </div>

      <div key={meta.id} className="login-enter login-playground w-full min-w-0 overflow-x-hidden">
        <KindDemo id={meta.id} />
      </div>

      <SpecCard text={pick(meta.spec, locale)} locale={locale} />

      {meta.note ? <p className="mt-2 text-[12px] text-accent">{pick(meta.note, locale)}</p> : null}

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {meta.scenes.map((scene) => (
          <li
            key={scene.zh}
            className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium text-accent"
          >
            {pick(scene, locale)}
          </li>
        ))}
        {meta.rules.map((rule) => (
          <li
            key={rule.zh}
            className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] text-fg-muted"
          >
            {pick(rule, locale)}
          </li>
        ))}
      </ul>
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
    <div className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-surface px-3 py-2">
      <p className="shrink-0 pt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-fg-subtle">
        {locale === "en" ? "Say it this way" : "说清楚"}
      </p>
      <p className="min-w-0 flex-1 text-[13px] leading-snug text-fg-muted">{text}</p>
      <button
        type="button"
        onClick={copy}
        className="inline-flex shrink-0 items-center gap-1 rounded-md px-1 py-0.5 text-[11px] text-fg-subtle transition-colors hover:text-fg"
      >
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        {copied ? (locale === "en" ? "Copied" : "已复制") : locale === "en" ? "Copy" : "复制"}
      </button>
    </div>
  );
}
