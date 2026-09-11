import { CLOSE_LABEL, COMMIT_MODELS, closeOf, commitOf } from "../lib/commit";
import { KINDS, type KindId } from "../lib/kinds";
import { pick, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import "./dropdown.css";

export function CommitRail({
  active,
  locale,
  onPick,
}: {
  active: KindId;
  locale: Locale;
  onPick: (id: KindId) => void;
}) {
  const commit = commitOf(active);

  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <p className="text-[12px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
          {locale === "en" ? "First name the commit" : "先定提交什么"}
        </p>
        <p className="hidden text-[11px] text-fg-subtle sm:block">
          {locale === "en" ? "Keys 1–7 pick a kind." : "数字键 1–7 选一种。"}
        </p>
      </div>

      <div
        className="dropdown-commit"
        role="listbox"
        aria-label={locale === "en" ? "Commit models" : "提交模型"}
      >
        {COMMIT_MODELS.map((model) => {
          const on = model.id === commit;
          return (
            <button
              key={model.id}
              type="button"
              role="option"
              aria-selected={on}
              data-commit={model.id}
              onClick={() => {
                const stay = model.kinds.find((id) => id === active);
                onPick(stay ?? model.kinds[0]!);
              }}
              className={cn(
                "dropdown-commit-card border",
                on
                  ? "border-border-strong bg-play-glow shadow-card"
                  : "border-border bg-surface hover:bg-surface-2",
              )}
            >
              <span
                className={cn(
                  "font-mono text-[10px] tracking-[0.14em]",
                  on ? "text-accent" : "text-fg-subtle",
                )}
              >
                {model.index}
              </span>
              <span className="mt-1 block text-[14px] font-semibold tracking-tight text-fg">
                {pick(model.title, locale)}
              </span>
              <span className="mt-1 block text-[11px] leading-snug text-fg-muted">
                {pick(model.ask, locale)}
              </span>
            </button>
          );
        })}
      </div>

      <nav
        aria-label={locale === "en" ? "Overlay kinds" : "下拉种类"}
        className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2"
      >
        {COMMIT_MODELS.map((model, index) => (
          <div key={model.id} className="flex items-center gap-1.5">
            {index > 0 ? (
              <span aria-hidden="true" className="mr-1 hidden h-4 w-px bg-border sm:block" />
            ) : null}
            {model.kinds.map((id) => {
              const kind = KINDS.find((item) => item.id === id);
              if (!kind) return null;
              const on = id === active;
              return (
                <button
                  key={id}
                  type="button"
                  data-kind={id}
                  onClick={() => onPick(id)}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition-colors",
                    on
                      ? "bg-fg text-surface shadow-sm"
                      : "border border-border bg-surface text-fg-muted hover:bg-surface-2 hover:text-fg",
                  )}
                >
                  <span className={cn("font-mono text-[10px]", on ? "text-surface/60" : "text-accent")}>
                    {kind.index}
                  </span>
                  {kind.name}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}

export function AxisReadout({ id, locale }: { id: KindId; locale: Locale }) {
  const model = COMMIT_MODELS.find((item) => item.id === commitOf(id));
  const kind = KINDS.find((item) => item.id === id);
  if (!model || !kind) return null;

  return (
    <p data-axis-readout className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] leading-relaxed">
      <span className="font-medium text-fg">{pick(model.title, locale)}</span>
      <span className="text-fg-subtle" aria-hidden="true">
        ×
      </span>
      <span className="font-medium text-fg">{pick(CLOSE_LABEL[closeOf(id)], locale)}</span>
    </p>
  );
}
