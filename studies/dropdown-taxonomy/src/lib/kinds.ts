import { loc, type Localized } from "./site-locale";

export type KindId =
  | "select"
  | "multi"
  | "grouped"
  | "cascader"
  | "split"
  | "mega"
  | "date";

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
  commits: Localized;
};

export const KINDS: KindMeta[] = [
  {
    id: "select",
    index: "01",
    name: "Select",
    zh: loc("单选下拉", "Single select"),
    oneLiner: loc("固定选项里只选一个", "One value from a fixed list"),
    scenes: [
      loc("订单状态", "Order status"),
      loc("用户角色", "User role"),
      loc("内容分类", "Content type"),
      loc("语言选择", "Language"),
    ],
    rules: [
      loc("只能选一个", "One value only"),
      loc("选项固定", "Options are fixed"),
      loc("选中后关闭列表", "Close on pick"),
    ],
    spec: loc(
      "做一个订单状态 Select，提供「待处理、进行中、已完成」三个固定选项，只能选择一个。",
      "A status Select with three fixed options — Pending, In progress, Done — and only one can be chosen.",
    ),
    commits: loc("一个扁平值，点中即关", "One flat value; closes on pick"),
  },
  {
    id: "multi",
    index: "02",
    name: "Multi-select",
    zh: loc("多选下拉", "Multi-select"),
    oneLiner: loc("选多个，选中后显示成标签", "Many values, shown as chips"),
    scenes: [
      loc("项目成员", "Project members"),
      loc("技能标签", "Skill tags"),
      loc("兴趣偏好", "Interests"),
      loc("多条件筛选", "Faceted filters"),
    ],
    rules: [
      loc("支持多选", "Multiple values"),
      loc("以标签展示", "Shown as chips"),
      loc("可单独删除或一键清空", "Remove one, or clear all"),
      loc("最多 5 项", "Cap at 5"),
    ],
    spec: loc(
      "做一个技能 Multi-select，支持多选，选中后以标签展示，并且可以单独删除或一键清空。",
      "A skills Multi-select: stay open, show chips, peel one off or clear all.",
    ),
    commits: loc("一个集合；面板保持开着", "A set; the panel stays open"),
  },
  {
    id: "grouped",
    index: "03",
    name: "Grouped Select",
    zh: loc("分组下拉", "Grouped select"),
    oneLiner: loc("选项很多，按类别整理，没有上下级", "Many options, filed by group — not a tree"),
    scenes: [
      loc("按部门分成员", "People by team"),
      loc("按产品线分功能", "Features by product line"),
      loc("按类型分内容", "Content by type"),
      loc("按地区分门店", "Stores by region"),
    ],
    rules: [
      loc("分组只是整理选项", "Groups only file options"),
      loc("没有上下级关系", "No parent–child"),
      loc("最终选一名成员", "The value is one member"),
    ],
    spec: loc(
      "做一个 Grouped Select，将成员按照设计、产品、研发团队分组展示，最终选择一名成员。",
      "A Grouped Select of members filed under Design, Product, and Engineering. The value is one person.",
    ),
    note: loc("Grouped Select 是分类，Cascader 才是上下级。", "Grouped is filing. Cascader is parent–child."),
    commits: loc("一个值；分组标题不是路径", "One value; a group title is not a path"),
  },
  {
    id: "cascader",
    index: "04",
    name: "Cascader",
    zh: loc("级联选择器", "Cascader"),
    oneLiner: loc("有上下级，一层一层选", "Parent–child. Pick a level at a time"),
    scenes: [
      loc("省—市—区", "Province — city — district"),
      loc("商品多级类目", "Product taxonomy"),
      loc("公司—部门—团队", "Company — dept — team"),
      loc("课程—章节—小节", "Course — chapter — lesson"),
    ],
    rules: [
      loc("按「省-市-区」逐级展开", "Expand province → city → district"),
      loc("必须选到最后一级", "Must reach a leaf"),
      loc("选中后显示完整路径", "Show the full path"),
    ],
    spec: loc(
      "做一个三级 Cascader，按照「省-市-区」逐级展开，选中后显示完整路径。",
      "A three-level Cascader: province → city → district. Commit only at the leaf, then show the path.",
    ),
    note: loc("Grouped Select 是分类，Cascader 才是上下级。", "Grouped is filing. Cascader is parent–child."),
    commits: loc("一条到叶子的路径", "A path that ends on a leaf"),
  },
  {
    id: "split",
    index: "05",
    name: "Split Button",
    zh: loc("分割按钮", "Split button"),
    oneLiner: loc("主体做默认操作，箭头展开低频操作", "Body fires the default; chevron is overflow"),
    scenes: [
      loc("发布 + 定时发布", "Publish + schedule"),
      loc("下载 + 选择格式", "Download + format"),
      loc("保存 + 另存为", "Save + save as"),
      loc("新建 + 从模板创建", "New + from template"),
    ],
    rules: [
      loc("点击主体立即执行默认操作", "The body fires immediately"),
      loc("右侧箭头展开次要操作", "The chevron opens secondary actions"),
      loc("主体必须能直接执行", "The default must be reachable without a menu"),
    ],
    spec: loc(
      "做一个 Split Button，点击「发布」直接发布，点击右侧箭头展开「定时发布」和「保存草稿」。",
      "A Split Button: Publish fires now. The chevron opens Schedule and Save draft.",
    ),
    commits: loc("一次动作；默认不经过菜单", "An action; the default skips the menu"),
  },
  {
    id: "mega",
    index: "06",
    name: "Mega Menu",
    zh: loc("巨型导航", "Mega menu"),
    oneLiner: loc("内容多、分类复杂的多列导航", "Multi-column nav when the taxonomy is wide"),
    scenes: [
      loc("SaaS 产品官网", "SaaS marketing site"),
      loc("电商分类导航", "Commerce catalog nav"),
      loc("教育课程平台", "Course platform"),
      loc("企业服务网站", "Enterprise site"),
      loc("内容资源中心", "Resource center"),
    ],
    rules: [
      loc("少量链接用普通下拉", "A short list stays a plain menu"),
      loc("复杂分类才用 Mega Menu", "Use mega only when the taxonomy is wide"),
      loc("多列：分类 + 名称 + 简介", "Columns: group + name + blurb"),
    ],
    spec: loc(
      "为顶部「产品」导航制作 Mega Menu，分成多列，每列包含分类、产品名称、图标和简介。",
      "A Product mega menu in several columns, each with a group, names, icons, and blurbs.",
    ),
    commits: loc("一次导航，不是表单值", "A navigation hop, not a field value"),
  },
  {
    id: "date",
    index: "07",
    name: "Date Picker",
    zh: loc("日期选择器", "Date picker"),
    oneLiner: loc("选择日期、时间或日期范围", "A day, a time, or a span of days"),
    scenes: [
      loc("选择生日", "Birthday"),
      loc("预约日期", "Appointment"),
      loc("酒店入住与离店", "Hotel stay"),
      loc("数据日期范围", "Report range"),
      loc("会议时间", "Meeting time"),
      loc("任务截止日期", "Due date"),
    ],
    rules: [
      loc("选择入住和离店日期", "Pick check-in, then check-out"),
      loc("过去日期不可选", "Past days are locked"),
      loc("显示住宿天数", "Show the night count"),
    ],
    spec: loc(
      "做一个日期范围 Date Picker，用于选择入住和离店日期，过去日期不可选，并显示住宿天数。",
      "A stay Date Picker: check-in then check-out, past days locked, nights counted.",
    ),
    commits: loc("两端日期；晚数是日历日差", "Two ends; nights are calendar days"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「下拉框」，说 Select 单选下拉", "Not “a dropdown” — a Select"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("订单状态选一个，固定三个选项", "One order status, three fixed options"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("单选、可搜索、过去的日期禁选", "Single, searchable, past days locked"),
  },
];
