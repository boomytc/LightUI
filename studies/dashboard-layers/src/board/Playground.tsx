import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { DEFAULT_DIM, DEFAULT_KPI } from "../lib/dashboard-data";
import { KINDS, type KindId } from "../lib/kinds";
import {
  EMPTY_SELECTION,
  canExpand,
  layerOf,
  selectionForStage,
  stageState,
  type Layer,
  type Selection,
} from "../lib/machines";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Board } from "./Board";
import { Window } from "./Frame";
import "./board.css";

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("layered");
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
    <div className="min-w-0" data-playground="dashboard">
      <KindPair active={active} locale={locale} onChange={setActive} />

      <p className="mb-4 text-[13px] leading-relaxed text-fg-muted">
        {pick(meta.tells, locale)}
        {meta.note ? (
          <span className="text-fg-subtle"> · {pick(meta.note, locale)}</span>
        ) : null}
      </p>

      <div key={meta.id} className="board-kind-in">
        <KindDemo id={meta.id} />
      </div>

      <ul className="mt-4 flex flex-wrap gap-2">
        {meta.scenes.map((scene) => (
          <li
            key={scene.zh}
            className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent"
          >
            {pick(scene, locale)}
          </li>
        ))}
        {meta.rules.map((rule) => (
          <li
            key={rule.zh}
            className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-fg-muted"
          >
            {pick(rule, locale)}
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <SpecCard text={pick(meta.spec, locale)} locale={locale} />
      </div>
    </div>
  );
}

function KindPair({
  active,
  locale,
  onChange,
}: {
  active: KindId;
  locale: Locale;
  onChange: (id: KindId) => void;
}) {
  return (
    <div className="mb-4">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <p className="text-[12px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
          {locale === "en" ? "Drill or platter" : "下钻还是一盘端"}
        </p>
        <p className="hidden text-[11px] text-fg-subtle sm:block">
          {locale === "en" ? "Keys 1–2 pick a leaf." : "数字键 1–2 选一片叶子。"}
        </p>
      </div>
      <div
        role="tablist"
        aria-label={locale === "en" ? "Board kinds" : "看板种类"}
        className="grid grid-cols-2 gap-2"
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
              className="board-pair-card"
            >
              <span
                className={cn(
                  "font-mono text-[10px] tracking-[0.14em]",
                  on ? "text-accent" : "text-fg-subtle",
                )}
              >
                {kind.index}
              </span>
              <span
                className={cn(
                  "mt-1 block text-[14px] font-semibold tracking-tight",
                  on ? "text-fg" : "text-fg-muted",
                )}
              >
                {pick(kind.zh, locale)}
              </span>
              <span className="mt-0.5 block text-[12px] leading-snug text-fg-subtle">
                {pick(kind.oneLiner, locale)}
              </span>
              {kind.id === "layered" ? (
                <span className="board-mini-depth" aria-hidden="true">
                  <span />
                  <i />
                  <span />
                  <i />
                  <span />
                </span>
              ) : (
                <span className="board-mini-platter" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              )}
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

function nowLabel(view: KindId, layer: Layer, locale: Locale): string {
  if (view === "platter") {
    return locale === "en" ? "All in view" : "全部在场";
  }
  if (layer === "kpi") return locale === "en" ? "Results only" : "只见结果";
  if (layer === "dim") return locale === "en" ? "At dimension" : "已到维度";
  return locale === "en" ? "At detail" : "已到明细";
}

export function KindDemo({ id, state }: { id: KindId; state?: string }) {
  const locked = state === "kpi" || state === "dim" || state === "all";
  const locale = useLocale();
  const meta = KINDS.find((k) => k.id === id) ?? KINDS[0]!;
  const start: Selection = locked
    ? selectionForStage(stageState(state ?? "", id), DEFAULT_KPI, DEFAULT_DIM)
    : canExpand(id)
      ? EMPTY_SELECTION
      : { kpi: DEFAULT_KPI, dim: null };
  const [sel, setSel] = useState<Selection>(start);
  const selection = locked ? start : sel;
  const layer = layerOf(id, selection);

  function pickKpi(kpiId: string) {
    if (locked) return;
    if (!canExpand(id)) {
      setSel({ kpi: kpiId, dim: null });
      return;
    }
    setSel((cur) =>
      cur.kpi === kpiId && !cur.dim ? EMPTY_SELECTION : { kpi: kpiId, dim: null },
    );
  }

  function pickDim(dimId: string) {
    if (locked) return;
    if (!canExpand(id)) {
      setSel((cur) => ({
        kpi: cur.kpi ?? DEFAULT_KPI,
        dim: cur.dim === dimId ? null : dimId,
      }));
      return;
    }
    setSel((cur) => ({
      kpi: cur.kpi ?? DEFAULT_KPI,
      dim: cur.dim === dimId ? null : dimId,
    }));
  }

  function retreat(to: "kpi" | "dim") {
    if (locked || !canExpand(id)) return;
    if (to === "kpi") setSel(EMPTY_SELECTION);
    else setSel((cur) => ({ kpi: cur.kpi, dim: null }));
  }

  return (
    <Window
      kind={id}
      title={pick(meta.window, locale)}
      action={
        <span className="board-now" data-view={id} data-layer={layer} aria-live="polite">
          {nowLabel(id, layer, locale)}
        </span>
      }
    >
      <Board
        view={id}
        selection={selection}
        locale={locale}
        locked={locked}
        onSelectKpi={pickKpi}
        onSelectDim={pickDim}
        onRetreat={retreat}
      />
    </Window>
  );
}
