import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./morph/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "Same entry. Which axis moves — and does it reverse?"
              : "同一入口。改的是哪根轴，还是沿路收回？"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make a morph” describes the skin. The thing that breaks is the axis: width, height, radius, or layout — then whether it holds expanded, or content leaves first and the container follows."
              : "「做一个变形」说的是外观。真正会坏掉的是轴：宽、高、圆角还是排版；停在展开态，或内容先走、容器后收。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name the axis, name the scene, then name the path. The seven contrasts below are live."
            : "先说轴，再说场景，再说路径。下面七个对照可以点。"}
        </p>
      </section>

      <Playground />

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {FORMULA.map((item) => (
          <div key={item.n} className="flex gap-3 rounded-xl border border-border bg-surface px-3 py-3">
            <span className="inline-grid size-5 shrink-0 place-items-center rounded-md bg-fg text-[10px] font-semibold text-surface">
              {item.n}
            </span>
            <div className="min-w-0">
              <h2 className="text-[13px] font-semibold">{pick(item.title, locale)}</h2>
              <p className="mt-0.5 text-[12px] text-fg-muted">{pick(item.example, locale)}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-14 grid min-w-0 gap-10 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "How to tell them apart" : "怎么把它们分开"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "1. Changing only the radius is not a zoom" : "1. 只改圆角不是放大"}
              </span>
              <br />
              {locale === "en"
                ? "Locked width and height, radius only: hierarchy. Scale makes the whole block larger."
                : "宽高锁死、只收圆角，说的是层级。scale 把整块当成变大。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. A reverse collapse is not a fade-unmount" : "2. 反向收回不是淡出卸载"}
              </span>
              <br />
              {locale === "en"
                ? "Body leaves, then height, then width. The check stays in the dot. Opacity 0 then unmount is a new entry."
                : "正文先走，再收高度，再收宽度。勾留在点里。整块淡出再卸掉，回来时是另一个入口。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Reflow is not a new set of nodes" : "3. 内容重排不是换一套节点"}
              </span>
              <br />
              {locale === "en"
                ? "Stack to two columns, same DOM, same reading order. Swapping in another card is a frame cut."
                : "单列变两列，DOM 还是那几个，阅读顺序还在。换成另一套卡片，是切画面。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            morphAxis
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function locksSize(kind) {
  return kind === "radius"
}

function reverseBeat(step) {
  return ["content", "height", "width"][step]
}

function contentAfterContainer(kind) {
  return kind === "pill-card"
    || kind === "compact"
    || kind === "size"
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Radius locks size. Reverse sends content out first. Pill-card, compact, and size wait to show body until the box has grown."
              : "圆角锁死尺寸。反向收回让内容先走。胶囊卡片、紧凑条、尺寸：正文等容器长开再出现。"}
          </p>
        </article>
      </section>
    </div>
  );
}
