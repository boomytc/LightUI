import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./timer/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "Does this session count up, or count down?"
              : "这一段时间是正数累计，还是倒数专注？"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make a timer” describes the skin. What breaks is direction: elapsed from 0, or remaining from N — not a spinner, not a toast at zero."
              : "「做个计时器」说的是外观。真正会坏掉的是方向：从 0 往上，还是从 N 往下。不是转圈，到点也不是一条 toast。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name the leaf, name the scene, then name the rule. The two leaves below are live."
            : "先说名称，再说场景，再说规则。下面两片叶子可以点。"}
        </p>
      </section>

      <section className="mb-10 grid gap-3 sm:grid-cols-3">
        {FORMULA.map((item) => (
          <div key={item.n} className="rounded-2xl border border-border bg-surface px-4 py-4 shadow-card">
            <span className="inline-grid size-6 place-items-center rounded-md bg-fg text-[11px] font-semibold text-surface">
              {item.n}
            </span>
            <h2 className="mt-3 text-[15px] font-semibold">{pick(item.title, locale)}</h2>
            <p className="mt-1 text-[13px] text-fg-muted">{pick(item.example, locale)}</p>
          </div>
        ))}
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
                {locale === "en"
                  ? "1. Session direction is not whether progress can be measured"
                  : "1. 计时的方向不是进度能不能算"}
              </span>
              <br />
              {locale === "en"
                ? "Progress asks if work has a percent. Timing asks whether this session counts up or down."
                : "进度问工作有没有百分比。计时问这一段会话是往上还是往下。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Hitting zero is not a toast" : "2. 到点不是一条 toast"}
              </span>
              <br />
              {locale === "en"
                ? "When focus reaches 0, the timer stops itself in a done state. A notice is not a substitute for stopping."
                : "专注到 0 时计时器自己停在完成态。一条提示不能代替停表。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Count-up is not focus" : "3. 累计不是专注"}
              </span>
              <br />
              {locale === "en"
                ? "Growing a countdown, or capping a stopwatch as a fake pomodoro, both break. While running, the top bar still shows the session."
                : "把倒数做成越走越大，或把累计做成有上限的假番茄，都会坏。进行中顶栏仍要露出这段会话。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-fg bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            liveSeconds
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function liveSeconds(t, now) {
  return t.accumulated + (t.running ? now - t.startedAt : 0)
}

function displaySeconds(t, now) {
  if (t.mode === "focus") {
    return Math.max(0, cap(t) - liveSeconds(t, now))
  }
  return liveSeconds(t, now)
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Pause freezes accumulated. Focus pauses at 0. Stopwatch has no session percent. The chrome chip is occupancy, not a third leaf."
              : "暂停冻住 accumulated。专注停在 0。累计没有会话百分比。顶栏 chip 是占用，不是第三叶。"}
          </p>
        </article>
      </section>
    </div>
  );
}
