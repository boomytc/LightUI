import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./confirm/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "They all confirm. They do not interrupt the same way."
              : "看起来都要确认，打断的重量却完全不同。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Pop a modal before danger” describes a habit. What breaks is friction mismatch: a dialog for send trains muscle memory, while a click still drops production."
              : "「危险操作前弹个窗」说的是惯性。真正会坏掉的是摩擦力脱节：发信也挡一层会养成闭眼确定，高危毁灭却拦不住一次手滑。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name the consequence, then the interrupt. The seven rungs below are live — no pre-confirm, hold, swipe, pop, dialog, type, checklist."
            : "先说后果，再说打断。下面七档可以点：无需事前确认、长按、滑动、气泡、对话框、打字、清单。"}
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
                {locale === "en"
                  ? "1. The confirmation ladder is not overlay geometry"
                  : "1. 确认阶梯不是浮层贴附"}
              </span>
              <br />
              {locale === "en"
                ? "Where a layer sits is another question. This study asks how heavy the friction is against irreversibility."
                : "浮层贴在哪、挡不挡，是另一问。这一则问的是摩擦与不可逆性是否成正比。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en"
                  ? "2. A safeguard is not button weight"
                  : "2. 拦截机制不是按钮重量"}
              </span>
              <br />
              {locale === "en"
                ? "Solid, outline, text name how loud a click looks. Confirm names whether a slip can finish the act."
                : "面状、线状、文字说的是这一击有多响。确认说的是手滑能不能把事做完。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en"
                  ? "3. An undo window is not network rollback"
                  : "3. 事后撤销不是网络回滚"}
              </span>
              <br />
              {locale === "en"
                ? "Undo is a remorse period the user can take. Network rollback recovers a failed request. Hold-to-confirm is not long-press multi-select."
                : "撤销窗是给用户的后悔期。网络回滚是请求失败后的被动恢复。长按确认也不是长按多选。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            matchFriction
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function matchFriction(risk) {
  if (risk === "reversible") return "undo"
  if (risk === "slip") return "hold | swipe"
  if (risk === "local") return "popconfirm"
  if (risk === "severe") return "modal"
  return "type | checklist"
}

function alwaysModal(risk) {
  return risk !== "severe"
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "A reversible send should not block. A production drop should not accept Enter. Friction scales with blast radius."
              : "可逆的发送不该阻断。销毁生产库不该回车即过。摩擦跟着影响范围走。"}
          </p>
        </article>
      </section>
    </div>
  );
}
