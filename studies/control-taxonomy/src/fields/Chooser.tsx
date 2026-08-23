import type { ReactNode } from "react";
import {
  answersFor,
  chooseControl,
  nextStep,
  withCardinality,
  withDemand,
  withFind,
  withLength,
  type Answers,
  type ControlId,
} from "../lib/machines";
import { KINDS } from "../lib/kinds";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";

export function Chooser({
  answers,
  onChange,
}: {
  answers: Answers;
  onChange: (next: Answers) => void;
}) {
  const locale = useLocale();
  const step = nextStep(answers);
  const result = chooseControl(answers);
  const meta = result ? KINDS.find((k) => k.id === result) : null;

  return (
    <div data-chooser={step} className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
      {step === "demand" ? (
        <Step
          title={locale === "en" ? "What is the person doing?" : "用户要做什么？"}
          hint={
            locale === "en"
              ? "Filling something in, or picking from answers that already exist?"
              : "自己填写内容，还是从已有答案里选？"
          }
        >
          <Choice
            label={locale === "en" ? "Fill it in" : "自己填写内容"}
            hint={locale === "en" ? "A name, an email, a brief…" : "姓名、邮箱、简介、需求…"}
            onClick={() => onChange(withDemand("fill"))}
          />
          <Choice
            label={locale === "en" ? "Pick from answers" : "从已有答案里选"}
            hint={locale === "en" ? "A city, a member, shipping, interests…" : "城市、成员、配送方式、兴趣…"}
            onClick={() => onChange(withDemand("choose"))}
          />
        </Step>
      ) : null}

      {step === "length" ? (
        <Step
          title={locale === "en" ? "How long is it?" : "内容有多长？"}
          onBack={() => onChange({})}
          back={locale === "en" ? "Back" : "上一步"}
        >
          <Choice
            label={locale === "en" ? "One line is enough" : "一行就够"}
            hint={locale === "en" ? "Name, email, title" : "姓名、邮箱、公司名、标题"}
            onClick={() => onChange(withLength("short"))}
          />
          <Choice
            label={locale === "en" ? "A paragraph" : "要写一段话"}
            hint={locale === "en" ? "A bio, a brief, feedback" : "简介、需求、反馈、备注"}
            onClick={() => onChange(withLength("long"))}
          />
        </Step>
      ) : null}

      {step === "cardinality" ? (
        <Step
          title={locale === "en" ? "Can they pick several?" : "可以同时选多个吗？"}
          onBack={() => onChange({})}
          back={locale === "en" ? "Back" : "上一步"}
        >
          <Choice
            label={locale === "en" ? "Several at once" : "可以多选"}
            hint={locale === "en" ? "Interests, tags. A single agree-to-terms is also a checkbox." : "兴趣、标签、偏好。单个同意条款也是勾选"}
            onClick={() => onChange(withCardinality("many"))}
          />
          <Choice
            label={locale === "en" ? "Only one" : "只能选一个"}
            hint={locale === "en" ? "City, shipping, a plan, a member" : "城市、配送、档位、成员"}
            onClick={() => onChange(withCardinality("one"))}
          />
        </Step>
      ) : null}

      {step === "find" ? (
        <Step
          title={locale === "en" ? "How many, and do they search?" : "选项多不多？要不要搜？"}
          onBack={() => onChange(withDemand("choose"))}
          back={locale === "en" ? "Back" : "上一步"}
        >
          <Choice
            label={locale === "en" ? "Few, compare side by side" : "很少，需要并排比较"}
            hint={locale === "en" ? "2–5, like shipping" : "2–5 项，例如配送方式"}
            onClick={() => onChange(withFind("compare"))}
          />
          <Choice
            label={locale === "en" ? "A short list you can scan" : "固定列表，扫一眼就行"}
            hint={locale === "en" ? "About 5–15, like cities" : "大约 5–15 项，例如城市"}
            onClick={() => onChange(withFind("scan"))}
          />
          <Choice
            label={locale === "en" ? "Many, type to find then pick" : "很多，要先搜再选"}
            hint={locale === "en" ? "Members, contacts, products" : "成员、联系人、商品"}
            onClick={() => onChange(withFind("search"))}
          />
        </Step>
      ) : null}

      {step === "result" && meta ? (
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-accent">
            {locale === "en" ? "Use this machine" : "该用这个"}
          </p>
          <h3 className="mt-2 text-[1.5rem] font-semibold tracking-tight">{meta.name}</h3>
          <p className="text-[14px] text-fg-muted">{pick(meta.zh, locale)}</p>
          <p className="mt-3 text-[14px] leading-relaxed text-fg-muted">{pick(meta.oneLiner, locale)}</p>
          <button
            type="button"
            className="mt-5 rounded-lg border border-border px-3 py-2 text-[13px] text-fg-muted hover:bg-surface-2"
            onClick={() => onChange({})}
          >
            {locale === "en" ? "Ask again" : "再选一次"}
          </button>
        </div>
      ) : null}

      {step === "demand" ? <Scenarios locale={locale} onPick={(id) => onChange(answersFor(id))} /> : null}
    </div>
  );
}

function Step({
  title,
  hint,
  onBack,
  back,
  children,
}: {
  title: string;
  hint?: string;
  onBack?: () => void;
  back?: string;
  children: ReactNode;
}) {
  return (
    <div>
      {onBack ? (
        <button type="button" className="mb-3 text-[12px] text-fg-subtle hover:text-fg" onClick={onBack}>
          {back}
        </button>
      ) : null}
      <h3 className="text-[1.25rem] font-semibold tracking-tight">{title}</h3>
      {hint ? <p className="mt-1 text-[13px] text-fg-subtle">{hint}</p> : null}
      <div className="mt-4 flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Choice({ label, hint, onClick }: { label: string; hint?: string; onClick: () => void }) {
  return (
    <button type="button" className="rounded-xl border border-border px-4 py-3 text-left hover:bg-surface-2" onClick={onClick}>
      <span className="block text-[14px] font-medium text-fg">{label}</span>
      {hint ? <span className="mt-0.5 block text-[12px] text-fg-subtle">{hint}</span> : null}
    </button>
  );
}

const SCENES: { id: ControlId; zh: string; en: string }[] = [
  { id: "text-field", zh: "注册页要填姓名", en: "Sign-up needs a name" },
  { id: "textarea", zh: "意见反馈要写一段话", en: "Feedback needs a paragraph" },
  { id: "checkbox", zh: "兴趣标签最多 3 个", en: "Interest tags, cap at 3" },
  { id: "radio", zh: "三种配送要对比时效", en: "Compare three shipping options" },
  { id: "select", zh: "选择所在城市", en: "Pick a city" },
  { id: "combobox", zh: "从 200 个同事里找人", en: "Find one person among 200" },
];

function Scenarios({ locale, onPick }: { locale: Locale; onPick: (id: ControlId) => void }) {
  return (
    <div className="mt-6 border-t border-border pt-4">
      <p className="text-[12px] text-fg-subtle">{locale === "en" ? "Or jump a scene" : "或直接看情景"}</p>
      <ul className="mt-2 flex flex-col gap-1">
        {SCENES.map((s) => {
          const meta = KINDS.find((k) => k.id === s.id);
          return (
            <li key={s.id}>
              <button
                type="button"
                className={cn("w-full rounded-lg px-3 py-2 text-left hover:bg-surface-2")}
                onClick={() => onPick(s.id)}
              >
                <span className="block text-[13px] text-fg">{locale === "en" ? s.en : s.zh}</span>
                <span className="block text-[11px] text-accent">
                  {meta?.name} · {meta ? pick(meta.zh, locale) : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
