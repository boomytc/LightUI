import { useState, type ReactNode } from "react";
import {
  EVENT,
  FIELD_COPY,
  hintPlaceholder,
  PHONE_HELPER,
  repairCopy,
} from "../lib/kinds";
import {
  asksKnownFact,
  fieldMark,
  hintKind,
  identityLost,
  isReadout,
  outcomeComplete,
  phoneRepair,
  repairIsActionable,
  repairPlacement,
  sectionsFor,
  seatValue,
  SHORT_PHONE,
  stackedCopy,
  stageSnapshot,
  type DutyId,
  type FieldSpec,
  type StageState,
} from "../lib/machines";
import { pick, type Locale } from "../lib/site-locale";
import { Field, FieldInput, FieldSelect } from "./Field";
import { DemoCard, GhostButton } from "./Frame";

export function DutyScene({
  id,
  locale,
  state,
}: {
  id: DutyId;
  locale: Locale;
  state?: StageState;
}) {
  const locked = state === "naive" || state === "clear";
  const snap = stageSnapshot(id, state ?? "naive");

  switch (id) {
    case "label":
      return <LabelScene locale={locale} locked={locked} state={state} typed={snap.typed} />;
    case "required":
      return <RequiredScene locale={locale} locked={locked} state={state} />;
    case "helper":
      return <HelperScene locale={locale} locked={locked} state={state} phone={snap.phone} />;
    case "group":
      return <GroupScene locale={locale} locked={locked} state={state} />;
    case "hint":
      return <HintScene locale={locale} locked={locked} state={state} />;
    case "repair":
      return <RepairScene locale={locale} locked={locked} state={state} phone={snap.phone} />;
    case "done":
      return <DoneScene locale={locale} locked={locked} state={state} snap={snap} />;
  }
}

function Pair({
  locked,
  state,
  naive,
  clear,
}: {
  locked: boolean;
  state?: StageState;
  naive: ReactNode;
  clear: ReactNode;
}) {
  if (locked) return state === "naive" ? naive : clear;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {naive}
      {clear}
    </div>
  );
}

function reqSr(locale: Locale) {
  return locale === "en" ? "required" : "必填";
}

function optLabel(locale: Locale) {
  return locale === "en" ? "optional" : "选填";
}

function LabelScene({
  locale,
  locked,
  state,
  typed,
}: {
  locale: Locale;
  locked: boolean;
  state?: StageState;
  typed: string;
}) {
  const [value, setValue] = useState(typed);
  const lost = identityLost(false, value);
  const naive = (
    <DemoCard
      caption={
        locale === "en"
          ? "Placeholder only · type and the box goes anonymous"
          : "只靠占位符 · 输入后就不知道填什么"
      }
    >
      <input
        data-demo="label-naive"
        className="h-11 w-full rounded-lg border border-border-strong bg-surface px-3 text-[14px] outline-none placeholder:text-fg-subtle disabled:opacity-60"
        placeholder={locale === "en" ? "Please enter" : "请输入内容"}
        value={value}
        disabled={locked}
        onChange={(e) => {
          if (locked) return;
          setValue(e.target.value);
        }}
        aria-label={locale === "en" ? "Unlabeled field" : "没有标签的输入框"}
      />
      <p className="mt-3 text-[12px] text-wrong" data-identity-lost={lost ? "true" : "false"}>
        {lost
          ? locale === "en"
            ? "The placeholder is gone. Name, company, or something else?"
            : "占位符已经没了。这是填姓名、公司，还是别的？"
          : locale === "en"
            ? "Type a few characters."
            : "试着输入几个字。"}
      </p>
    </DemoCard>
  );
  const clear = (
    <DemoCard caption={locale === "en" ? "Sign-up · name" : "报名表单 · 姓名"}>
      <Field
        id="demo-label"
        label={pick(FIELD_COPY.name, locale)}
        mark={fieldMark(true, "required")}
        requiredSr={reqSr(locale)}
      >
        <FieldInput
          id="demo-label"
          value={value}
          disabled={locked}
          placeholder={locale === "en" ? "Your real name" : "请输入真实姓名"}
          autoComplete="name"
          onChange={(e) => {
            if (locked) return;
            setValue(e.target.value);
          }}
        />
      </Field>
      <p className="mt-3 text-[12px] text-fg-muted">
        {locale === "en" ? "The label stays above the box." : "标签始终在上方，一眼就懂。"}
      </p>
    </DemoCard>
  );
  return <Pair locked={locked} state={state} naive={naive} clear={clear} />;
}

function RequiredScene({
  locale,
  locked,
  state,
}: {
  locale: Locale;
  locked: boolean;
  state?: StageState;
}) {
  const [toggled, setToggled] = useState(false);
  const marked = locked ? state === "clear" : toggled;
  const nameMark = fieldMark(marked, "required");
  const jobMark = fieldMark(marked, "optional");
  return (
    <DemoCard caption={locale === "en" ? "Sign-up · required vs optional" : "报名表单 · 必填与选填"}>
      <Field
        id="demo-req-name"
        label={pick(FIELD_COPY.name, locale)}
        mark={nameMark}
        requiredSr={reqSr(locale)}
      >
        <FieldInput id="demo-req-name" defaultValue="苏晓雨" disabled={locked} autoComplete="name" />
      </Field>
      <div className="mt-4">
        <Field
          id="demo-req-job"
          label={pick(FIELD_COPY.company, locale)}
          mark={jobMark}
          optionalLabel={optLabel(locale)}
        >
          <FieldInput
            id="demo-req-job"
            defaultValue={locale === "en" ? "Nova · Product" : "Nova · 产品经理"}
            disabled={locked}
            autoComplete="organization"
          />
        </Field>
      </div>
      {locked ? null : (
        <GhostButton locked={locked} on={marked} onClick={() => setToggled((v) => !v)}>
          {marked
            ? locale === "en"
              ? "Hide marks"
              : "隐藏标记"
            : locale === "en"
              ? "Mark required first"
              : "提前标出必填项"}
        </GhostButton>
      )}
    </DemoCard>
  );
}

function HelperScene({
  locale,
  locked,
  state,
  phone,
}: {
  locale: Locale;
  locked: boolean;
  state?: StageState;
  phone: string;
}) {
  const helper = pick(PHONE_HELPER, locale);
  const result = phoneRepair(phone || SHORT_PHONE);
  const error = repairCopy(result, locale);
  const naive = (
    <DemoCard
      caption={
        locale === "en"
          ? "Wrong · helper and error stacked"
          : "错 · 说明和错误叠了两行"
      }
    >
      <Field
        id="demo-help-naive"
        label={pick(FIELD_COPY.phone, locale)}
        mark={fieldMark(true, "required")}
        requiredSr={reqSr(locale)}
        helper={helper}
        message={error}
        tone="error"
        stack={stackedCopy(true, true)}
      >
        <FieldInput id="demo-help-naive" value={phone || SHORT_PHONE} disabled tone="error" />
      </Field>
    </DemoCard>
  );
  const clear = (
    <DemoCard
      caption={
        locale === "en"
          ? "Clear · error replaces the helper, one line"
          : "对 · 错误替换说明，只留一行"
      }
    >
      <Field
        id="demo-help"
        label={pick(FIELD_COPY.phone, locale)}
        mark={fieldMark(true, "required")}
        requiredSr={reqSr(locale)}
        helper={helper}
        message={error}
        tone="error"
      >
        <FieldInput id="demo-help" value={phone || SHORT_PHONE} disabled tone="error" />
      </Field>
      <p className="mt-3 text-[12px] text-fg-muted">
        {locale === "en"
          ? "Same short number. The helper yields — one line."
          : "同一截短号码。出错时用错误替换说明，只留一行。"}
      </p>
    </DemoCard>
  );
  return <Pair locked={locked} state={state} naive={naive} clear={clear} />;
}

function GroupScene({
  locale,
  locked,
  state,
}: {
  locale: Locale;
  locked: boolean;
  state?: StageState;
}) {
  const [toggled, setToggled] = useState(false);
  const grouped = locked ? state === "clear" : toggled;
  const sections = sectionsFor(grouped);
  return (
    <DemoCard caption={locale === "en" ? "Event sign-up · grouping" : "活动报名 · 字段分组"}>
      {asksKnownFact(grouped) ? (
        <p className="mb-3 text-[12px] text-wrong">
          {locale === "en"
            ? "Known facts are still fillable."
            : "已知事实还在让人再填一遍。"}
        </p>
      ) : null}
      <div className="space-y-4">
        {sections.map((section) => (
          <fieldset key={section.group} className="min-w-0">
            {grouped && section.group !== "flat" ? (
              <legend className="mb-2 text-[13px] font-semibold">
                {section.group === "event"
                  ? locale === "en"
                    ? "Event"
                    : "活动信息"
                  : section.group === "signup"
                    ? locale === "en"
                      ? "Sign-up"
                      : "报名信息"
                    : locale === "en"
                      ? "Preferences"
                      : "参会偏好"}
              </legend>
            ) : null}
            <div className={grouped ? "grid gap-3 sm:grid-cols-2" : "grid gap-3"}>
              {section.fields.map((field) => (
                <GroupField key={field.id} field={field} locale={locale} grouped={grouped} locked={locked} />
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      {locked ? null : (
        <GhostButton locked={locked} on={grouped} onClick={() => setToggled((v) => !v)}>
          {grouped
            ? locale === "en"
              ? "Flatten"
              : "取消分组"
            : locale === "en"
              ? "Group by task"
              : "按信息类别分组"}
        </GhostButton>
      )}
    </DemoCard>
  );
}

function GroupField({
  field,
  locale,
  grouped,
  locked,
}: {
  field: FieldSpec;
  locale: Locale;
  grouped: boolean;
  locked: boolean;
}) {
  const label = pick(FIELD_COPY[field.id] ?? { zh: field.id, en: field.id }, locale);
  if (isReadout(field, grouped)) {
    const value =
      field.id === "title"
        ? pick(EVENT.title, locale)
        : field.id === "when"
          ? pick(EVENT.dateLabel, locale)
          : pick(EVENT.place, locale);
    return (
      <div className="rounded-lg bg-surface px-3 py-2.5">
        <p className="text-[11px] text-fg-subtle">{label}</p>
        <p className="mt-0.5 text-[13px] font-medium">{value}</p>
      </div>
    );
  }
  const id = `g-${field.id}`;
  return (
    <Field id={id} label={label}>
      <FieldInput id={id} placeholder={locale === "en" ? "Please enter" : "请输入内容"} disabled={locked} />
    </Field>
  );
}

function HintScene({
  locale,
  locked,
  state,
}: {
  locale: Locale;
  locked: boolean;
  state?: StageState;
}) {
  const [toggled, setToggled] = useState(false);
  const hinted = locked ? state === "clear" : toggled;
  const seat = seatValue(hinted);
  return (
    <DemoCard caption={locale === "en" ? "Sign-up · format and default" : "报名表单 · 默认提示"}>
      <Field
        id="demo-hint-phone"
        label={pick(FIELD_COPY.phone, locale)}
        mark={fieldMark(true, "required")}
        requiredSr={reqSr(locale)}
      >
        <FieldInput
          id="demo-hint-phone"
          placeholder={hintPlaceholder("phone", hinted, locale)}
          disabled={locked}
          autoComplete="tel"
          data-hint={hintKind("phone", hinted)}
        />
      </Field>
      <div className="mt-4">
        <Field
          id="demo-hint-mail"
          label={pick(FIELD_COPY.email, locale)}
          mark={fieldMark(true, "optional")}
          optionalLabel={optLabel(locale)}
        >
          <FieldInput
            id="demo-hint-mail"
            placeholder={hintPlaceholder("email", hinted, locale)}
            disabled={locked}
            autoComplete="email"
            data-hint={hintKind("email", hinted)}
          />
        </Field>
      </div>
      <div className="mt-4">
        <Field id="demo-hint-seat" label={pick(FIELD_COPY.seat, locale)}>
          <FieldSelect
            id="demo-hint-seat"
            value={seat}
            disabled={locked}
            data-hint={hintKind("seat", hinted)}
            onChange={() => {}}
          >
            <option value="">{locale === "en" ? "Choose a seat" : "请选择席位"}</option>
            <option value="standard">{pick(FIELD_COPY.standard, locale)}</option>
            <option value="vip">{pick(FIELD_COPY.vip, locale)}</option>
          </FieldSelect>
        </Field>
      </div>
      {locked ? null : (
        <GhostButton locked={locked} on={hinted} onClick={() => setToggled((v) => !v)}>
          {hinted
            ? locale === "en"
              ? "Hide hints"
              : "收起提示"
            : locale === "en"
              ? "Give format and default"
              : "给出格式提示"}
        </GhostButton>
      )}
    </DemoCard>
  );
}

function RepairScene({
  locale,
  locked,
  state,
  phone,
}: {
  locale: Locale;
  locked: boolean;
  state?: StageState;
  phone: string;
}) {
  const value = phone || SHORT_PHONE;
  const live = phoneRepair(value);
  const message = repairCopy(live, locale);
  const field = (
    <DemoCard caption={locale === "en" ? "Clear · miss under the field, with a fix" : "对 · 错在栏下，带改法"}>
      <Field
        id="demo-repair"
        label={pick(FIELD_COPY.phone, locale)}
        mark={fieldMark(true, "required")}
        requiredSr={reqSr(locale)}
        message={message}
        tone={live.tone}
      >
        <FieldInput
          id="demo-repair"
          value={value}
          disabled
          tone={live.tone}
          data-placement={repairPlacement(true)}
          data-actionable={repairIsActionable(live) ? "true" : "false"}
        />
      </Field>
      <p className="mt-3 text-[12px] text-fg-muted">
        {locale === "en"
          ? "The miss stays in this column and says how to fix it."
          : "错误写在当前字段旁，带着该怎么改。"}
      </p>
    </DemoCard>
  );
  const banner = (
    <DemoCard caption={locale === "en" ? "Wrong · a banner that names no field" : "错 · 页顶一句失败，对不上栏"}>
      <p
        className="mb-3 rounded-lg bg-wrong-soft px-3 py-2 text-[13px] text-wrong"
        role="alert"
        data-placement={repairPlacement(false)}
      >
        {locale === "en" ? "Submit failed. Please check and try again." : "提交失败，请检查后重试"}
      </p>
      <Field id="demo-repair-naive" label={pick(FIELD_COPY.phone, locale)}>
        <FieldInput id="demo-repair-naive" value={value} disabled />
      </Field>
    </DemoCard>
  );
  return <Pair locked={locked} state={state} naive={banner} clear={field} />;
}

function DoneScene({
  locale,
  locked,
  state,
  snap,
}: {
  locale: Locale;
  locked: boolean;
  state?: StageState;
  snap: { typed: string; email: string };
}) {
  const [submitted, setSubmitted] = useState(false);
  const email = snap.email || "sue@example.com";
  const name = snap.typed || "苏晓雨";
  const naiveOutcome = { title: locale === "en" ? "Success" : "成功", what: "", next: "" };
  const clearOutcome = {
    title: locale === "en" ? "You’re in" : "报名成功",
    what:
      locale === "en"
        ? `${name}, confirmation sent to ${email}`
        : `${name}，确认邮件已发送至 ${email}`,
    next: locale === "en" ? "Add to calendar" : "添加到日历",
  };
  const showPanel = locked ? state === "clear" : submitted;
  const naive = (
    <DemoCard caption={locale === "en" ? "Wrong · only the word Success" : "错 · 只弹「成功」"}>
      <p className="py-6 text-center text-[1.4rem] font-semibold">{naiveOutcome.title}</p>
      <p className="text-center text-[12px] text-fg-subtle">
        {locale === "en"
          ? `Complete? ${outcomeComplete(naiveOutcome) ? "yes" : "no — missing what and next"}`
          : `交代完了吗？${outcomeComplete(naiveOutcome) ? "是" : "没有 — 缺发生了什么和下一步"}`}
      </p>
    </DemoCard>
  );
  const clear = (
    <DemoCard caption={locale === "en" ? "Clear · what happened + next step" : "对 · 发生了什么 + 下一步"}>
      {showPanel ? (
        <div className="px-1 py-2 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-intent-soft text-intent">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden="true">
              <path d="M5 12.5 10 17.5 19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h4 className="mt-4 text-[1.15rem] font-semibold">{clearOutcome.title}</h4>
          <p className="mt-2 text-[13px] text-fg-muted">{clearOutcome.what}</p>
          <div className="mt-4 rounded-xl bg-surface px-4 py-3 text-[13px] text-fg-muted">
            {pick(EVENT.dateLabel, locale)} · {pick(EVENT.place, locale)}
          </div>
          <button
            type="button"
            disabled={locked}
            className="mt-4 inline-flex h-10 items-center rounded-lg bg-fg px-3 text-[13px] text-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            {clearOutcome.next}
          </button>
        </div>
      ) : (
        <div>
          <p className="text-[13px] text-fg-muted">
            {locale === "en"
              ? "After submit, do not leave only “Success”. Name what happened and a next step."
              : "提交后不要只弹「成功」。写清发生了什么，并给出下一步。"}
          </p>
          <GhostButton locked={locked} on={false} onClick={() => setSubmitted(true)}>
            {locale === "en" ? "Submit sign-up" : "提交报名"}
          </GhostButton>
        </div>
      )}
    </DemoCard>
  );
  return <Pair locked={locked} state={state} naive={naive} clear={clear} />;
}
