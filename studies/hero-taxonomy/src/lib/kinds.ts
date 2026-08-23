import { loc, type Localized } from "./site-locale";
import type { KindId } from "./machines";

export type { KindId };

export type KindMeta = {
  id: KindId;
  index: string;
  name: string;
  zh: Localized;
  oneLiner: Localized;
  scenes: Localized[];
  rules: Localized[];
  spec: Localized;
  note?: Localized;
  tells: Localized;
  window: Localized;
};

export const KINDS: KindMeta[] = [
  {
    id: "product",
    index: "01",
    name: "Product",
    zh: loc("产品介绍", "Product"),
    oneLiner: loc("能解决什么？左价值、右产品、底信任", "What can it solve? Value, product, trust"),
    scenes: [
      loc("协作 SaaS", "A team SaaS"),
      loc("工具官网", "A tools site"),
      loc("B2B 产品", "A B2B product"),
    ],
    rules: [
      loc("先讲清能帮谁解决什么", "Name who it helps and what it solves"),
      loc("左价值主张，右产品形态", "Value on the left, product shape on the right"),
      loc("底部放信任背书；一个主行动", "Trust below; one primary"),
    ],
    spec: loc(
      "为团队协作工具设计首屏。先讲清能帮成长型团队把讨论、任务和决策集中到一个工作空间。左侧价值主张和主按钮，右侧产品界面，底部企业客户背书。不要只放一句空话和两个按钮。",
      "A first fold for a team tool. Say it puts discussion, tasks, and decisions in one workspace. Value and the primary on the left, the product on the right, logos below. Not a slogan and two buttons.",
    ),
    note: loc("产品首屏回答能解决什么，不是登录卡。", "A product fold answers what it solves, not a login card."),
    tells: loc("一眼看出解决什么，产品长什么样", "You see the job and the product shape"),
    window: loc("flowplan.app", "flowplan.app"),
  },
  {
    id: "portfolio",
    index: "02",
    name: "Portfolio",
    zh: loc("个人品牌", "Portfolio"),
    oneLiner: loc("你是谁、做得怎样？杂志 Banner、头像、代表作", "Who are you, and how good? Banner, avatar, work"),
    scenes: [
      loc("设计师主页", "A designer home"),
      loc("摄影师", "A photographer"),
      loc("工作室", "A studio"),
    ],
    rules: [
      loc("先展示定位、代表作和风格", "Lead with position, work, and style"),
      loc("圆形头像 + 杂志风 Banner", "A round avatar on a magazine banner"),
      loc("不要把履历全部堆上去", "Do not dump a CV"),
    ],
    spec: loc(
      "为个人设计师做杂志风首屏：圆形头像，放大代表作 Banner，把「查看作品」放在画面上。先展示你是谁、做得怎样，不要把履历全部堆上去。",
      "A magazine first fold for a designer: round avatar, a large work banner, “View work” on the shot. Show who you are and how good the work is. Do not dump a CV.",
    ),
    note: loc("作品集可以切代表作。电商不能轮播五张海报。", "A portfolio may rotate work. A shop must not rotate five posters."),
    tells: loc("一眼认出人和风格", "You recognize the person and the style"),
    window: loc("sue.design", "sue.design"),
  },
  {
    id: "event",
    index: "03",
    name: "Event",
    zh: loc("活动召唤", "Event"),
    oneLiner: loc("为什么现在参加？主题、时间地点、唯一主行动、席位", "Why now? Theme, when/where, one action, seats"),
    scenes: [
      loc("线下大会", "A conference"),
      loc("工作坊", "A workshop"),
      loc("发布会", "A launch"),
    ],
    rules: [
      loc("先给理由，再召唤行动", "Give a reason, then ask for the action"),
      loc("主题 + 时间地点写清楚", "Theme, date, and place are visible"),
      loc("唯一主行动；显示剩余席位", "One primary; remaining seats"),
    ],
    spec: loc(
      "为线下产品大会设计首屏：突出主题、日期时间地点和参与价值，把立即报名作为唯一主行动，并显示剩余席位。先给理由，再召唤行动。",
      "A conference first fold: theme, date, place, and why it is worth going. Register now is the only primary. Show remaining seats. Reason first, action second.",
    ),
    note: loc("活动只要一个主按钮。两个一样重就没有主行动。", "An event gets one primary. Two equal buttons erase it."),
    tells: loc("主题、时间、席位，一个报名", "Theme, time, seats, one register"),
    window: loc("ai-product-day.com", "ai-product-day.com"),
  },
  {
    id: "commerce",
    index: "04",
    name: "Commerce",
    zh: loc("电商", "Commerce"),
    oneLiner: loc("卖什么、值不值得？一件主推，不要五张海报", "What, and worth it? One product, not five posters"),
    scenes: [
      loc("独立店铺", "An independent shop"),
      loc("当季主推", "A seasonal feature"),
      loc("限量工艺", "A limited craft"),
    ],
    rules: [
      loc("首屏只放一件主推", "The fold holds one featured product"),
      loc("大图 + 价格理由 + 立即购买", "Large shot + price reason + buy now"),
      loc("不要轮播五张海报", "Do not rotate five posters"),
    ],
    spec: loc(
      "为独立家具店设计首屏：只放一件当季主推，左侧大图，右侧写清材质、产地和为什么现在买，唯一主按钮是加入购物车。不要轮播五张海报。",
      "A shop first fold: one seasonal product, a large shot, material and why buy now, Add to cart as the only primary. Do not rotate five posters.",
    ),
    note: loc("电商不能轮播海报。杂志作品集才可以切代表作。", "A shop must not rotate posters. A magazine portfolio may rotate work."),
    tells: loc("一件东西，一个价格，一个买", "One thing, one price, one buy"),
    window: loc("north-atelier.com", "north-atelier.com"),
  },
  {
    id: "media",
    index: "05",
    name: "Media",
    zh: loc("媒体", "Media"),
    oneLiner: loc("发生了什么？头条、摘要、时间来源", "What happened? Headline, dek, time and source"),
    scenes: [
      loc("行业早报", "A trade brief"),
      loc("杂志首页", "A magazine home"),
      loc("日报", "A daily"),
    ],
    rules: [
      loc("首屏就是今天最重要的一条", "The fold is today’s most important story"),
      loc("超大标题 + 两句摘要 + 时间来源", "A large headline, two-line dek, time and source"),
      loc("不要把导航、订阅和广告同时塞进首屏", "Do not pack nav, subscribe, and ads into the fold"),
    ],
    spec: loc(
      "为设计行业早报设计首屏：今天最重要的一条新闻，超大标题、两句摘要、发布时间和来源，旁边放配图。不要把导航、订阅框和广告同时塞进首屏。",
      "A trade-brief first fold: today’s lead story, a large headline, a two-line dek, time and source, a picture beside it. Do not pack nav, subscribe, and ads into the fold.",
    ),
    note: loc("媒体首屏是一条新闻，不是订阅卡。", "A media fold is one story, not a subscribe card."),
    tells: loc("标题先到，来源跟上", "The headline arrives first; source follows"),
    window: loc("type-daily.news", "type-daily.news"),
  },
  {
    id: "education",
    index: "06",
    name: "Education",
    zh: loc("课程", "Education"),
    oneLiner: loc("能学到什么？成果承诺 + 作品切片，不是大纲", "What will I make? Outcome + slices, not a syllabus"),
    scenes: [
      loc("设计课", "A design course"),
      loc("训练营", "A bootcamp"),
      loc("工作坊系列", "A workshop series"),
    ],
    rules: [
      loc("先写结课后能独立完成的作品", "Lead with the work a graduate can finish"),
      loc("成果承诺 + 学员作品墙", "An outcome promise + student work"),
      loc("不是周次大纲列表", "Not a week-by-week syllabus"),
    ],
    spec: loc(
      "为六周产品设计课设计首屏：先写学员结课后能独立完成的作品，而不是课程大纲列表。左侧成果承诺，右侧学员作品切片，主按钮是查看课程大纲，注明下期开课日期。",
      "A six-week product-design first fold: the work a graduate can finish, not a syllabus list. Outcome on the left, student slices on the right, View outline as the primary, next start date on the fold.",
    ),
    note: loc("课程先承诺作品。大纲是下一屏，不是第一眼。", "A course promises the work. The syllabus is the next screen, not the first glance."),
    tells: loc("看见结课作品，而不是目录", "You see the finished work, not a table of contents"),
    window: loc("studio-six.school", "studio-six.school"),
  },
  {
    id: "tool",
    index: "07",
    name: "Tool",
    zh: loc("工具", "Tool"),
    oneLiner: loc("能帮我做什么？一句话能力，当场可试", "What can it do? One line, try it here"),
    scenes: [
      loc("在线处理", "An in-browser tool"),
      loc("转换器", "A converter"),
      loc("生成器", "A generator"),
    ],
    rules: [
      loc("一句话写清能力", "One line names the capability"),
      loc("中间就是可试的工作台", "The fold is a bench you can try"),
      loc("不要先讲公司故事", "Do not lead with a company story"),
    ],
    spec: loc(
      "为在线去背工具设计首屏：中间就是可拖入图片的工作台，上方一行写「三秒去掉背景」，旁边放处理前后对比。主行动是开始使用，不要先讲公司故事。",
      "A cut-out tool first fold: a drop zone in the middle, “Remove a background in three seconds” above it, before/after beside it. Start is the primary. Do not lead with a company story.",
    ),
    note: loc("工具首屏当场可试。不要做成登录墙。", "A tool fold is tryable. Do not make it a login wall."),
    tells: loc("一句话，一块可点的台子", "One line, a bench you can hit"),
    window: loc("cutbg.app", "cutbg.app"),
  },
  {
    id: "community",
    index: "08",
    name: "Community",
    zh: loc("社区", "Community"),
    oneLiner: loc("谁在这里？人与话题，不是产品卖点", "Who is here? People and topics, not a pitch"),
    scenes: [
      loc("独立开发者", "Indie makers"),
      loc("兴趣小组", "A club"),
      loc("同行讨论", "A peer board"),
    ],
    rules: [
      loc("展示此刻正在讨论的真实话题", "Show topics happening now"),
      loc("头像和身份标签看得见", "Avatars and identity labels are visible"),
      loc("不是空洞欢迎语或产品卖点", "Not an empty welcome or a product pitch"),
    ],
    spec: loc(
      "为独立开发者社区设计首屏：展示此刻正在讨论的三个真实话题和头像，而不是空洞的欢迎语。主按钮是加入社区，辅以「本周多少人在线」。",
      "A makers’ community first fold: three live topics and avatars, not an empty welcome. Join is the primary, with how many people are around this week.",
    ),
    note: loc("社区首屏是人和话题。不要写成产品介绍。", "A community fold is people and topics. Do not write it as a product pitch."),
    tells: loc("看见谁在说话，在说什么", "You see who is talking, and about what"),
    window: loc("makers.club", "makers.club"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「高级首屏」，说产品介绍或活动召唤", "Not “a fancy hero” — a product fold, or an event"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("打开这一页的人此刻要确认什么", "What the person who opened this page must confirm"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("第一眼给答案；一个主行动；电商不要五张海报", "The glance answers; one primary; a shop does not rotate posters"),
  },
];
