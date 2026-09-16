import type { Customer, FilterId, FollowUp, KindId } from "./machines";
import { loc, type Localized } from "./site-locale";

export const SEARCH_MISS = "张晓";

export const FILTERS: { id: FilterId; label: Localized }[] = [
  { id: "shanghai", label: loc("上海", "Shanghai") },
  { id: "beijing", label: loc("北京", "Beijing") },
  { id: "this-week", label: loc("本周新增", "Added this week") },
  { id: "follow", label: loc("待跟进", "To follow") },
  { id: "contacted", label: loc("已联系", "Contacted") },
  { id: "closed", label: loc("已成交", "Closed") },
];

export const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: "c-linyue",
    name: "林悦",
    phone: "13812340001",
    city: "shanghai",
    company: "林悦工作室",
    status: "follow",
    thisWeek: true,
  },
  {
    id: "c-zhoulan",
    name: "周岚",
    phone: "13812340002",
    city: "shanghai",
    company: "岚造设计",
    status: "contacted",
    thisWeek: true,
  },
  {
    id: "c-chenchen",
    name: "陈晨",
    phone: "13700008888",
    city: "beijing",
    company: "晨启咨询",
    status: "closed",
    thisWeek: false,
  },
  {
    id: "c-zhangxiaoyu",
    name: "张小雨",
    phone: "13900001111",
    city: "hangzhou",
    company: "星禾设计",
    status: "follow",
    thisWeek: true,
  },
  {
    id: "c-zhangxiaoning",
    name: "张小宁",
    phone: "13900002222",
    city: "hangzhou",
    company: "向禾咨询",
    status: "contacted",
    thisWeek: true,
  },
];

export const SAMPLE_FOLLOWUPS: FollowUp[] = [
  {
    id: "f-history",
    customerId: "c-zhoulan",
    titleZh: "回访周岚报价进度",
    titleEn: "Follow up Zhou Lan’s quote",
    done: true,
  },
  {
    id: "f-linyue",
    customerId: "c-linyue",
    titleZh: "联系林悦确认方案",
    titleEn: "Confirm Lin Yue’s plan",
    done: false,
  },
];

export const STATUS_LABEL: Record<Customer["status"], Localized> = {
  follow: loc("待跟进", "To follow"),
  contacted: loc("已联系", "Contacted"),
  closed: loc("已成交", "Closed"),
};

export function sceneCustomers(kind: KindId): Customer[] {
  if (kind === "first-use") return [];
  return SAMPLE_CUSTOMERS.map((item) => ({ ...item }));
}

export function sceneFollowUps(kind: KindId): FollowUp[] {
  if (kind === "first-use") return [];
  if (kind === "done") {
    return SAMPLE_FOLLOWUPS.map((item) => ({ ...item, done: true }));
  }
  return SAMPLE_FOLLOWUPS.map((item) => ({ ...item }));
}

export function sceneQuery(kind: KindId): string {
  return kind === "search" ? SEARCH_MISS : "";
}

export function sceneFilters(kind: KindId): FilterId[] {
  return kind === "filter" ? ["shanghai", "this-week", "closed"] : [];
}

export function metaLine(customer: Customer, locale: "zh" | "en"): string {
  const status = STATUS_LABEL[customer.status][locale];
  return customer.company ? `${customer.company} · ${status}` : status;
}
