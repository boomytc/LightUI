import { loc, type Localized } from "./site-locale";
import type { Member } from "./machines";

export const CITIES: { id: string; label: Localized }[] = [
  { id: "beijing", label: loc("北京", "Beijing") },
  { id: "shanghai", label: loc("上海", "Shanghai") },
  { id: "guangzhou", label: loc("广州", "Guangzhou") },
  { id: "shenzhen", label: loc("深圳", "Shenzhen") },
  { id: "hangzhou", label: loc("杭州", "Hangzhou") },
  { id: "chengdu", label: loc("成都", "Chengdu") },
  { id: "hongkong", label: loc("香港", "Hong Kong") },
];

export const MEMBERS: Member[] = [
  { id: "sue", name: "Sue", email: "sue@studio.co" },
  { id: "susan", name: "Susan", email: "susan@example.com" },
  { id: "sam", name: "Sam", email: "sam@studio.co" },
  { id: "sarah", name: "Sarah", email: "sarah@example.com" },
  { id: "lin", name: "Lin Xiao", email: "linxiao@example.com" },
  { id: "zhang", name: "Zhang Wei", email: "zhangwei@example.com" },
];

export const SHIPPING: { id: string; title: Localized; hint: Localized }[] = [
  {
    id: "standard",
    title: loc("普通配送", "Standard"),
    hint: loc("3–5 天送达", "3–5 days"),
  },
  {
    id: "express",
    title: loc("次日达", "Next day"),
    hint: loc("明天送达", "Arrives tomorrow"),
  },
  {
    id: "pickup",
    title: loc("到店自取", "Pickup"),
    hint: loc("无需配送", "No delivery"),
  },
];

export const INTERESTS: { id: string; label: Localized }[] = [
  { id: "design", label: loc("设计", "Design") },
  { id: "write", label: loc("写作", "Writing") },
  { id: "focus", label: loc("效率", "Focus") },
  { id: "code", label: loc("编程", "Code") },
];

export const INTEREST_MAX = 3;
