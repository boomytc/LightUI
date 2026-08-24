import { useState } from "react";
import { ArrowRight, Compass, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "./Link";
import type { Locale } from "../lib/prefs";

type DemoKey = "triangle" | "beam" | "weights";

export function HomeShowcase({ locale }: { locale: Locale }) {
  const [activeTab, setActiveTab] = useState<DemoKey>("triangle");

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-5 shadow-card transition-all duration-300 sm:p-6">
      {/* Header with mini tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-fg">
          <Sparkles className="size-3.5 text-accent" />
          <span>{locale === "en" ? "Interactive Lab Sampler" : "精选交互体验"}</span>
        </div>

        <div className="flex rounded-lg border border-border bg-surface-2 p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab("triangle")}
            className={
              activeTab === "triangle"
                ? "rounded-md bg-fg px-2.5 py-1 text-[11px] font-medium text-surface shadow-xs"
                : "rounded-md px-2.5 py-1 text-[11px] font-medium text-fg-muted hover:text-fg"
            }
          >
            {locale === "en" ? "Triangle" : "安全三角"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("beam")}
            className={
              activeTab === "beam"
                ? "rounded-md bg-fg px-2.5 py-1 text-[11px] font-medium text-surface shadow-xs"
                : "rounded-md px-2.5 py-1 text-[11px] font-medium text-fg-muted hover:text-fg"
            }
          >
            {locale === "en" ? "Beam" : "边光"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("weights")}
            className={
              activeTab === "weights"
                ? "rounded-md bg-fg px-2.5 py-1 text-[11px] font-medium text-surface shadow-xs"
                : "rounded-md px-2.5 py-1 text-[11px] font-medium text-fg-muted hover:text-fg"
            }
          >
            {locale === "en" ? "Weights" : "按钮重量"}
          </button>
        </div>
      </div>

      {/* Interactive stage area */}
      <div className="mt-4 flex min-h-[170px] items-center justify-center rounded-2xl border border-border/80 bg-bg p-4">
        {activeTab === "triangle" && <TriangleMiniDemo locale={locale} />}
        {activeTab === "beam" && <BeamMiniDemo locale={locale} />}
        {activeTab === "weights" && <WeightsMiniDemo locale={locale} />}
      </div>

      {/* Footer link to full study */}
      <div className="mt-4 flex items-center justify-between text-[12px]">
        <span className="text-fg-subtle">
          {activeTab === "triangle" && (locale === "en" ? "Slope corridor protection" : "斜向穿越走廊保护")}
          {activeTab === "beam" && (locale === "en" ? "Border perimeter ray tracer" : "沿外沿圆角光束绕行")}
          {activeTab === "weights" && (locale === "en" ? "One primary solid per region" : "一区只放一个面状主操作")}
        </span>
        <Link
          href={
            activeTab === "triangle"
              ? "/s/intent-cascade"
              : activeTab === "beam"
                ? "/s/border-beam"
                : "/s/button-taxonomy"
          }
          className="inline-flex items-center gap-1 font-medium text-accent no-underline hover:underline"
        >
          {locale === "en" ? "Full study" : "查看完整研究"}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

function TriangleMiniDemo({ locale }: { locale: Locale }) {
  const [activeItem, setActiveItem] = useState(0);
  const [subOpen, setSubOpen] = useState(true);

  const items = [
    { id: 0, label: locale === "en" ? "Preferences" : "偏好设置", sub: ["General", "Appearance", "Shortcuts"] },
    { id: 1, label: locale === "en" ? "Extensions" : "扩展插件", sub: ["Installed", "Market", "Updates"] },
    { id: 2, label: locale === "en" ? "Profiles" : "账户配置", sub: ["Personal", "Work"] },
  ];

  return (
    <div className="flex w-full max-w-sm items-start gap-2 select-none text-[12px]">
      <div className="flex-1 rounded-xl border border-border bg-surface p-1.5 shadow-sm">
        {items.map((item) => (
          <div
            key={item.id}
            onMouseEnter={() => {
              setActiveItem(item.id);
              setSubOpen(true);
            }}
            className={
              activeItem === item.id && subOpen
                ? "flex items-center justify-between rounded-lg bg-accent px-2.5 py-1.5 font-medium text-white"
                : "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-fg-muted hover:bg-surface-2 hover:text-fg"
            }
          >
            <span>{item.label}</span>
            <span className="text-[10px] opacity-70">›</span>
          </div>
        ))}
      </div>

      <div className="flex-1 rounded-xl border border-border bg-surface p-1.5 shadow-sm">
        <div className="px-2 py-1 text-[10px] font-mono text-fg-subtle">
          {locale === "en" ? "Protected level 2" : "受保护二级项"}
        </div>
        {items[activeItem]?.sub.map((sub, i) => (
          <div
            key={i}
            className="rounded-lg px-2.5 py-1.5 text-fg hover:bg-accent-soft hover:text-accent transition-colors"
          >
            {sub}
          </div>
        ))}
      </div>
    </div>
  );
}

function BeamMiniDemo({ locale }: { locale: Locale }) {
  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface px-6 py-5 text-center shadow-card">
        {/* Animated border glow overlay */}
        <div
          className="pointer-events-none absolute -inset-[100%] animate-[spin_4s_linear_infinite] opacity-60"
          style={{
            background: "conic-gradient(from 0deg, transparent 0 340deg, var(--color-accent) 360deg)",
          }}
        />
        <div className="absolute inset-[1px] rounded-[15px] bg-surface" />
        <div className="relative z-10">
          <div className="mx-auto grid size-8 place-items-center rounded-lg bg-accent-soft text-accent">
            <Compass className="size-4 animate-pulse" />
          </div>
          <p className="mt-2 text-[13px] font-semibold text-fg">
            {locale === "en" ? "Orbiting Beam" : "圆角高光绕行"}
          </p>
          <p className="mt-0.5 text-[11px] text-fg-muted">
            {locale === "en" ? "Pure border traversal" : "强调色光束贴着边框走"}
          </p>
        </div>
      </div>
    </div>
  );
}

function WeightsMiniDemo({ locale }: { locale: Locale }) {
  const [clicked, setClicked] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setClicked("solid")}
          className="rounded-lg bg-fg px-3.5 py-1.5 text-[12px] font-medium text-surface shadow-sm transition-transform active:scale-95"
        >
          {locale === "en" ? "Solid (Primary)" : "面状 (主操作)"}
        </button>
        <button
          type="button"
          onClick={() => setClicked("outline")}
          className="rounded-lg border border-border bg-surface px-3.5 py-1.5 text-[12px] font-medium text-fg shadow-sm transition-colors hover:bg-surface-2 active:scale-95"
        >
          {locale === "en" ? "Outline" : "线状 (次)"}
        </button>
        <button
          type="button"
          onClick={() => setClicked("text")}
          className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-fg-muted hover:text-fg active:scale-95"
        >
          {locale === "en" ? "Text" : "文字 (弱)"}
        </button>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-fg-muted">
        <ShieldCheck className="size-3.5 text-intent" />
        <span>
          {clicked
            ? locale === "en"
              ? `Selected weight: ${clicked}`
              : `已触发操作重量：${clicked}`
            : locale === "en"
              ? "Click buttons to feel the visual hierarchy"
              : "点击按钮体验视觉重量层级"}
        </span>
      </p>
    </div>
  );
}
