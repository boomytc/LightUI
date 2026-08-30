import { useState } from "react";
import { HoldDemo } from "./components/demos/hold-demo";
import { ModalDemo } from "./components/demos/modal-demo";
import { PopconfirmDemo } from "./components/demos/popconfirm-demo";
import { SelectDemo } from "./components/demos/select-demo";
import { SwipeDemo } from "./components/demos/swipe-demo";
import { TypeDemo } from "./components/demos/type-demo";
import { UndoDemo } from "./components/demos/undo-demo";
import { PATTERNS, RISK_LADDER, type ConfirmSlug } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { cn } from "./lib/utils";

export function StudyView() {
  const locale = useLocale();
  const [selected, setSelected] = useState<ConfirmSlug>("undo");
  const [seed, setSeed] = useState(0);

  const current = PATTERNS.find((p) => p.slug === selected) ?? PATTERNS[0];

  function renderDemo() {
    switch (selected) {
      case "undo":
        return <UndoDemo key={seed} />;
      case "hold":
        return <HoldDemo key={seed} />;
      case "swipe":
        return <SwipeDemo key={seed} />;
      case "pop":
        return <PopconfirmDemo key={seed} />;
      case "modal":
        return <ModalDemo key={seed} />;
      case "type":
        return <TypeDemo key={seed} />;
      case "select":
        return <SelectDemo key={seed} />;
      default:
        return null;
    }
  }

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      {/* Header Introduction */}
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <p className="text-xs font-mono font-semibold tracking-wider text-wrong uppercase">
            {locale === "en" ? "Destructive Action Safeguards" : "危险操作拦截机制"}
          </p>
          <h1 className="mt-2 text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "Not every danger needs a modal. Confirmations scale with risk."
              : "不是所有危险都弹窗。确认阶梯匹配后果。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Confirm before danger” is a naive pattern. What breaks is friction mismatch: popups for benign undos create modal fatigue, while simple clicks destroy production databases."
              : "「危险操作前弹个窗」是最粗糙的惯性。真正会坏掉的是摩擦力脱节：轻量操作被弹窗拖慢并导致习惯性跳过，高危毁灭却拦不住一次手滑。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Explore the 7 levels of the confirmation ladder below. Notice how cognitive friction and interruption scale with consequence."
            : "体验下方 7 级二次确认阶梯。观察打断程度、操作摩擦与后果严重度如何严格匹配。"}
        </p>
      </section>

      {/* Main Interactive Stage */}
      <section className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left Column: Risk Ladder & Selector */}
        <div className="space-y-3.5">
          {RISK_LADDER.map((ladder) => (
            <div key={ladder.level} className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono font-semibold tracking-wider text-fg-subtle uppercase">
                  {pick(ladder.label, locale)}
                </h2>
              </div>
              <p className="mt-0.5 text-[11px] text-fg-muted">{pick(ladder.advice, locale)}</p>

              <div className="mt-2.5 space-y-1.5">
                {ladder.slugs.map((slug) => {
                  const pat = PATTERNS.find((p) => p.slug === slug);
                  if (!pat) return null;
                  const active = selected === slug;

                  return (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => {
                        setSelected(slug);
                        setSeed((n) => n + 1);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-all",
                        active
                          ? "bg-fg text-surface font-medium shadow-sm"
                          : "bg-surface-2/60 text-fg-muted hover:bg-surface-2 hover:text-fg",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] opacity-70">{pat.id}</span>
                        <span>{pick(pat.title, locale)}</span>
                      </div>
                      <span className="text-[10px] font-mono opacity-80">{pick(pat.interruptWeight, locale).split(" · ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Live Interactive Demo & Prompt Card */}
        <div className="space-y-4">
          <div className="min-h-[460px]">
            {renderDemo()}
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-wrong text-xs font-semibold text-white">
                {current.id}
              </span>
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-fg">
                  {pick(current.title, locale)} · {pick(current.scenes, locale)}
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-fg-muted">
                  💡 <strong className="text-fg">{locale === "en" ? "Prompt: " : "工程规则："}</strong>
                  {pick(current.rulePrompt, locale)}
                </p>
                <p className="mt-0.5 text-[11px] text-accent">
                  👉 <strong className="text-fg">{locale === "en" ? "Action: " : "交互重点："}</strong>
                  {pick(current.caption, locale)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Distinction & Mental Model */}
      <section className="mt-14 grid min-w-0 gap-8 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "Why one-size-fits-all modals fail" : "为什么「一律弹窗」总是坏掉"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <strong className="text-fg">
                {locale === "en" ? "1. Reversible actions need no blocking" : "1. 可逆操作不需要阻断式弹窗"}
              </strong>
              <br />
              {locale === "en"
                ? "Archiving and sending are recoverable. Immediate optimistic updates with a 5s Undo toast preserve flow without risk."
                : "邮件外发、归档与移入废纸篓都是完全可逆的操作。直接乐观执行并在顶部提供 5 秒撤销通道，既保持心流，又有安全兜底。"}
            </li>
            <li>
              <strong className="text-fg">
                {locale === "en" ? "2. Modal fatigue invites muscle memory misclicks" : "2. 弹窗疲劳会诱发闭眼确认的肌肉记忆"}
              </strong>
              <br />
              {locale === "en"
                ? "When users see 20 confirmation dialogs a day, they develop automatic click-through habits, rendering high-risk modals useless."
                : "当用户每天遇到 20 个普通弹窗时，就会形成不看正文直接回车的条件反射，导致真正的高危弹窗彻底失去防御效果。"}
            </li>
            <li>
              <strong className="text-fg">
                {locale === "en" ? "3. Irreversible doom requires cognitive friction" : "3. 毁灭性不可逆操作必须引入认知摩擦"}
              </strong>
              <br />
              {locale === "en"
                ? "Dropping a database or offboarding an organization must enforce typing exact tokens or checking exhaustive consequence lists."
                : "清空生产数据库或注销组织空间必须陈列全部影响规模，并通过键入 DELETE 或逐条勾选清单制造认知摩擦，彻底隔绝误操作。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-mono font-medium uppercase tracking-[0.12em] text-surface/50">
            safeguards_logic.ts
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/90">
{`function calculateHoldProgress(elapsed, target = 2000) {
  if (elapsed <= 0) return 0;
  return Math.min(1, elapsed / target);
}

function resolveSwipeReveal(dx, threshold = 56) {
  return {
    revealedPx: Math.min(0, Math.max(-92, dx)),
    shouldOpen: dx < -threshold,
  };
}

function isTypeMatchValid(input, target = "DELETE") {
  return input === target;
}`}
          </pre>
          <p className="mt-4 text-[12px] leading-relaxed text-surface/60">
            {locale === "en"
              ? "Continuous durations, drag thresholds, and token verifications are fully verified with unit test suites."
              : "长按进度、滑动阈值吸合与输入文本校验均已封装为纯算法模块并完成单元测试覆盖。"}
          </p>
        </article>
      </section>
    </div>
  );
}
