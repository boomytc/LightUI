import { type ReactNode } from "react";

export function DeviceFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto flex w-full justify-center sm:py-6 ${className}`}>
      {/* 桌面端呈现拟真边框，手机原生端彻底平铺解包 */}
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-bg sm:h-[820px] sm:max-h-[85vh] sm:max-w-[393px] sm:rounded-[48px] sm:border-[8px] sm:border-border-strong sm:bg-surface sm:shadow-2xl">
        {/* 顶部灵动岛：仅桌面端展示，手机端隐藏 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-3 z-30 hidden h-6 w-28 -translate-x-1/2 rounded-full bg-black transition-transform duration-200 sm:block"
        />

        {/* 内屏视口容器 */}
        <div className="device-frame-viewport relative flex-1 h-full w-full overflow-y-auto overflow-x-hidden bg-bg sm:rounded-[40px]">
          {children}
        </div>

        {/* 底部 Home 横条：仅桌面端展示，手机端隐藏 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1.5 left-1/2 z-30 hidden h-1 w-32 -translate-x-1/2 rounded-full bg-fg/25 sm:block"
        />
      </div>
    </div>
  );
}
