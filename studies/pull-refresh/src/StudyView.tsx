import { REFRESH_FORMULAS } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./playground/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-6 pb-6 pt-2 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-10 lg:pt-6">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "When does a downward pull take over scroll, and when does it commit a refresh?"
              : "下拉手势何时接管滚动、何时提交刷新？"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "Take over only at the top edge and moving down. Damp the travel and cap it. Release past the threshold to refresh; otherwise spring back."
              : "顶边且向下才接管；位移阻尼加上限；松手超阈值才刷新，否则弹性复位。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "The phone is the product. The gauge reads takeover, the 0.42 spring, the 56px line, and the pinned refresh."
            : "左边是产品列表，右边把接管条件、0.42 阻尼、56px 阈值和刷新吸顶摊开读。"}
        </p>
      </section>

      <Playground />

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {REFRESH_FORMULAS.map((item) => (
          <article key={item.id} className="flex flex-col rounded-xl border border-border bg-surface p-4 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
              {pick(item.eyebrow, locale)}
            </p>
            <p className="mt-3 font-mono text-[1.15rem] font-semibold tracking-tight text-fg">
              {pick(item.figure, locale)}
            </p>
            <h3 className="mt-2 text-[14px] font-semibold text-fg">{pick(item.title, locale)}</h3>
            <p className="mt-2 text-[12px] leading-relaxed text-fg-muted">{pick(item.desc, locale)}</p>
          </article>
        ))}
      </section>

      <section className="mt-14 grid min-w-0 gap-10 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "How to read a single pull" : "一次下拉怎么读"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "1. Mid-list never takes over" : "1. 半腰绝不接管"}
              </span>
              <br />
              {locale === "en"
                ? "If scrollTop > 0, a downward drag is native scroll. Seek mid-list, then pull — the header stays shut."
                : "scrollTop > 0 时向下是回看上一屏。先滚到半腰再拉，顶部不会出现阻尼层。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. The ring is tension, not work progress" : "2. 圆环是拉力，不是工作进度"}
              </span>
              <br />
              {locale === "en"
                ? "Fill to 56px means “qualified to commit.” After release, the same ring becomes a pinned busy state."
                : "圆环涨到 56px 只表示「够格提交」。松手之后，它变成吸顶的刷新中态，不再跟手指。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Settle before collapse" : "3. 先交代结果，再收起"}
              </span>
              <br />
              {locale === "en"
                ? "When data lands, pin drops and a banner names what arrived — then the header eases to 0."
                : "数据就绪后吸顶落下，横条说明拉到了什么，再平滑收到 0。不要瞬间闪关。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            Damping & Release
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`if (scrollTop <= 0 && dy > 0) {
  pull = Math.min(120, dy * 0.42);
}

onPointerUp = () => {
  if (pull >= 56) {
    pinAt(56);
    fetchData();
  } else {
    snapBack(0);
  }
};`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Damping keeps the yank from feeling linear. The 56px line is the only commit."
              : "阻尼让拉扯不再线性；56px 是唯一的提交线。"}
          </p>
        </article>
      </section>
    </div>
  );
}
