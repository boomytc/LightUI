import { Playground } from "./Playground";
import { useLocale } from "./lib/site-locale";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "Gaze lands on a cell. It does not invent a turn."
              : "视线落到格子上，不要去捏连续转头。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "Offset over radius, smooth, then quantize to 13×3. A blink is the other row of the same cell."
              : "偏移除以半径，平滑，再量化到 13×3。眨眼是同一格的另一行。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Outside the radius the look vector stays on the circle. Show cells to see the atlas grain."
            : "半径外看向夹在圆上。打开格子能看见图集的颗粒。"}
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
                {locale === "en" ? "1. Clamp to the radius" : "1. 夹到半径圆上"}
              </span>
              <br />
              {locale === "en"
                ? "dx / radius, dy / radius. If the length is over 1, normalize."
                : "dx / 半径，dy / 半径。长度超过 1 就归一。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Smooth, then quantize" : "2. 先平滑，再落到格子"}
              </span>
              <br />
              {locale === "en"
                ? "Exponential smoothing, then round onto 13 columns and 3 rows."
                : "指数平滑，再四舍五入到 13 列 3 行。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Blink is the other row" : "3. 眨眼是另一行"}
              </span>
              <br />
              {locale === "en"
                ? "Source row = row + 3. The look vector does not change."
                : "源行 = row + 3。look 向量不变。"}
            </li>
          </ol>
        </article>
        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">lookToCell</p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">{`function lookToCell(lookX, lookY) {
  const col = round((clamp(lookX, -1, 1) * 0.5 + 0.5) * 12)
  const row = round((clamp(lookY, -1, 1) * 0.5 + 0.5) * 2)
  return { col, row }
}`}</pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Center is column 6, row 1. Each cell is a unique pose. Hops cut; they do not dissolve."
              : "中心是第 6 列第 1 行。每格都是独立姿势。换格硬切，不叠化。"}
          </p>
        </article>
      </section>
    </div>
  );
}
