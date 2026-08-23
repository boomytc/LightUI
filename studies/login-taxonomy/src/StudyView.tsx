import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./logins/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "They all have a form. They do not stage arrival the same way."
              : "看起来都有表单，进门的舞台却完全不同。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make a login page” describes the skin. The thing that breaks is the stage: a floating card, a brand split, a form on a wash, a role gate, or one job per screen."
              : "「做个登录页」说的是外观。真正会坏掉的是舞台：居中卡片、左右分栏、沉浸背景、角色入口，还是分步。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name the stage, name the scene, then name the rule. The five contrasts below are live. Fields stay inert; only steps may advance."
            : "先说舞台，再说场景，再说规则。下面五个对照可以点。字段是假的；只有分步可以往下走。"}
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
                {locale === "en" ? "1. How the login card sits is not the page skeleton" : "1. 登录卡怎么摆不是整页骨架"}
              </span>
              <br />
              {locale === "en"
                ? "Floating card, split, immersive — that is the gate. How the rest of the page is laid out is a skeleton question."
                : "卡片悬浮、分栏、沉浸，回答的是进门舞台。这一页其余怎么铺，是骨架。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Login is not a selling hero" : "2. 登录不是卖点首屏"}
              </span>
              <br />
              {locale === "en"
                ? "A hero sells a promise. Login has to let people in."
                : "首屏卖的是承诺。登录要的是进得去。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en"
                  ? "3. A split is not immersive; a role gate is not steps"
                  : "3. 分栏不是沉浸，角色入口不是分步"}
              </span>
              <br />
              {locale === "en"
                ? "A split is two panes. Immersive is one ground. A role picks an identity; steps split one identity into screens."
                : "分栏是两格。沉浸是一块底。角色是先选身份；分步是同一身份里一屏一事。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            paneCount
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function paneCount(kind) {
  return kind === "split" ? 2 : 1
}

function isStepped(kind) {
  return kind === "steps"
}

function needsRole(kind) {
  return kind === "roles"
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Only the split occupies two panes. Only the role gate picks an identity first. Only steps advance a screen."
              : "只有左右分栏是两格。只有角色入口要先选身份。只有分步按屏前进。"}
          </p>
        </article>
      </section>
    </div>
  );
}
