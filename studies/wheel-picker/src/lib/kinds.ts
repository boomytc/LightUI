import { loc } from "./site-locale";

export const FORMULA = {
  name: loc("滚轮选择器 (Wheel Picker)", "Wheel Picker"),
  gesture: loc("上下拨动 (Vertical Flick / Drag)", "Vertical Flick / Drag"),
  result: loc("中间基准线对齐，景深渐变选中 (Align on Center Baseline with Depth)", "Center Baseline Snap with Depth"),
  prompt: loc(
    "时间用双列滚轮选择，中间一行表示选中，松手后数字自动对齐，远离中心产生景深透明度渐变。",
    "Use dual-column wheel picker for time. Center line indicates selection, snapping on release with cylindrical depth fading.",
  ),
};
