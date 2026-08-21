import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { ShimmerStyle } from "./lib/shimmer";
import "./sweep.css";

type Props = {
  text: string;
  style: ShimmerStyle;
  speed: number;
  spread: number;
  angle: number;
  park: boolean;
  position: number;
  editable?: boolean;
  onCommit?: (text: string) => void;
};

export function ShimmerLine({
  text,
  style,
  speed,
  spread,
  angle,
  park,
  position,
  editable = false,
  onCommit,
}: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [len, setLen] = useState(Math.max(text.length, 1));

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.textContent !== text) el.textContent = text;
    setLen(Math.max(text.length, 1));
  }, [text]);

  const vars = {
    "--gsweep-len": String(len),
    "--gsweep-speed": String(speed),
    "--gsweep-spread": String(spread),
    "--gsweep-deg": String(angle),
    "--gsweep-position": String(position),
  } as CSSProperties;

  return (
    <p
      ref={ref}
      className="gsweep-line"
      data-style={style}
      data-park={park ? "true" : "false"}
      contentEditable={editable}
      suppressContentEditableWarning
      spellCheck={false}
      style={vars}
      onInput={() => {
        setLen(Math.max(ref.current?.textContent?.length ?? 0, 1));
      }}
      onBlur={() => onCommit?.(ref.current?.textContent ?? "")}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.preventDefault();
      }}
    />
  );
}
