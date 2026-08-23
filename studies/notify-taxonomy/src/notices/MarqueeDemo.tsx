import { MARQUEE_ITEMS } from "../lib/fixtures";
import { stageOn } from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import { AppNav, AvatarMark, Frame, Stat } from "./Frame";
import "./motion.css";

export function MarqueeDemo({ state }: { state?: string } = {}) {
  const locale = useLocale();
  const visible = state === undefined ? true : stageOn(state);
  const items = MARQUEE_ITEMS.map((item) => pick(item, locale));
  const loop = [...items, ...items];

  return (
    <Frame
      title={locale === "en" ? "Orbit · Data" : "Orbit · 数据工作台"}
      nav={
        <AppNav brand="Orbit">
          <AvatarMark mark="S" />
        </AppNav>
      }
      bar={
        visible ? (
          <div
            data-marquee
            className="notify-marquee flex h-8 w-full min-w-0 shrink-0 items-center gap-2 bg-fg px-2 text-surface"
          >
            <span className="shrink-0 rounded-sm bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-fg">
              {locale === "en" ? "Live" : "公告"}
            </span>
            <div className="h-8 min-w-0 flex-1 overflow-hidden">
              <div
                data-marquee-track
                className="notify-marquee-track flex w-max items-center gap-10 whitespace-nowrap text-[12px] leading-8"
              >
                {loop.map((item, i) => (
                  <span key={`${item}-${i}`}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        ) : null
      }
    >
      <div className="px-6 py-6">
        <h2 className="text-[13px] font-semibold">
          {locale === "en" ? "Data desk" : "数据工作台"}
        </h2>
        <p className="mt-0.5 text-[11px] text-fg-muted">
          {locale === "en" ? "Live numbers. The page does not swap." : "经营数据实时更新。画面不被切走。"}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <Stat
            label={locale === "en" ? "Today" : "今日新增"}
            value="128"
            hint="+12%"
          />
          <Stat
            label={locale === "en" ? "Report" : "AI 报告"}
            value={locale === "en" ? "Ready" : "已更新"}
            hint="v2.3"
          />
          <Stat
            label={locale === "en" ? "Live" : "今晚直播"}
            value="20:00"
            hint={locale === "en" ? "On time" : "准时开播"}
          />
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Three lines rotate in one strip. Hover to pause. This is not a carousel that changes the view."
            : "三条在同一条里轮流。悬停暂停。不是把整块画面切走的轮播。"}
        </p>
      </div>
    </Frame>
  );
}
