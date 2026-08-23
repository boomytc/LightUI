import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import {
  CODE_PLACEHOLDER,
  COPY,
  EMAIL_PLACEHOLDER,
  PASSWORD_PLACEHOLDER,
  PHONE_PLACEHOLDER,
  ROLES,
} from "../lib/fixtures";
import { KINDS, type KindId } from "../lib/kinds";
import { DEFAULT_ROLE, type RoleId, type StepIndex, paneCount } from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Window } from "./Frame";
import "./login.css";

export function KindDemo({
  id,
  step = 1,
}: {
  id: KindId;
  step?: StepIndex;
}) {
  const locale = useLocale();
  const meta = KINDS.find((k) => k.id === id) ?? KINDS[0];
  const title = pick(meta.window, locale);
  const [current, setCurrent] = useState<StepIndex>(step);
  const [role, setRole] = useState<RoleId>(DEFAULT_ROLE);

  useEffect(() => {
    setCurrent(step);
    setRole(DEFAULT_ROLE);
  }, [id, step]);

  return (
    <Window title={title}>
      {id === "centered" ? <CenteredPage /> : null}
      {id === "split" ? <SplitPage /> : null}
      {id === "immersive" ? <ImmersivePage /> : null}
      {id === "roles" ? <RolesPage role={role} onRole={setRole} /> : null}
      {id === "steps" ? <StepsPage step={current} onStep={setCurrent} /> : null}
    </Window>
  );
}

function CenteredPage() {
  const locale = useLocale();
  return (
    <div className="login-centered" data-login-well data-panes={paneCount("centered")}>
      <div className="login-card grid gap-4" data-login-card>
        <header className="grid gap-1.5">
          <span className="size-7 rounded-md bg-accent" aria-hidden="true" />
          <h3 className="text-[1.2rem] font-semibold tracking-tight">{pick(COPY.welcome, locale)}</h3>
          <p className="text-[12px] text-fg-muted">{pick(COPY.continueDesk, locale)}</p>
        </header>
        <FakeField id="centered-email" label={pick(COPY.email, locale)} placeholder={EMAIL_PLACEHOLDER} />
        <FakeField
          id="centered-password"
          label={pick(COPY.password, locale)}
          placeholder={PASSWORD_PLACEHOLDER}
          type="password"
        />
        <FakeButton>{pick(COPY.signIn, locale)}</FakeButton>
        <p className="text-center text-[11px] text-fg-subtle">{pick(COPY.forgot, locale)}</p>
      </div>
    </div>
  );
}

function SplitPage() {
  const locale = useLocale();
  return (
    <div className="login-split" data-login-well data-panes={paneCount("split")}>
      <section className="login-split-brand" data-login-pane="brand">
        <p className="text-[10px] font-medium tracking-[0.16em] text-white/70 uppercase">
          {pick(COPY.brandKicker, locale)}
        </p>
        <h3 className="login-split-title">
          {locale === "en" ? (
            <>
              Turn a fuzzy spark
              <br />
              into a clear piece
            </>
          ) : (
            <>
              把每一个模糊灵感
              <br />
              变成清晰作品
            </>
          )}
        </h3>
        <p className="login-split-body">{pick(COPY.brandBody, locale)}</p>
      </section>
      <section className="login-split-form" data-login-pane="form">
        <header className="grid gap-1">
          <h3 className="text-[1.15rem] font-semibold tracking-tight">{pick(COPY.welcome, locale)}</h3>
          <p className="text-[12px] text-fg-muted">{pick(COPY.continueStudio, locale)}</p>
        </header>
        <FakeField
          id="split-email"
          label={pick(COPY.email, locale)}
          placeholder={EMAIL_PLACEHOLDER}
          surface="underline"
        />
        <FakeField
          id="split-password"
          label={pick(COPY.password, locale)}
          placeholder={PASSWORD_PLACEHOLDER}
          type="password"
          surface="underline"
        />
        <FakeButton>{pick(COPY.signIn, locale)}</FakeButton>
      </section>
    </div>
  );
}

function ImmersivePage() {
  const locale = useLocale();
  return (
    <div className="login-immersive" data-login-well data-panes={paneCount("immersive")}>
      <div className="login-immersive-copy">
        <h3>
          {pick(COPY.trailTitle, locale)}
        </h3>
        <p className="mt-2 max-w-[16rem] text-[12px] leading-relaxed text-white/75">
          {pick(COPY.trailBody, locale)}
        </p>
      </div>
      <form className="login-immersive-form" onSubmit={(e) => e.preventDefault()}>
        <header className="grid gap-1">
          <h4 className="text-[1.15rem] font-semibold tracking-tight">{pick(COPY.welcome, locale)}</h4>
          <p className="text-[12px] text-white/70">{pick(COPY.continueTrail, locale)}</p>
        </header>
        <FakeField
          id="immer-email"
          label={pick(COPY.email, locale)}
          placeholder={EMAIL_PLACEHOLDER}
          surface="ghost"
          tone="light"
        />
        <FakeField
          id="immer-password"
          label={pick(COPY.password, locale)}
          placeholder={PASSWORD_PLACEHOLDER}
          type="password"
          surface="ghost"
          tone="light"
        />
        <FakeButton inverse>{pick(COPY.signIn, locale)}</FakeButton>
      </form>
    </div>
  );
}

function RolesPage({
  role,
  onRole,
}: {
  role: RoleId;
  onRole: (id: RoleId) => void;
}) {
  const locale = useLocale();
  const personal = role === "personal";
  return (
    <div className="login-roles" data-login-well data-panes={paneCount("roles")} data-role={role}>
      <div className="login-roles-surface">
        <div
          role="tablist"
          aria-label={locale === "en" ? "Sign-in role" : "登录身份"}
          className="grid grid-cols-2 border-b border-border"
        >
          {ROLES.map((item) => {
            const on = item.id === role;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => onRole(item.id)}
                className={cn(
                  "relative h-10 text-[13px] font-medium transition-colors",
                  on ? "text-accent" : "text-fg-subtle hover:text-fg",
                )}
              >
                {pick(item.label, locale)}
                <span
                  className={cn(
                    "absolute inset-x-6 -bottom-px h-0.5 origin-center bg-accent transition-transform duration-200",
                    on ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </button>
            );
          })}
        </div>
        <div className="mt-5 grid gap-4">
          <header className="grid gap-1">
            <h3 className="text-[1.15rem] font-semibold tracking-tight">
              {pick(personal ? COPY.personalTitle : COPY.enterpriseTitle, locale)}
            </h3>
            <p className="text-[12px] text-fg-muted">
              {pick(personal ? COPY.personalHint : COPY.enterpriseHint, locale)}
            </p>
          </header>
          {personal ? (
            <>
              <FakeField id="role-phone" label={pick(COPY.phone, locale)} placeholder={PHONE_PLACEHOLDER} />
              <FakeField id="role-code" label={pick(COPY.code, locale)} placeholder={CODE_PLACEHOLDER} />
            </>
          ) : (
            <>
              <FakeField id="role-email" label={pick(COPY.workEmail, locale)} placeholder={EMAIL_PLACEHOLDER} />
              <FakeField
                id="role-password"
                label={pick(COPY.password, locale)}
                placeholder={PASSWORD_PLACEHOLDER}
                type="password"
              />
            </>
          )}
          <FakeButton>{pick(COPY.signIn, locale)}</FakeButton>
        </div>
      </div>
    </div>
  );
}

function StepsPage({
  step,
  onStep,
}: {
  step: StepIndex;
  onStep: (next: StepIndex) => void;
}) {
  const locale = useLocale();
  return (
    <div className="login-steps" data-login-well data-panes={paneCount("steps")} data-step={step}>
      <div className="login-card grid gap-5" data-login-card>
        <div className="grid grid-cols-2 gap-2" aria-hidden="true">
          <span className="login-tick" data-on="true" />
          <span className="login-tick" data-on={step === 2 ? "true" : "false"} />
        </div>
        {step === 1 ? (
          <div className="grid gap-4">
            <header className="grid gap-1">
              <h3 className="text-[1.15rem] font-semibold tracking-tight">
                {pick(COPY.stepEmailTitle, locale)}
              </h3>
              <p className="text-[12px] text-fg-muted">{pick(COPY.stepEmailHint, locale)}</p>
            </header>
            <FakeField id="step-email" label={pick(COPY.email, locale)} placeholder={EMAIL_PLACEHOLDER} />
            <FakeButton onClick={() => onStep(2)}>{pick(COPY.continue, locale)}</FakeButton>
          </div>
        ) : (
          <div className="grid gap-4">
            <header className="grid gap-1">
              <button
                type="button"
                onClick={() => onStep(1)}
                className="inline-flex w-fit items-center gap-1 text-[11px] text-fg-subtle hover:text-fg"
              >
                <ChevronLeft className="size-3.5" />
                {pick(COPY.back, locale)}
              </button>
              <h3 className="text-[1.15rem] font-semibold tracking-tight">
                {pick(COPY.stepPasswordTitle, locale)}
              </h3>
            </header>
            <FakeField
              id="step-password"
              label={pick(COPY.password, locale)}
              placeholder={PASSWORD_PLACEHOLDER}
              type="password"
            />
            <FakeButton>{pick(COPY.signIn, locale)}</FakeButton>
          </div>
        )}
      </div>
    </div>
  );
}

function FakeField({
  id,
  label,
  placeholder,
  type = "text",
  surface = "outline",
  tone = "dark",
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  surface?: "outline" | "underline" | "ghost";
  tone?: "dark" | "light";
}) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <label
        htmlFor={id}
        className={cn("text-[12px]", tone === "light" ? "text-white/70" : "text-fg-muted")}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        readOnly
        tabIndex={-1}
        placeholder={placeholder}
        className={cn(
          "login-field",
          surface === "outline" && "login-field-outline",
          surface === "underline" && "login-field-underline",
          surface === "ghost" && "login-field-ghost",
        )}
      />
    </div>
  );
}

function FakeButton({
  children,
  inverse = false,
  onClick,
}: {
  children: string;
  inverse?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 w-full min-w-0 items-center justify-center rounded-lg text-[13px] font-medium",
        inverse ? "bg-surface text-fg" : "bg-fg text-surface",
      )}
    >
      {children}
    </button>
  );
}
