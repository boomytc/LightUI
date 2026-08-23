import { useId, useState } from "react";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { FieldLabel, Frame, fieldClass, useLiveFill } from "./Frame";

const MAX = 500;

export function TextareaDemo({ state }: { state?: string } = {}) {
  const locale = useLocale();
  const fill = useLiveFill();
  const id = useId();
  const sample = pick(
    { zh: "希望把结算页的配送选项摊开，好比较时效。", en: "Lay the shipping options out so timing can be compared." },
    locale,
  );
  const [value, setValue] = useState(state === "filled" ? sample : "");

  return (
    <Frame title={locale === "en" ? "Request · brief" : "需求 · 描述"}>
      <FieldLabel htmlFor={id}>{locale === "en" ? "Brief" : "需求描述"}</FieldLabel>
      <textarea
        id={id}
        className={cn(fieldClass, "min-h-28 resize-y py-2.5", fill && "min-h-36 flex-1")}
        rows={4}
        maxLength={MAX}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={locale === "en" ? "Describe the brief…" : "请输入需求描述…"}
      />
      <p className="mt-2 text-right text-[12px] tabular-nums text-fg-subtle" aria-live="polite">
        {value.length}/{MAX}
      </p>
    </Frame>
  );
}
