import { calcCylinderVisual, pad2 } from "../lib/machines";
import { cylinderAppearance } from "./appearance";

const OFFSETS = [-2, -1, 0, 1, 2] as const;

export function WheelStaticColumn({
  center,
  modulus,
  enableDepth = true,
}: {
  center: number;
  modulus: number;
  enableDepth?: boolean;
}) {
  return (
    <div className="wheel-column wheel-column-static" aria-hidden>
      {OFFSETS.map((offset) => {
        const val = ((center + offset) % modulus + modulus) % modulus;
        const visual = calcCylinderVisual(offset);
        return (
          <div
            key={offset}
            className="wheel-glyph"
            style={cylinderAppearance(visual, enableDepth, visual.isBaseline)}
          >
            {pad2(val)}
          </div>
        );
      })}
    </div>
  );
}
