import { useId, useState } from "react";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { FieldLabel, Frame, fieldClass } from "./Frame";

export function TextFieldDemo({ state }: { state?: string } = {}) {
  const locale = useLocale();
  const id = useId();
  const filled = pick({ zh: "王敏", en: "Mina" }, locale);
  const [value, setValue] = useState(state === "filled" ? filled : "");
  const [touched, setTouched] = useState(state === "error");
  const empty = value.trim() === "";
  const error = touched && empty;

  return (
    <Frame title={locale === "en" ? "Sign up · name" : "注册 · 姓名"}>
      <FieldLabel htmlFor={id} required>
        {locale === "en" ? "Name" : "姓名"}
      </FieldLabel>
      <input
        id={id}
        className={cn(fieldClass, error && "border-fg")}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={locale === "en" ? "Your real name" : "请输入真实姓名"}
        autoComplete="name"
        aria-required="true"
        aria-invalid={error}
      />
      {error ? (
        <p className="mt-2 text-[13px] text-fg" role="alert">
          {locale === "en" ? "Enter a name" : "请填写姓名"}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Chip on>{locale === "en" ? "Label" : "标签"}</Chip>
        <Chip on={empty}>{locale === "en" ? "Placeholder" : "占位文字"}</Chip>
        <Chip on={touched}>{locale === "en" ? "Required on blur" : "失焦校验"}</Chip>
      </div>
    </Frame>
  );
}

function Chip({ on, children }: { on?: boolean; children: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px]",
        on ? "bg-accent-soft text-accent" : "bg-surface-2 text-fg-subtle",
      )}
    >
      {children}
    </span>
  );
}
