import {
  anchorsToTrigger,
  appearsFrom,
  interruptKind,
  isInteractive,
  type Appear,
  type Interrupt,
} from "../lib/machines";
import { KINDS, type KindId, type KindMeta } from "../lib/kinds";
import { loc, pick, type Locale, type Localized } from "../lib/site-locale";
import { cn } from "../lib/utils";
import "./overlay.css";

const ROWS: Interrupt[] = ["block", "weak", "none"];
const COLS = [false, true] as const;

const ROW_LABEL: Record<Interrupt, Localized> = {
  block: loc("必须先处理", "Must handle first"),
  weak: loc("弱打断", "Weak interrupt"),
  none: loc("不打断", "No interrupt"),
};

const COL_LABEL = {
  viewport: loc("视口定位", "Viewport"),
  trigger: loc("贴着触发点", "Stuck to trigger"),
};

const EMPTY: Record<Interrupt, Record<"viewport" | "trigger", Localized>> = {
  block: {
    viewport: loc("", ""),
    trigger: loc("必须先处理就不贴按钮", "Must-handle does not stick to a button"),
  },
  weak: {
    viewport: loc("", ""),
    trigger: loc("弱打断走视口边", "Weak interrupt uses a viewport edge"),
  },
  none: {
    viewport: loc("不打断的视口层是提示", "A non-blocking viewport layer is a notice"),
    trigger: loc("", ""),
  },
};

const APPEAR_LABEL: Record<Appear, Localized> = {
  center: loc("居中", "Center"),
  side: loc("右侧", "Right"),
  bottom: loc("底边", "Bottom"),
  anchor: loc("贴附", "Anchor"),
};

export function kindsIn(interrupt: Interrupt, attach: boolean): KindMeta[] {
  return KINDS.filter(
    (kind) => interruptKind(kind.id) === interrupt && anchorsToTrigger(kind.id) === attach,
  );
}

export function AxisReadout({
  id,
  locale,
}: {
  id: KindId;
  locale: Locale;
}) {
  const interrupt = interruptKind(id);
  const attach = anchorsToTrigger(id);
  const from = appearsFrom(id);

  return (
    <p
      data-axis-readout
      className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] leading-relaxed"
    >
      <span className="font-medium text-fg">{pick(ROW_LABEL[interrupt], locale)}</span>
      <span className="text-fg-subtle" aria-hidden="true">
        ×
      </span>
      <span className="font-medium text-fg">
        {attach ? pick(COL_LABEL.trigger, locale) : pick(APPEAR_LABEL[from], locale)}
      </span>
      {attach ? (
        <>
          <span className="text-border-strong">·</span>
          <span className="text-fg-muted">
            {isInteractive(id)
              ? locale === "en"
                ? "Actions"
                : "可点"
              : locale === "en"
                ? "A sentence"
                : "不可点"}
          </span>
        </>
      ) : null}
    </p>
  );
}

export function Matrix({
  active,
  locale,
  onPick,
}: {
  active: KindId;
  locale: Locale;
  onPick: (id: KindId) => void;
}) {
  const hotInterrupt = interruptKind(active);
  const hotAttach = anchorsToTrigger(active);

  return (
    <div
      role="grid"
      aria-label={locale === "en" ? "Interrupt by attach" : "打断 × 贴附"}
      className="overlay-matrix"
    >
      <div className="overlay-matrix-head" aria-hidden="true">
        <span className="font-mono text-[10px] tracking-[0.16em] text-fg-subtle">×</span>
      </div>
      <div className="overlay-matrix-head">
        <span className="overlay-axis-x text-fg-muted">{pick(COL_LABEL.viewport, locale)}</span>
      </div>
      <div className="overlay-matrix-head">
        <span className="overlay-axis-x text-fg-muted">{pick(COL_LABEL.trigger, locale)}</span>
      </div>

      {ROWS.map((interrupt) =>
        COLS.map((attach, col) => {
          const kinds = kindsIn(interrupt, attach);
          const hot = interrupt === hotInterrupt && attach === hotAttach;
          const emptyKey = attach ? "trigger" : "viewport";
          const empty = EMPTY[interrupt][emptyKey];

          return (
            <div key={`${interrupt}-${emptyKey}`} className="contents">
              {col === 0 ? (
                <div className="overlay-matrix-label">
                  <span
                    className={cn(
                      "overlay-axis-y",
                      interrupt === hotInterrupt ? "text-accent" : "text-fg-muted",
                    )}
                  >
                    {pick(ROW_LABEL[interrupt], locale)}
                  </span>
                </div>
              ) : null}
              <div
                role="gridcell"
                data-interrupt={interrupt}
                data-attach={attach ? "trigger" : "viewport"}
                className={cn(
                  "overlay-matrix-cell",
                  hot && "is-hot",
                  kinds.length === 0 && "is-empty",
                )}
              >
                {kinds.length > 0 ? (
                  <div className="grid gap-1.5">
                    {kinds.map((kind) => (
                      <KindButton
                        key={kind.id}
                        kind={kind}
                        locale={locale}
                        on={kind.id === active}
                        onPick={onPick}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="px-1 py-2 text-[11px] leading-snug text-fg-subtle">
                    {pick(empty, locale)}
                  </p>
                )}
              </div>
            </div>
          );
        }),
      )}
    </div>
  );
}

function KindButton({
  kind,
  locale,
  on,
  onPick,
}: {
  kind: KindMeta;
  locale: Locale;
  on: boolean;
  onPick: (id: KindId) => void;
}) {
  const from = appearsFrom(kind.id);

  return (
    <button
      type="button"
      aria-pressed={on}
      data-kind={kind.id}
      onClick={() => onPick(kind.id)}
      className={cn(
        "flex min-h-14 w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-[border-color,background-color,color,box-shadow] duration-200",
        on
          ? "border-fg bg-fg text-surface shadow-card"
          : "border-border bg-surface text-fg hover:bg-surface-2",
      )}
    >
      <KindGlyph id={kind.id} on={on} />
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold tracking-tight">{kind.name}</span>
        <span className={cn("block truncate text-[11px]", on ? "text-surface/65" : "text-fg-subtle")}>
          {pick(kind.zh, locale)}
          <span className="mx-1 opacity-50">·</span>
          {pick(APPEAR_LABEL[from], locale)}
        </span>
      </span>
    </button>
  );
}

function KindGlyph({ id, on }: { id: KindId; on: boolean }) {
  return (
    <svg
      viewBox="0 0 32 24"
      className={cn("size-8 shrink-0", on ? "text-surface/85" : "text-fg-muted")}
      aria-hidden="true"
    >
      <rect
        x="1.25"
        y="1.25"
        width="29.5"
        height="21.5"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.4"
      />
      {id === "modal" ? (
        <rect x="8.5" y="5.5" width="15" height="13" rx="2" fill="currentColor" />
      ) : null}
      {id === "drawer" ? (
        <rect x="17" y="1.25" width="13.75" height="21.5" rx="2" fill="currentColor" />
      ) : null}
      {id === "sheet" ? (
        <rect x="1.25" y="12" width="29.5" height="10.75" rx="2" fill="currentColor" />
      ) : null}
      {id === "popover" ? (
        <>
          <circle cx="23" cy="5.5" r="1.7" fill="currentColor" />
          <rect x="13" y="8" width="13" height="10" rx="2" fill="currentColor" />
        </>
      ) : null}
      {id === "tooltip" ? (
        <>
          <circle cx="16" cy="18" r="1.6" fill="currentColor" />
          <rect x="7" y="3.5" width="18" height="8.5" rx="2" fill="currentColor" />
        </>
      ) : null}
    </svg>
  );
}
