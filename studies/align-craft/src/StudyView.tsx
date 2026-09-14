import { Playground } from "./craft/Playground";
import { FORMULA, kindMeta } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";

const TARGETS = [
  { zh: "基线 · 大小字", en: "Baseline · mixed type" },
  { zh: "焦点 · 封面 / 结果 / 光学", en: "Focus · cover / hero / optical" },
  { zh: "盒子 · 图标行", en: "Box · icon row" },
  { zh: "边 · 贴边 / 两端 / 读线", en: "Edge · padding / between / reading" },
  { zh: "数位 · 等宽 / 小数点", en: "Digit · tabular / decimals" },
];

export function StudyView() {
  const locale = useLocale();
  const css = kindMeta("baseline").css;

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "Alignment is not “looks straight.” Name what the seam lines up."
              : "对齐不是看起来正。先问这条缝对在哪。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Nudge it so it lines up” describes a feeling. The thing that breaks is lining up the wrong thing: the baseline, the focal point, the digits, or the box — then gap, edge, and optical mass."
              : "「帮我对齐一下」说的是观感。真正会坏掉的是对错了东西：基线、焦点、数位，还是盒子；再往下是缝、边，和视觉质量。"}
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {TARGETS.map((item) => (
              <li
                key={item.zh}
                className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-fg-muted"
              >
                {pick(item, locale)}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Each spell is a wrong construction beside the right one. Rose is the box or the guess. Green is the baseline, the focus, or the named edge."
            : "每句咒语都是错的构造和它对的并排。玫瑰色是外框或猜。绿色是基线、焦点，或说清的那条边。"}
        </p>
      </section>

      <Playground />

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
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

      <section className="mt-14 grid min-w-0 gap-10 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "How to tell them apart" : "怎么把它们分开"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "1. Baseline is not the box" : "1. 基线不是外框"}
              </span>
              <br />
              {locale === "en"
                ? "items-center lines up margin boxes. Mixed type (128 /mo) sits on the glyph baseline."
                : "items-center 对齐的是 margin box。大小字（128 元/月）坐在字形基线上。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Focus is not 50% 50%" : "2. 焦点不是画面中心"}
              </span>
              <br />
              {locale === "en"
                ? "contain letterboxes and looks “off.” cover fills, but default centering still crops a subject that sits at 50% 88%."
                : "contain 留空，看起来像裁偏了。cover 填满，可默认 50% 50% 仍会切掉落在 50% 88% 的主体。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Optical center is not the box center" : "3. 视觉中心不是盒子中心"}
              </span>
              <br />
              {locale === "en"
                ? "A circle reads small next to a square of the same box. A play triangle’s mass sits left of geometric center. Swapping the page skeleton is a different question."
                : "圆看起来比同包围盒的方小。播放三角的视觉质量偏左。换骨架是另一件事。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "4. Numbers compare by digits, not left margins" : "4. 金额比的是数位，不是左边距"}
              </span>
              <br />
              {locale === "en"
                ? "Left alignment and proportional fonts stagger decimal points. Tabular-nums and fixed precision lock decimals into one vertical axis."
                : "左对齐与比例字体会让个位、十位与小数点参差错开。等宽数字与统一小数位让数位垂直成线，大小一目了然。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "5. Centering a card does not center the copy" : "5. 容器居中不代表文字居中"}
              </span>
              <br />
              {locale === "en"
                ? "Continuous reading needs a steady left starting line. Centering copy forces the eye to hunt for every line break."
                : "连续阅读需要固定的左侧起跑线。长段正文居中会让每行起点随行宽跳动，造成显著的阅读疲劳。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "6. List statuses need a shared scan line" : "6. 列表扫读靠两端边线"}
              </span>
              <br />
              {locale === "en"
                ? "Letting badges cling to titles of varying length creates ragged right edges. Space-between pins statuses into one straight scanning column."
                : "状态紧随标题漂移逼人逐行搜寻。两端对齐把状态贴在右边线，形成一条笔直的纵向扫读边缘。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "7. Strike the hero on center; drop details back left" : "7. 结果中轴聚焦，明细左齐分层"}
              </span>
              <br />
              {locale === "en"
                ? "A single primary result callout is strongest centered. Centering structured metadata scatters keys and values; keep details left-aligned."
                : "单一强行动沿中轴放大最有力。结构化明细一旦无差别居中，键与值就飘散了，辅助明细必须回归靠左结构。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            align-items: baseline
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">{css}</pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "The first spell. Cover still needs object-position on the subject. Absolute layers use inset, not a translate guess."
              : "第一句。封面仍要把 object-position 写到主体上。浮层用 inset，不要 translate 猜。"}
          </p>
        </article>
      </section>
    </div>
  );
}
