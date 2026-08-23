import { useState } from "react";
import { ROOMS, type RoomId } from "../lib/fixtures";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Window } from "./Frame";

export function ImageDemo({ defaultTab }: { defaultTab?: string } = {}) {
  const locale = useLocale();
  const allowed = new Set(ROOMS.map((r) => r.id));
  const initial = (defaultTab && allowed.has(defaultTab as RoomId) ? defaultTab : "living") as RoomId;
  const [tab, setTab] = useState<RoomId>(initial);
  const room = ROOMS.find((r) => r.id === tab) ?? ROOMS[0];
  const index = ROOMS.findIndex((r) => r.id === tab) + 1;

  return (
    <Window title={locale === "en" ? "Mori Studio · case" : "Mori Studio · 项目案例"} dark>
      <div className="relative min-h-[320px]">
        <div className="tab-swap" key={tab}>
          <RoomArt id={room.id} tone={room.tone} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/20" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
          <div>
            <p className="text-[11px] text-white/55">
              {locale === "en" ? "Residence / Shanghai · 128㎡" : "住宅设计 / 上海 · 128㎡"}
            </p>
            <h3 className="mt-2 font-serif text-[1.6rem] leading-tight tracking-tight">{pick(room.title, locale)}</h3>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-white/45">{pick(room.kicker, locale)}</p>
            <p className="mt-3 text-[13px] text-white/80">{pick(room.caption, locale)}</p>
            <p className="mt-1 text-[12px] text-white/45">{pick(room.meta, locale)}</p>
          </div>
          <p className="text-[12px] tabular-nums text-white/45">0{index} / 04</p>
        </div>
        <div
          role="tablist"
          aria-label={locale === "en" ? "Rooms" : "空间"}
          className="absolute inset-x-0 bottom-0 grid grid-cols-4 gap-2 p-3"
        >
          {ROOMS.map((item) => {
            const on = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setTab(item.id)}
                className={cn(
                  "relative overflow-hidden rounded-lg text-left transition-transform duration-200",
                  on ? "-translate-y-1 ring-2 ring-white" : "opacity-80 hover:opacity-100",
                )}
              >
                <div className="h-16">
                  <RoomArt id={item.id} tone={item.tone} compact />
                </div>
                <span className="absolute inset-x-0 bottom-0 bg-black/45 px-2 py-1 text-[10px] uppercase tracking-wide text-white">
                  {pick(item.kicker, locale)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Window>
  );
}

function RoomArt({ id, tone, compact = false }: { id: RoomId; tone: string; compact?: boolean }) {
  return (
    <svg
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      className={compact ? "size-full" : "h-[320px] w-full"}
      aria-hidden="true"
    >
      <rect width="320" height="180" fill={tone} />
      <rect width="320" height="180" fill={`url(#shade-${id}-${compact ? "c" : "h"})`} />
      {id === "living" ? <Living /> : null}
      {id === "kitchen" ? <Kitchen /> : null}
      {id === "study" ? <Study /> : null}
      {id === "bedroom" ? <Bedroom /> : null}
      <defs>
        <linearGradient id={`shade-${id}-${compact ? "c" : "h"}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.18" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.12" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Living() {
  return (
    <g fill="none" stroke="#1a1410" strokeOpacity="0.35" strokeWidth="1.4">
      <rect x="36" y="78" width="110" height="42" rx="4" fill="#efe4d2" />
      <rect x="48" y="58" width="86" height="28" rx="3" fill="#d9c4a4" />
      <rect x="200" y="40" width="84" height="90" rx="2" fill="#f2ebe0" />
      <circle cx="92" cy="48" r="10" fill="#f7f1e6" />
    </g>
  );
}

function Kitchen() {
  return (
    <g fill="none" stroke="#1a1410" strokeOpacity="0.3" strokeWidth="1.4">
      <rect x="24" y="96" width="272" height="36" fill="#d7d2c6" />
      <rect x="40" y="70" width="70" height="26" fill="#c5b9a6" />
      <rect x="210" y="54" width="80" height="42" fill="#e8e2d4" />
      <rect x="130" y="88" width="60" height="8" fill="#9aa090" />
    </g>
  );
}

function Study() {
  return (
    <g fill="none" stroke="#1a1410" strokeOpacity="0.3" strokeWidth="1.2">
      <rect x="28" y="36" width="90" height="108" fill="#d5dbe2" />
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x={36} y={44 + i * 18} width="74" height="12" fill="#c3ced8" />
      ))}
      <rect x="150" y="92" width="140" height="10" fill="#cfd6dd" />
      <rect x="168" y="70" width="48" height="22" fill="#e7edf2" />
    </g>
  );
}

function Bedroom() {
  return (
    <g fill="none" stroke="#1a1410" strokeOpacity="0.28" strokeWidth="1.3">
      <rect x="48" y="96" width="180" height="36" rx="8" fill="#ead9d2" />
      <rect x="64" y="78" width="148" height="22" rx="6" fill="#f3e6e0" />
      <rect x="230" y="36" width="54" height="100" fill="#dcc8c2" />
      <circle cx="86" cy="64" r="8" fill="#f7eee8" />
    </g>
  );
}
