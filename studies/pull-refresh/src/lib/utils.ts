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
  {
    id: "n4",
    title: "顶边判决：半腰为何不能刷新",
    body: "列表不在原点时，向下拉是回看上一屏，不是请求最新前缀。",
    time: "07:55",
  },
  {
    id: "n5",
    title: "阈值不是进度条",
    body: "56px 只回答「松手交不交卷」，不回答「工作做完了几成」。",
    time: "07:10",
  },
  {
    id: "n6",
    title: "桌面指针下的下拉刷新",
    body: "鼠标能演示阻尼，却不该当成桌面资讯页的默认入口。",
    time: "昨天",
  },
  {
    id: "n7",
    title: "吸顶与复位是两种松手",
    body: "过线停在阈值高度等数据；未过线直接回到 0，两者不要共用同一段动画语义。",
    time: "昨天",
  },
  {
    id: "n8",
    title: "底部追加不是顶部刷新",
    body: "末尾延长可视范围，和顶端拉取最新前缀，是两条相反的时间轴。",
    time: "周一",
  },
];

export const FRESH_NEWS_ITEM: NewsItem = {
  id: "n0",
  title: "实时资讯：跨端控件决策指南更新",
  body: "新增移动端长按消歧与下拉刷新阻尼物理模型，现已同步至知识库。",
  time: "刚刚",
  fresh: true,
};
