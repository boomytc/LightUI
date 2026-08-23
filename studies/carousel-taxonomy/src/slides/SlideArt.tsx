import { pick, type Locale } from "../lib/site-locale";
import type { Slide } from "../lib/fixtures";
import { cn } from "../lib/utils";

export function SlideArt({
  slide,
  locale,
  className,
  compact = false,
  labeled = true,
}: {
  slide: Slide;
  locale: Locale;
  className?: string;
  compact?: boolean;
  labeled?: boolean;
}) {
  return (
    <div className={cn("slide-art", `slide-tone-${slide.tone}`, className)}>
      <span className="slide-orb" aria-hidden="true" />
      <span className="slide-slash" aria-hidden="true" />
      <span className="slide-chip" aria-hidden="true" />
      {labeled ? (
        <div
          className={cn(
            "relative z-10 flex h-full min-w-0 flex-col justify-end",
            compact ? "p-3" : "p-5",
          )}
        >
          <span className="mb-1.5 inline-flex w-fit rounded-full bg-black/15 px-2 py-0.5 text-[10px] tracking-wider">
            {pick(slide.kicker, locale)}
          </span>
          <h3
            className={cn(
              "min-w-0 font-semibold tracking-tight",
              compact ? "text-[1.05rem] leading-tight" : "text-[1.55rem] leading-tight",
            )}
          >
            {pick(slide.title, locale)}
          </h3>
          {compact ? null : (
            <p className="mt-1 truncate text-[12px] opacity-80">{pick(slide.caption, locale)}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
