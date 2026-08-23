import { useState } from "react";
import { Check, TriangleAlert } from "lucide-react";
import { stageOn } from "../lib/machines";
import { useLocale } from "../lib/site-locale";
import { Action, AppNav, AvatarMark, Frame } from "./Frame";

export function AlertDemo({ state }: { state?: string } = {}) {
  const locale = useLocale();
  const startOn = state !== undefined && stageOn(state);
  const [visible, setVisible] = useState(startOn);
  const [resolved, setResolved] = useState(false);

  function scan() {
    setResolved(false);
    setVisible(true);
  }

  function reset() {
    setVisible(false);
    setResolved(true);
  }

  return (
    <Frame
      title={locale === "en" ? "Orbit · Security" : "Orbit · 安全中心"}
      nav={
        <AppNav brand="Orbit">
          <AvatarMark mark="S" />
        </AppNav>
      }
    >
      <div className="px-5 py-5">
        <h2 className="text-[13px] font-semibold">{locale === "en" ? "Security" : "安全中心"}</h2>
        <p className="mt-0.5 text-[11px] text-fg-muted">
          {locale === "en" ? "Scan keys on a schedule" : "定期扫描密钥安全"}
        </p>
        <div className="mt-3 text-[12px]">
          {visible ? (
            <span className="text-accent">{locale === "en" ? "Scan done · 1 risk" : "扫描完成 · 发现 1 个风险"}</span>
          ) : resolved ? (
            <span className="inline-flex items-center gap-1 text-fg-muted">
              <Check className="size-3.5" />
              {locale === "en" ? "Risk handled" : "风险已处理"}
            </span>
          ) : (
            <span className="text-fg-muted">{locale === "en" ? "No scan yet" : "尚未扫描"}</span>
          )}
        </div>

        {visible ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-md bg-accent-soft px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2 text-[13px] text-accent">
              <TriangleAlert className="size-4 shrink-0" />
              <span className="min-w-0">
                {locale === "en" ? "Key leak risk detected" : "检测到密钥泄露风险"}
              </span>
            </div>
            <Action onClick={reset} className="shrink-0">
              {locale === "en" ? "Reset now" : "立即重置"}
            </Action>
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3 rounded-md bg-surface-2 px-3 py-3">
          <div className="min-w-0">
            <div className="text-[13px]">{locale === "en" ? "Production API key" : "生产环境 API 密钥"}</div>
            <div className="mt-0.5 truncate font-mono text-[12px] text-fg-muted">sk-9f2c4d7e1a3b</div>
          </div>
          <span className="shrink-0 text-[11px] text-fg-subtle">
            {locale === "en" ? "In use" : "使用中"}
          </span>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Pinned in the content until Reset now. Not a modal, and not a two-second toast."
            : "钉在内容区，直到「立即重置」。不是模态，也不是两秒就消失的轻提示。"}
        </p>
        {!visible ? (
          <div className="mt-3">
            <Action onClick={scan}>{locale === "en" ? "Scan keys" : "扫描密钥"}</Action>
          </div>
        ) : null}
      </div>
    </Frame>
  );
}
