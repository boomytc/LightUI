export type RefreshPhase = "idle" | "pulling" | "ready" | "refreshing" | "settled";

export type RefreshFormula = {
  id: string;
  title: { zh: string; en: string };
  eyebrow: { zh: string; en: string };
  desc: { zh: string; en: string };
};

export const REFRESH_FORMULAS: RefreshFormula[] = [
  {
    id: "boundary-check",
    title: { zh: "顶边原点接管", en: "Top Boundary Guard" },
    eyebrow: { zh: "scrollTop <= 0", en: "scrollTop <= 0" },
    desc: {
      zh: "仅当容器处于最顶部且手指向下拖动时接管；半腰滚动严禁拦截，保障原生顺畅浏览。",
      en: "Take over only when container is scrolled to top; middle scrolling is never intercepted.",
    },
  },
  {
    id: "damping-curve",
    title: { zh: "物理阻尼衰减", en: "Physical Damping Decay" },
    eyebrow: { zh: "dy × 0.42 阻尼", en: "dy × 0.42 Damping" },
    desc: {
      zh: "位移乘以 0.42 阻尼系数并设置 120px 极限行程，模拟弹簧阻力手感。",
      en: "Scale displacement by 0.42 factor with 120px maximum cap, simulating spring resistance.",
    },
  },
  {
    id: "threshold-commit",
    title: { zh: "临界阈值判定", en: "Threshold Commit & Pin" },
    eyebrow: { zh: "56px 松手提交", en: "56px Release Threshold" },
    desc: {
      zh: "超过 56px 松手吸顶停留并提交请求；未过阈值无感弹回，杜绝误触。",
      en: "Release past 56px pins and triggers refresh; release below snaps back cleanly.",
    },
  },
];
