import { loc, type Localized } from "./site-locale";
import type { KindId } from "./machines";

export type ActionLeaf = {
  kind: KindId;
  label: Localized;
};

export const TRIO: ActionLeaf[] = [
  { kind: "solid", label: loc("立即下载", "Download now") },
  { kind: "outline", label: loc("了解更多", "Learn more") },
  { kind: "text", label: loc("稍后再说", "Not now") },
];

export const WRONG_BAR: ActionLeaf[] = [
  { kind: "solid", label: loc("立即下载", "Download now") },
  { kind: "solid", label: loc("立即购买", "Buy now") },
];
