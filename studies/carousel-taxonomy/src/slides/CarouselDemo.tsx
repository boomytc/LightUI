import { SpinDemo } from "./SpinDemo";
import { useState } from "react";
import { SLIDES } from "../lib/fixtures";
import {
  defaultAutoplay,
  defaultIndicator,
  type FrameKind,
  type FrameIndicator,
  reducedAdvance,
  type KindId,
} from "../lib/machines";
import { useLocale } from "../lib/site-locale";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { Controls } from "./Controls";
import { Window } from "./Frame";
import {
  AccordionMotion,
  ClassicMotion,
  CoverflowMotion,
  FadeMotion,
  FlipMotion,
  ParallaxMotion,
  StackMotion,
  type MotionProps,
} from "./Motions";
import "./slides.css";
import { useCarousel } from "./useCarousel";

export function CarouselDemo({
  id,
  ...props
}: {
  id: KindId;
  index?: number;
  autoplay?: boolean;
}) {
  return id === "spin" ? (
    <SpinDemo {...props} />
  ) : (
    <FrameCarousel id={id} {...props} />
  );
}

function FrameCarousel({
  id,
  index: start = 0,
  autoplay,
}: {
  id: FrameKind;
  index?: number;
  autoplay?: boolean;
}) {
  const locale = useLocale();
  const reduced = useReducedMotion();
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [indicator, setIndicator] = useState<FrameIndicator>(() =>
    defaultIndicator(id),
  );
  const [playing, setPlaying] = useState(autoplay ?? defaultAutoplay(id));
  const { index, go, next, prev } = useCarousel({
    length: SLIDES.length,
    intervalMs: 4000,
    playing,
    hovering: hovering || focused,
    reducedMotion: reduced,
    initial: start,
  });
  const jump = reducedAdvance(id, reduced) === "jump";
  const motion: MotionProps = { index, go, next, prev, jump, locale };

  return (
    <Window
      title={locale === "en" ? "Orbit · frames" : "Orbit · 画面"}
      action={
        <div className="flex items-center gap-2">
          <select
            aria-label={locale === "en" ? "Indicator" : "指示器"}
            className="max-w-24 rounded border border-border bg-surface text-[11px]"
            value={indicator}
            onChange={(e) => setIndicator(e.target.value as FrameIndicator)}
          >
            <option value="dots">{locale === "en" ? "Dots" : "圆点"}</option>
            <option value="bars">{locale === "en" ? "Bars" : "短条"}</option>
            <option value="count">
              {locale === "en" ? "Page count" : "页码"}
            </option>
            <option value="none">
              {locale === "en" ? "None" : "无指示器"}
            </option>
          </select>
          <button
            type="button"
            disabled={reduced}
            onClick={() => setPlaying((on) => !on)}
            className="shrink-0 rounded-md px-1.5 py-0.5 text-[11px] text-fg-subtle hover:text-fg disabled:hover:text-fg-subtle"
          >
            {reduced
              ? locale === "en"
                ? "Reduced"
                : "减动效"
              : playing
                ? locale === "en"
                  ? "Auto on"
                  : "自动开"
                : locale === "en"
                  ? "Auto off"
                  : "自动关"}
          </button>
        </div>
      }
    >
      <div
        className="relative min-w-0 overflow-x-hidden"
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(event) => {
          if (
            !(event.relatedTarget instanceof Node) ||
            !event.currentTarget.contains(event.relatedTarget)
          )
            setFocused(false);
        }}
      >
        <KindMotion id={id} motion={motion} />
        <Controls
          indicator={indicator}
          index={index}
          length={SLIDES.length}
          locale={locale}
          go={go}
          next={next}
          prev={prev}
        />
      </div>
    </Window>
  );
}

function KindMotion({ id, motion }: { id: FrameKind; motion: MotionProps }) {
  switch (id) {
    case "classic":
      return <ClassicMotion {...motion} />;
    case "fade":
      return <FadeMotion {...motion} />;
    case "coverflow":
      return <CoverflowMotion {...motion} />;
    case "stack":
      return <StackMotion {...motion} />;
    case "flip":
      return <FlipMotion {...motion} />;
    case "accordion":
      return <AccordionMotion {...motion} />;
    case "parallax":
      return <ParallaxMotion {...motion} />;
  }
}
