import { catalogFromRegistry } from "../lib/catalog";
import { hostExplanation, surfaceLabel } from "../lib/explain";
import { componentNames, paintSurface, routeBuffer } from "../lib/machines";
import { deepseekRecording } from "../lib/recorded";
import type { Locale } from "../lib/site-locale";

export function RecordingPanel({ locale }: { locale: Locale }) {
  if (deepseekRecording.status === "not-run") {
    return (
      <p className="text-[13px] leading-relaxed text-fg-subtle" data-recording="not-run">
        {locale === "en"
          ? "These are offline fixtures. This build has no DeepSeek route recording."
          : "下面是离线样例。这一份构建里没有 DeepSeek 的路由记录。"}
      </p>
    );
  }

  const catalog = catalogFromRegistry();
  const result = routeBuffer(deepseekRecording.raw, catalog);
  const paint = paintSurface(result);

  return (
    <section data-recording="recorded" className="grid gap-2 rounded-xl border border-border bg-surface px-4 py-3">
      <p className="route-kicker">
        DeepSeek · {deepseekRecording.model} · {deepseekRecording.recordedAt}
      </p>
      <p className="text-[14px] leading-relaxed text-fg">{deepseekRecording.request}</p>
      <p className="text-[13px] font-medium text-fg">
        {locale === "en" ? "Host read this as" : "宿主把它读成"} {surfaceLabel(paint, locale)}
      </p>
      <p className="text-[13px] leading-relaxed text-fg-muted">
        {hostExplanation(result, componentNames(catalog), locale)}
      </p>
      <pre className="route-code">{deepseekRecording.raw}</pre>
    </section>
  );
}
