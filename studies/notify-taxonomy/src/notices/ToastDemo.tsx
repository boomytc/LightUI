import { useEffect, useId, useState } from "react";
import { autoDismissMs, stageOn } from "../lib/machines";
import { useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Action, AppNav, AvatarMark, Field, Frame } from "./Frame";

export function ToastDemo({ state }: { state?: string } = {}) {
  const locale = useLocale();
  const nickId = useId();
  const mailId = useId();
  const locked = state !== undefined && stageOn(state);
  const [nickname, setNickname] = useState("Sue");
  const [email, setEmail] = useState("sue@orbit.studio");
  const [toast, setToast] = useState<{ id: number; leaving: boolean } | null>(
    locked ? { id: 0, leaving: false } : null,
  );

  useEffect(() => {
    if (!toast || toast.leaving || locked) return;
    const hide = window.setTimeout(() => {
      setToast((curr) => (curr ? { ...curr, leaving: true } : null));
    }, autoDismissMs("toast"));
    return () => window.clearTimeout(hide);
  }, [toast, locked]);

  useEffect(() => {
    if (!toast?.leaving) return;
    const gone = window.setTimeout(() => setToast(null), 160);
    return () => window.clearTimeout(gone);
  }, [toast]);

  function save() {
    setToast({ id: Date.now(), leaving: false });
  }

  return (
    <Frame
      title={locale === "en" ? "Orbit · Profile" : "Orbit · 个人资料"}
      nav={
        <AppNav brand="Orbit">
          <AvatarMark mark="S" />
        </AppNav>
      }
    >
      <div className="px-6 py-7">
        <div className="max-w-md">
          <h2 className="text-[13px] font-semibold">{locale === "en" ? "Profile" : "个人资料"}</h2>
          <p className="mt-0.5 text-[11px] text-fg-muted">
            {locale === "en" ? "Shown to the team" : "公开信息展示给团队成员"}
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <Field
              id={nickId}
              label={locale === "en" ? "Name" : "昵称"}
              value={nickname}
              onChange={setNickname}
            />
            <Field
              id={mailId}
              label={locale === "en" ? "Email" : "邮箱"}
              value={email}
              onChange={setEmail}
            />
          </div>
          <div className="mt-4">
            <Action onClick={save}>{locale === "en" ? "Save profile" : "保存资料"}</Action>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-fg-subtle">
            {locale === "en"
              ? "The toast does not freeze the form. Keep typing while it is up."
              : "轻提示不冻结表单。它还在的时候也可以继续改。"}
          </p>
        </div>
      </div>

      {toast ? (
        <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex justify-center px-4">
          <div
            className={cn(
              "rounded-md bg-fg px-3 py-1.5 text-[12px] text-surface shadow-card transition duration-150",
              toast.leaving ? "-translate-y-1 opacity-0" : "translate-y-0 opacity-100",
            )}
          >
            {locale === "en" ? "Saved" : "保存成功"}
          </div>
        </div>
      ) : null}
    </Frame>
  );
}
