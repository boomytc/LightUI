import { Playground } from "./Playground";
import { buildSnippet } from "./lib/shimmer";
import { useLocale } from "./lib/site-locale";

export function StudyView() {
  const locale = useLocale();
  const snippet = buildSnippet({ style: "classic", spread: 3, angle: 295, speed: 0.12 });

  return (
    <div className="page-width min-w-0 pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "The sweep follows the glyphs, not the box."
              : "扫光跟字形走，不要去扫整块盒子。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "Clip the band to the letters. Width is in ch. Duration is length times speed."
              : "把光带裁进字形。宽度用 ch。时长等于字数乘速度。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Park the beam to sit it on a cell. A box-level sheen will not stay in step across short and long lines."
            : "停住光带可以把它停在某一格。扫整块的话，短词和长句对不齐。"}
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
                {locale === "en" ? "1. Clip to glyphs" : "1. 裁进字形"}
              </span>
              <br />
              {locale === "en"
                ? "Letters are transparent. background-clip: text keeps the band inside the glyphs."
                : "字是透明的。background-clip: text 把光带留在字形里。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Width in ch, duration from length" : "2. 宽度用 ch，时长跟字数"}
              </span>
              <br />
              {locale === "en"
                ? "spread × 0.5ch tracks type size. Duration = characters × speed."
                : "spread × 0.5ch 跟着字号。时长 = 字数 × 速度。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. 300% band, rest off-canvas" : "3. 300% 光带，画外歇一下"}
              </span>
              <br />
              {locale === "en"
                ? "The highlight sits at 50% of a 3× gradient so it can enter and leave cleanly."
                : "高光停在 3 倍渐变的 50%，进出才干净。"}
            </li>
          </ol>
        </article>
        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">glyph-sweep</p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">{snippet}</pre>
        </article>
      </section>
    </div>
  );
}
