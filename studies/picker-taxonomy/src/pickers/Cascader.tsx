import { useMemo, useState } from "react";
import { CASCADE_PATH, LEVEL_LABEL, REGIONS } from "../lib/fixtures";
import {
  cascadeComplete,
  cascadeJump,
  cascadeLevel,
  cascadeOptions,
  cascadeSelect,
} from "../lib/machines";
import { useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Phone, PhoneButton } from "./Frame";

export function Cascader() {
  const locale = useLocale();
  const [path, setPath] = useState<string[]>([...CASCADE_PATH]);
  const [confirmed, setConfirmed] = useState<string[] | null>(null);

  const options = useMemo(() => cascadeOptions(REGIONS, path), [path]);
  const level = cascadeLevel(path);
  const complete = cascadeComplete(path);
  const labels = LEVEL_LABEL[locale];

  const select = (name: string) => {
    setConfirmed(null);
    setPath(cascadeSelect(path, name));
  };

  const jumpTo = (index: number) => {
    setConfirmed(null);
    setPath(cascadeJump(path, index));
  };

  const handleBack = () => {
    if (path.length > 0) {
      setConfirmed(null);
      setPath(path.slice(0, -1));
    }
  };

  return (
    <Phone
      title={locale === "en" ? "Shipping region" : "选择收货地区"}
      onBack={handleBack}
      footer={
        <PhoneButton
          disabled={!complete}
          onClick={() => complete && setConfirmed([...path])}
        >
          {locale === "en" ? "Confirm region" : "确认地区"}
        </PhoneButton>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="px-5 pt-2 text-[13px] text-fg-muted">
          {path.length === 0 ? (
            labels[0]
          ) : (
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-fg">
              {path.map((name, i) => (
                <span key={`${name}-${i}`} className="flex items-center gap-1.5">
                  {i > 0 ? <span className="text-fg-subtle">›</span> : null}
                  <button
                    type="button"
                    className="text-fg-muted transition-colors duration-150 hover:text-accent"
                    onClick={() => jumpTo(i)}
                  >
                    {name}
                  </button>
                </span>
              ))}
              {!complete ? (
                <span className="flex items-center gap-1.5 text-fg-muted">
                  <span className="text-fg-subtle">›</span>
                  {labels[level]}
                </span>
              ) : null}
            </div>
          )}
        </div>

        <ul className="mt-2 min-h-0 flex-1 overflow-y-auto">
          {options.map((item) => {
            const selected = path[level] === item.name;
            return (
              <li key={item.name}>
                <button
                  type="button"
                  onClick={() => select(item.name)}
                  className={cn(
                    "flex min-h-12 w-full items-center justify-between border-b border-border px-5 text-left text-[13px]",
                    selected ? "bg-accent-soft text-accent" : "text-fg",
                  )}
                >
                  <span className="py-3">{item.name}</span>
                  <ChevronRight className={selected ? "text-accent" : "text-fg-subtle"} />
                </button>
              </li>
            );
          })}
        </ul>

        {complete ? (
          <div className="mx-5 mb-2 rounded-xl bg-surface-2 px-4 py-3">
            <p className="text-[11px] text-fg-muted">{locale === "en" ? "Selected" : "已选择"}</p>
            <p className="mt-1 text-[13px] font-medium">{path.join(" / ")}</p>
          </div>
        ) : null}

        <p className="px-5 pb-3 text-center text-[11px] text-accent">
          {confirmed
            ? locale === "en"
              ? `Confirmed ${confirmed.join(" / ")}`
              : `已确认 ${confirmed.join(" / ")}`
            : locale === "en"
              ? "One level at a time · options follow · changing a parent clears children"
              : "逐级选择 · 选项联动 · 更换上级时，清空下级选择"}
        </p>
      </div>
    </Phone>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`size-4 ${className ?? ""}`} fill="none" aria-hidden="true">
      <path
        d="m9 5 7 7-7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
