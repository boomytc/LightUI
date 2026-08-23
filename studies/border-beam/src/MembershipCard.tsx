import type { CSSProperties } from "react";
import {
  PARK_ANGLE,
  isRunning,
  pathOf,
  usesStaticStroke,
  type KindId,
  type StageState,
} from "./lib/machines";
import { pick, type Locale } from "./lib/site-locale";
import "./beam.css";

export function MembershipCard({
  kind,
  state,
  reduced,
  locale,
}: {
  kind: KindId;
  state: StageState;
  reduced: boolean;
  locale: Locale;
}) {
  const running = isRunning(state, reduced);
  const park = state === "park";
  const stroke = usesStaticStroke(kind, reduced);
  const vars = (
    park && pathOf(kind) === "border" && !stroke
      ? { "--beam-angle": `${PARK_ANGLE}deg` }
      : undefined
  ) as CSSProperties | undefined;

  return (
    <article
      className="bb-card"
      data-kind={kind}
      data-state={state}
      data-running={running ? "true" : "false"}
      data-stroke={stroke ? "static" : "beam"}
      data-path={pathOf(kind)}
      style={vars}
    >
      <p className="text-[10px] font-semibold tracking-[0.18em] text-accent">PRO</p>
      <div className="relative z-[1] mt-2 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[1.15rem] font-semibold tracking-tight">
            {locale === "en" ? "PRO membership" : "PRO 会员"}
          </p>
          <p className="mt-1 truncate text-[12px] text-fg-muted">
            {pick(
              { zh: "解锁全部模板 · 无限导出", en: "All templates · unlimited export" },
              locale,
            )}
          </p>
        </div>
        <p className="shrink-0 text-[15px] font-medium tabular-nums text-accent">
          ¥ 99
          <span className="text-[11px] font-normal text-fg-subtle">
            {locale === "en" ? " / yr" : " / 年"}
          </span>
        </p>
      </div>
    </article>
  );
}
