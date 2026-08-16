import { useState } from "react";
import { DEMO_HINTS } from "./lib/menu-data";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./intent/Playground";

export function StudyView() {
  const locale = useLocale();
  const [enabled, setEnabled] = useState(true);
  const [showTriangles, setShowTriangles] = useState(true);
  const [restDelay, setRestDelay] = useState(280);

  return (
    <div className="page-width min-w-0 pb-20">
      <section className="grid min-w-0 gap-10 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "Guess from the pointer path whether you are heading into the submenu."
              : "根据鼠标移动方向，推测你是不是要进子菜单。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "Classic cascade-menu problem: a diagonal slide into the second level briefly crosses other items and the menu switches. The safe triangle protects that diagonal."
              : "多级菜单的经典问题：从一级斜着滑向二级时，指针会短暂经过其它项，菜单被误切换。下面这套交互用「安全三角」保护那条斜线。"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
          <div className="flex flex-col gap-3">
            <ToggleRow
              label={locale === "en" ? "Intent prediction" : "意图预测"}
              hint={
                enabled
                  ? locale === "en"
                    ? "Diagonal crossing is protected"
                    : "斜向穿越会被保护"
                  : locale === "en"
                    ? "Classic hover — crossing switches immediately"
                    : "经典 hover，途经即切换"
              }
              checked={enabled}
              onChange={setEnabled}
            />
            <ToggleRow
              label={locale === "en" ? "Show safe triangle" : "显示安全三角"}
              hint={
                locale === "en"
                  ? "Blue = predicted corridor · Green = inside submenu"
                  : "蓝 = 预测走廊 · 绿 = 已进入子菜单"
              }
              checked={showTriangles}
              onChange={setShowTriangles}
            />
            <label className="flex items-center justify-between gap-4 pt-1">
              <span>
                <span className="block text-[13px] font-medium text-fg">
                  {locale === "en" ? "Dwell timeout" : "停驻超时"}
                </span>
                <span className="mt-0.5 block text-[12px] text-fg-subtle">
                  {locale === "en"
                    ? `Dwelling on another item for ${restDelay}ms still switches`
                    : `停在其它项上超过 ${restDelay}ms 仍会切换`}
                </span>
              </span>
              <input
                type="range"
                min={80}
                max={600}
                step={20}
                value={restDelay}
                onChange={(e) => setRestDelay(Number(e.target.value))}
                className="w-28 accent-accent"
              />
            </label>
          </div>
        </div>
      </section>

      <Playground enabled={enabled} showTriangles={showTriangles} restDelay={restDelay} />

      <section className="mt-14 grid gap-4 sm:grid-cols-3">
        {DEMO_HINTS.map((h) => {
          const Icon = h.icon;
          return (
            <article key={h.id} className="rounded-2xl border border-border bg-surface p-5 shadow-card">
              <Icon className="size-4 text-fg-muted" strokeWidth={2} />
              <h2 className="mt-3 text-[15px] font-semibold tracking-tight">{pick(h.title, locale)}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">{pick(h.body, locale)}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-14 grid min-w-0 gap-10 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "How it decides" : "算法怎么判"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "1. Sample the trail" : "1. 采样轨迹"}
              </span>
              <br />
              {locale === "en"
                ? "Keep the last few pointer samples. After a submenu opens, the previous sample and the leading-edge corners form a triangle."
                : "记录最近几次指针位置。子菜单打开后，用「上一帧」和当前子菜单左缘上下两点构成三角形。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Point in triangle / slopes converge" : "2. 点在三角内 / 斜率收敛"}
              </span>
              <br />
              {locale === "en"
                ? "If the current point sits in the previous-sample triangle, or the slope to the top falls while the slope to the bottom rises, treat it as heading into the submenu."
                : "若当前点落在「上一帧 → 子菜单顶/底」的三角里，或对顶角斜率下降、对底角斜率上升，则判定为朝向子菜单。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Delay the switch; abandon on dwell" : "3. 延迟切换，停驻则放弃"}
              </span>
              <br />
              {locale === "en"
                ? "Do not switch the first-level highlight while heading in. If the pointer turns, leaves the triangle, or dwells on another item past the timeout, switch immediately. Entering the submenu locks it (green)."
                : "朝向子菜单时不切换一级高亮。指针改道、离开三角，或在其它项上停驻超过超时，立刻切换。进入子菜单则锁定（绿三角）。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            predictsIntent
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function predictsIntent(prev, curr, top, bot) {
  if (pointInTriangle(curr, prev, top, bot))
    return true
  // slope test
  return slope(curr, top) < slope(prev, top)
      && slope(curr, bot) > slope(prev, bot)
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "The blue triangle in the overlay uses the live pointer as the third vertex so the corridor is visible. The real test uses the previous sample — otherwise the pointer sits on its own vertex and intent cannot be measured."
              : "可视化里的蓝三角是「从当前指针到子菜单左缘」——方便理解走廊。真正做判定时，三角的第三个顶点是上一帧指针，否则指针永远在自己的顶点上，测不到意图。"}
          </p>
        </article>
      </section>

      <section className="mt-14 rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <h2 className="text-[1.2rem] font-semibold tracking-tight">
          {locale === "en" ? "Why not a flat delay?" : "和「加 delay」有什么不同"}
        </h2>
        <div className="mt-5 grid gap-6 text-[14px] leading-relaxed text-fg-muted md:grid-cols-2">
          <p>
            {locale === "en"
              ? "A 200ms delay on every hover makes vertical scanning sticky, and is often still too short for a diagonal. Intent delays only when the path looks like it is entering the submenu."
              : "给 hover 一律加 200ms 延迟，纵向切换会发黏，斜向穿越又常常不够。意图预测只在「像是要进子菜单」时延迟，沿列表上下移动仍然是即时的。"}
          </p>
          <p>
            {locale === "en"
              ? "This page draws the corridor so you can see why a diagonal is protected and a vertical scan is not."
              : "本页把走廊画出来，方便看出为什么斜线会被保护、纵向扫却立刻切换。"}
          </p>
        </div>
      </section>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span>
        <span className="block text-[13px] font-medium text-fg">{label}</span>
        <span className="mt-0.5 block text-[12px] text-fg-subtle">{hint}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={
          checked
            ? "relative h-6 w-10 shrink-0 rounded-full bg-accent transition-colors duration-150"
            : "relative h-6 w-10 shrink-0 rounded-full bg-border-strong transition-colors duration-150"
        }
      >
        <span
          className={
            checked
              ? "absolute top-0.5 left-4 size-5 rounded-full bg-surface shadow-sm transition-transform duration-150"
              : "absolute top-0.5 left-0.5 size-5 rounded-full bg-surface shadow-sm transition-transform duration-150"
          }
        />
      </button>
    </label>
  );
}
