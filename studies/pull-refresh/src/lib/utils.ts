export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export type NewsItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  fresh?: boolean;
};

export const INITIAL_NEWS: NewsItem[] = [
  {
    id: "n1",
    title: "LightUI 3.0 设计规范发布",
    body: "重新定义跨端与微交互判定模型，强化状态机消歧与安全边界。",
    time: "10:15",
  },
  {
    id: "n2",
    title: "触控手势物理阻尼解析",
    body: "通过弹簧衰减与临界阈值避免列表误触发，提升单手操作稳定性。",
    time: "09:40",
  },
  {
    id: "n3",
    title: "乐观更新在海量数据流中的实践",
    body: "结合快照与自增 Token 序列，实现毫秒级即时操作反馈与幂等回滚。",
    time: "08:20",
  },
];

export const FRESH_NEWS_ITEM: NewsItem = {
  id: "n0",
  title: "实时资讯：跨端控件决策指南更新",
  body: "新增移动端长按消歧与下拉刷新阻尼物理模型，现已同步至知识库。",
  time: "刚刚",
  fresh: true,
};
