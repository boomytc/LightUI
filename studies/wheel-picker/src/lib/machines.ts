export const DEFAULT_ITEM_HEIGHT = 40; // px

export type CylinderVisual = {
  offset: number;
  opacity: number;
  rotateXDeg: number;
  scale: number;
  blurPx: number;
  isBaseline: boolean;
};

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function calcItemOffset(index: number, activeIndex: number): number {
  return index - activeIndex;
}

export function calcCylinderVisual(offset: number): CylinderVisual {
  const safeOffset = Number.isFinite(offset) ? offset : 0;
  const abs = Math.abs(safeOffset);
  // Distance-proportional opacity falloff mimicking 3D cylindrical surface
  const opacity = Math.max(0.18, Number((1 - abs / 2.6).toFixed(3)));
  // Cylindrical tangent rotation angle
  const rotateXDeg = Number((-safeOffset * 18).toFixed(1));
  // Perspective contraction
  const scale = Math.max(0.72, Number((1 - abs * 0.08).toFixed(3)));
  // Edge depth defocus
  const blurPx = abs > 1.8 ? Number(((abs - 1.8) * 0.6).toFixed(2)) : 0;
  const isBaseline = abs < 0.4;

  return {
    offset: safeOffset,
    opacity,
    rotateXDeg,
    scale,
    blurPx,
    isBaseline,
  };
}

export type SnapIndexVerdict = {
  index: number;
  snapScrollTop: number;
};

export function resolveScrollIndex(
  scrollTop: number,
  itemHeight: number = DEFAULT_ITEM_HEIGHT,
  count: number = 24,
): SnapIndexVerdict {
  if (!Number.isFinite(scrollTop) || count <= 0 || itemHeight <= 0) {
    return { index: 0, snapScrollTop: 0 };
  }
  const rawIdx = Math.round(scrollTop / itemHeight);
  const clamped = Math.max(0, Math.min(count - 1, rawIdx));
  return {
    index: clamped,
    snapScrollTop: clamped * itemHeight,
  };
}

export function calcTargetScrollTop(index: number, itemHeight: number = DEFAULT_ITEM_HEIGHT): number {
  if (!Number.isFinite(index) || itemHeight <= 0) return 0;
  return Math.max(0, Math.round(index * itemHeight));
}

export function formatTimeString(hour: number, minute: number): string {
  return `${pad2(hour)}:${pad2(minute)}`;
}

export type ControlComparison = {
  name: string;
  nameEn: string;
  keyboardSpam: boolean;
  validationRisk: string;
  touchFriction: string;
  baselineAffordance: string;
};

export const WHEEL_COMPARISONS: ControlComparison[] = [
  {
    name: "滚轮选择器 (Wheel Picker)",
    nameEn: "Wheel Picker",
    keyboardSpam: false,
    validationRisk: "零非法值，刻度由状态约束",
    touchFriction: "单手大拇指连续上下拨动，带阻尼与触觉对齐",
    baselineAffordance: "中央基准线对齐，景深提示层级与相邻候选",
  },
  {
    name: "文本输入框 (Text Input)",
    nameEn: "Text Input",
    keyboardSpam: true,
    validationRisk: "极高（用户可能输入 '25:99' 或特殊字符）",
    touchFriction: "弹起全屏软键盘，遮挡下半屏幕内容",
    baselineAffordance: "无直观上下关联，必须逐字敲入并解析格式",
  },
  {
    name: "平铺下拉列表 (Flat Select)",
    nameEn: "Flat 60-item Select",
    keyboardSpam: false,
    validationRisk: "低，但面板过长",
    touchFriction: "60 个分钟选项占满屏幕，滚动翻页极易滑过目标",
    baselineAffordance: "平铺展示缺乏物理景深，难以感知所处时间比例",
  },
];
