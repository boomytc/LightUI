import { useState } from "react";
import { SLIDES } from "../lib/fixtures";
import {
  defaultAutoplay,
  isRotateNotSlide,
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
  SpinMotion,
  StackMotion,
  type MotionProps,
} from "./Motions";
import "./slides.css";
import { useCarousel } from "./useCarousel";

export function CarouselDemo({
  id,
  index: start = 0,
  autoplay,
}: {
  id: KindId;
  index?: number;
  autoplay?: boolean;
}) {
  const locale = useLocale();
  const reduced = useReducedMotion();
  const [hovering, setHovering] = useState(false);
  const [playing, setPlaying] = useState(autoplay ?? defaultAutoplay(id));
  const { index, go, next, prev } = useCarousel({
    length: SLIDES.length,
    intervalMs: 4000,
    playing,
    hovering,
    reducedMotion: reduced,
    initial: start,
  });
  const jump = reducedAdvance(id, reduced) === "jump";
  const motion: MotionProps = { index, go, next, prev, jump, locale };

  return (
    <Window
      title={
        isRotateNotSlide(id)
          ? locale === "en"
            ? "Orbit · product"
            : "Orbit · 产品"
          : locale === "en"
            ? "Orbit · frames"
            : "Orbit · 画面"
      }
      action={
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
      }
    >
      <div
        className="relative min-w-0 overflow-x-hidden"
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}
      >
        <KindMotion id={id} motion={motion} />
        <Controls
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

function KindMotion({ id, motion }: { id: KindId; motion: MotionProps }) {
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
    case "spin":
      return <SpinMotion {...motion} />;
    case "parallax":
      return <ParallaxMotion {...motion} />;
  }
}
