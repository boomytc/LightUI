export type RefreshPhase = "idle" | "pulling" | "ready" | "refreshing" | "settled";

export type RefreshFormula = {
  id: string;
  title: { zh: string; en: string };
  eyebrow: { zh: string; en: string };
  figure: { zh: string; en: string };
  desc: { zh: string; en: string };
};

export const PHASE_COPY: Record<
  RefreshPhase,
  { label: { zh: string; en: string }; hint: { zh: string; en: string } }
> = {
  idle: {
    label: { zh: "闲置", en: "Idle" },
    hint: { zh: "未接管，列表可滚", en: "Native scroll, no takeover" },
  },
  pulling: {
    label: { zh: "阻尼下拉", en: "Pulling" },
    hint: { zh: "未过阈值，松手复位", en: "Below threshold — will snap back" },
  },
  ready: {
    label: { zh: "阈值达标", en: "Ready" },
    hint: { zh: "松手即提交刷新", en: "Release to commit refresh" },
  },
  refreshing: {
    label: { zh: "刷新中", en: "Refreshing" },
    hint: { zh: "吸顶 56px，请求进行中", en: "Pinned at 56px while fetching" },
  },
  settled: {
    label: { zh: "完成收起", en: "Settled" },
    hint: { zh: "横条提示后收回", en: "Banner, then collapse" },
  },
};

export const REFRESH_FORMULAS: RefreshFormula[] = [
  {
    id: "boundary-check",
    title: { zh: "顶边且向下才接管", en: "Top edge and down only" },
    eyebrow: { zh: "接管条件", en: "Takeover" },
    figure: { zh: "scrollTop ≤ 0", en: "scrollTop ≤ 0" },
    desc: {
      zh: "半腰滚动绝不拦截。只有停在顶边、并且继续向下，才从原生滚动手里把指针接过来。",
      en: "Never intercept mid-list. Take over only when parked at the top and still moving down.",
    },
  },
  {
    id: "damping-curve",
    title: { zh: "位移阻尼，并设上限", en: "Damped travel, then a cap" },
    eyebrow: { zh: "手感", en: "Feel" },
    figure: { zh: "y = min(120, dy × 0.42)", en: "y = min(120, dy × 0.42)" },
    desc: {
      zh: "手指走得远，列表只跟 42%。拉到 120px 就顶住，弹簧越来越沉，而不是 1:1 硬拽。",
      en: "The list follows 42% of finger travel and stops at 120px — resistance, not a 1:1 yank.",
    },
  },
  {
    id: "threshold-commit",
    title: { zh: "松手过阈值才刷新", en: "Release past threshold commits" },
    eyebrow: { zh: "提交", en: "Commit" },
    figure: { zh: "≥ 56px", en: "≥ 56px" },
    desc: {
      zh: "过线松手：弹回并吸顶在 56px，开始请求。未过线：弹性复位到 0，不发请求。",
      en: "Past 56px, pin and fetch. Below it, spring back to 0 with no request.",
    },
  },
];
