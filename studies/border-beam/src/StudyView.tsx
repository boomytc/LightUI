import { Playground } from "./Playground";
import { buildSnippet } from "./lib/machines";
import { useLocale } from "./lib/site-locale";

export function StudyView() {
  const locale = useLocale();
  const snippet = buildSnippet();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "The highlight travels the border. It does not flood the card."
              : "高光走边框，不要铺满卡片。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "Stack a conic beam in a transparent stroke. Keep a solid inner fill. Brand accent only."
              : "透明边框叠圆锥光束。内层实心底。只用品牌强调色。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Park the beam to sit it on a corner. Flooding the face is the naive glow."
            : "停住可以把高光钉在一角。铺满整张卡是 naive 的发光。"}
        </p>
      </section>

      <Playground />

      <section className="mt-14 grid min-w-0 gap-10 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "How it decides" : "怎么判"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "1. Path is the stroke" : "1. 路径是边框"}
              </span>
              <br />
              {locale === "en"
                ? "pathOf(beam) is border. A flood is fill — the wrong path."
                : "pathOf(beam) 是 border。铺满是 fill，那是错的路径。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Inner fill, outer beam" : "2. 内层实心，外层光束"}
              </span>
              <br />
              {locale === "en"
                ? "padding-box holds the solid card. border-box holds the conic. Type never sits in the light."
                : "padding-box 是实心底。border-box 是圆锥光。字不进光束。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Reduced motion is a stroke" : "3. 降动效是描边"}
              </span>
              <br />
              {locale === "en"
                ? "shouldAnimate(true) is false. The beam becomes a static accent stroke, not a frozen flood."
                : "shouldAnimate(true) 为 false。光束变成静态描边，不是冻住的铺满。"}
            </li>
          </ol>
        </article>
        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">border-beam</p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">{snippet}</pre>
        </article>
      </section>
    </div>
  );
}
