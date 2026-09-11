import type { ReactNode } from "react";
import { cn } from "../lib/utils";

const TICKS = [-2, -1, 0, 1, 2] as const;

export function WheelDrum({
  hourLabel,
  minuteLabel,
  tracking = false,
  children,
}: {
  hourLabel: string;
  minuteLabel: string;
  tracking?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="wheel-instrument">
      <div className="wheel-caption">
        <span>{hourLabel}</span>
        <span>{minuteLabel}</span>
      </div>
      <div className="wheel-well">
        <TickRail side="left" />
        <TickRail side="right" />
        <div className="wheel-columns">{children}</div>
        <div className="wheel-colon" aria-hidden>
          :
        </div>
        <div
          className={cn("wheel-baseline", tracking && "is-tracking")}
          aria-hidden
        />
        <i className="wheel-fiducial wheel-fiducial-left" aria-hidden />
        <i className="wheel-fiducial wheel-fiducial-right" aria-hidden />
        <div className="wheel-specular" aria-hidden />
      </div>
    </div>
  );
}

function TickRail({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={cn(
        "wheel-tick-rail",
        side === "left" ? "wheel-tick-rail-left" : "wheel-tick-rail-right",
      )}
      aria-hidden
    >
      {TICKS.map((offset) => (
        <span key={offset} className={cn("wheel-tick", offset === 0 && "is-center")}>
          <i />
        </span>
      ))}
    </div>
  );
}
