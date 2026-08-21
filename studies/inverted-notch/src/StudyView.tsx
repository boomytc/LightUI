import { prettyShapeCss } from "./lib/geometry";
import { useLocale } from "./lib/site-locale";
import { Playground } from "./Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "Punch the corner out of the parent. Do not stitch it back."
              : "内凹角在父级挖孔，不要缝回去。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "A matching-color patch hides the notch until the background changes. The clip walks around the chip, so the page shows through the gap."
              : "同色补丁把缺口盖住，背景一变缝就露馅。裁切绕过锁标，网格从缝里透出来。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "shape() and path() punch a hole. scoop only scoops one radius. Exploded shows the cut."
            : "shape() 和 path() 挖孔。scoop 只凹一角。分解视图能看见被裁掉的角。"}
        </p>
      </section>

      <Playground />

      <section className="mt-14 grid min-w-0 gap-10 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "How to tell them apart" : "怎么把它们分开"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "1. Does the hole follow the chip?" : "1. 孔是否跟着锁标"}
              </span>
              <br />
              {locale === "en"
                ? "Chip width plus gap is the notch. Hover grows both. Scoop never sees the chip."
                : "锁标宽加缝宽就是缺口。悬停两者一起长。scoop 看不见锁标。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Can the page show through?" : "2. 底能透出来吗"}
              </span>
              <br />
              {locale === "en"
                ? "A reverse-arc hole is a real clip. A same-color shadow is a costume."
                : "反向圆弧是真裁切。同色阴影只是化妆。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Scoop is not a nested chip" : "3. scoop 不是嵌进去的锁标"}
              </span>
              <br />
              {locale === "en"
                ? "It only changes one border-radius corner. No gap, no nested control."
                : "它只改一角的圆角。没有缝，也嵌不进控件。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">shape()</p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
            {prettyShapeCss()}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Outer arcs are clockwise card corners. Inner arcs are counter-clockwise around the chip."
              : "外圈 cw 是卡片圆角。内圈 ccw 绕过锁标。"}
          </p>
        </article>
      </section>
    </div>
  );
}
