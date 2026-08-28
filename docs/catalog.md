# Study Catalog

Generated from `studies/*/study.json`. Edit the JSON, then run `make catalog`.

The lab at `products/lab` discovers the same files with `import.meta.glob`.
Do not keep a second registry.

| Slug | Idea | Status | Created | Updated |
| --- | --- | --- | --- | --- |
| [optimistic-rollback](../studies/optimistic-rollback/) | 点完这一击，界面是等网络回执还是立即改？成功是默认路径，UI 先行响应；若网络失败，根据快照原位回滚并说明原因；不可逆高风险操作禁止乐观更新。 | active | 2026-08-28 | 2026-08-28 |
| [press-select](../studies/press-select/) | 列表中这一按，是直接打开还是激活批量选择？单击默认打开；按住超 480ms 且位移在容差内激活选择模式；滑动则立即注销长按转为滚动。 | active | 2026-08-28 | 2026-08-28 |
| [pull-refresh](../studies/pull-refresh/) | 下拉手势何时接管滚动、何时提交刷新？顶边且向下才接管；位移应用阻尼并设上限；松手超阈值才提交刷新，未达阈值弹性复位。 | active | 2026-08-28 | 2026-08-28 |
| [fill-taxonomy](../studies/fill-taxonomy/) | 「做个表单」只说了有格子。先定填写前、填写中、提交后这一栏该交代什么：标签常在、必填先标、错在栏下能改、成功带下一步。 | active | 2026-08-26 | 2026-08-26 |
| [bm25-explain](../studies/bm25-explain/) | 检索排序不是黑盒总分。先定稀疏与向量的分数不可直接相加，再把得分拆解为词频饱和与篇幅惩罚。 | active | 2026-08-25 | 2026-08-25 |
| [chart-read](../studies/chart-read/) | 图画好之后，这一手是读数、过滤还是改窗口。选图种是另一问；看板层递也是另一问。 | active | 2026-08-25 | 2026-08-25 |
| [container-morph](../studies/container-morph/) | 同一入口连续变形。先定改宽、高、圆角还是排版；停在展开态，或沿原路收回——内容先走，容器后收。 | active | 2026-08-25 | 2026-08-25 |
| [drag-commit](../studies/drag-commit/) | 同一抓取手势，松手提交的不是同一种结果。先定是新顺序、一次接收、跨组转移，还是无效回弹。 | active | 2026-08-25 | 2026-08-25 |
| [expand-inflow](../studies/expand-inflow/) | 多出来的内容先问撑开文档流还是盖一层。互斥还是独立，是流里的第二问。不要把抽屉再做一遍。 | active | 2026-08-25 | 2026-08-25 |
| [guide-interrupt](../studies/guide-interrupt/) | 教学不是弹窗，也不是一条提示。先定何时出现、钉在谁身上、靠什么推进、结束后还挡不挡。 | active | 2026-08-25 | 2026-08-25 |
| [nav-taxonomy](../studies/nav-taxonomy/) | 一排链接只说了有入口。先定住在哪、怎么开、滚的时候干什么。 | active | 2026-08-15 | 2026-08-25 |
| [overlay-taxonomy](../studies/overlay-taxonomy/) | 浮在页面上只是外观。先定打不打断当前任务，以及是否贴着触发点。 | active | 2026-08-23 | 2026-08-25 |
| [page-append](../studies/page-append/) | 一批记录先问整页替换还是末尾追加。翻页会丢掉上一页并回到顶部；追加只增加 visibleCount，旧节点不卸。 | active | 2026-08-25 | 2026-08-25 |
| [pending-taxonomy](../studies/pending-taxonomy/) | 内容还没到，屏幕上该留什么？骨架占布局位子；空状态给人话和下一步；壳未知时整页遮罩。不要转圈，不要假进度条。 | active | 2026-08-23 | 2026-08-25 |
| [progress-taxonomy](../studies/progress-taxonomy/) | 转圈只说了在等。先定进度能不能算：能算就走到 100 停住；不能算就循环，不要假百分比。 | active | 2026-08-23 | 2026-08-25 |
| [scroll-chrome](../studies/scroll-chrome/) | 滚动提示是开场邀请，还是位置轨道？先定报什么。邀请只在顶上；轨道点的是比例，不是章节。 | active | 2026-08-24 | 2026-08-24 |
| [align-craft](../studies/align-craft/) | 对齐不是看起来正。先问对齐的是文字基线、画面焦点，还是盒子。间距用 gap，贴边用帽高，定位用 inset。 | active | 2026-08-23 | 2026-08-23 |
| [assistant-chrome](../studies/assistant-chrome/) | 助手不是默认整页聊天。先定它住在对话、侧栏、插件、浮层、画布，还是看不见。 | active | 2026-08-23 | 2026-08-23 |
| [border-beam](../studies/border-beam/) | 高光沿圆角边框绕行，不要铺满卡片。内层实心底，外层透明边框叠光束。品牌强调色，不要彩虹。 | active | 2026-08-23 | 2026-08-23 |
| [button-taxonomy](../studies/button-taxonomy/) | 「做个按钮」只说了能点。先定这一区的主操作、次操作还是弱操作，一区只能有一个面状。 | active | 2026-08-23 | 2026-08-23 |
| [carousel-taxonomy](../studies/carousel-taxonomy/) | 一组画面只说了会换。先定是平移、淡入、木马、叠卡、翻页、手风琴、360 还是视差。 | active | 2026-08-23 | 2026-08-23 |
| [chart-taxonomy](../studies/chart-taxonomy/) | 「做个图表」只说了有数。先定要看变化、大小、占比、关系、流程还是能力，再选痕迹。 | active | 2026-08-23 | 2026-08-23 |
| [control-taxonomy](../studies/control-taxonomy/) | 「做个输入框」只说了能填。先定是自己填一行或一段，还是从答案里选：可见比较、短列表、边搜边选，或同时多个。 | active | 2026-08-23 | 2026-08-23 |
| [dashboard-layers](../studies/dashboard-layers/) | 看板该从结果往下钻。一盘端上 KPI、图、表，扫得到皮，钻不到因。 | active | 2026-08-23 | 2026-08-23 |
| [dropdown-taxonomy](../studies/dropdown-taxonomy/) | 往下展开只是外观。先定提交的是一个值、一组、一条路径，还是一次动作。 | active | 2026-08-15 | 2026-08-23 |
| [glyph-sweep](../studies/glyph-sweep/) | 扫光跟字形走。光带宽度用 ch，时长等于字数乘每字秒数，不要去扫整块盒子。 | active | 2026-08-21 | 2026-08-23 |
| [hero-taxonomy](../studies/hero-taxonomy/) | 「做个高级首屏」只说了要花哨。先定第一眼回答什么：能解决什么、你是谁、为什么现在、卖什么、发生了什么、能学到什么、能帮我做什么，还是谁在这里。 | active | 2026-08-23 | 2026-08-23 |
| [layout-taxonomy](../studies/layout-taxonomy/) | 「做个页面」只说了有块。先定是单栏、落地、瀑布、全屏、分栏、仪表盘还是模块拼贴。 | active | 2026-08-23 | 2026-08-23 |
| [login-taxonomy](../studies/login-taxonomy/) | 「做个登录页」只说了有表单。先定是居中卡片、左右分栏、沉浸背景、角色入口，还是分步。 | active | 2026-08-23 | 2026-08-23 |
| [notify-taxonomy](../studies/notify-taxonomy/) | 报一条消息只说了要出声。先定打断到哪一档：瞄一眼、自动消失、还能撤销、留档、还是必须处理。 | active | 2026-08-23 | 2026-08-23 |
| [recall-grade](../studies/recall-grade/) | 翻开之后提交的是记得程度，用来排下次间隔。不是滑走下一张，也不是确认弹窗。 | active | 2026-08-23 | 2026-08-23 |
| [sidebar-taxonomy](../studies/sidebar-taxonomy/) | 靠左只是外观。先定占不占位，展开改的是宽度还是图层。 | active | 2026-08-15 | 2026-08-23 |
| [tab-taxonomy](../studies/tab-taxonomy/) | 一排标签只说了能切。先定选中态是短线、连上面板、步骤三态、轨道滑块、叠纸，还是缩略图本身。 | active | 2026-08-23 | 2026-08-23 |
| [timer-taxonomy](../studies/timer-taxonomy/) | 这一段时间是正数累计，还是倒数专注？先定会话的方向。累计没有上限；专注到 0 自己停住，不要变成负数，也不要弹一条 toast。 | active | 2026-08-23 | 2026-08-23 |
| [validation-taxonomy](../studies/validation-taxonomy/) | 「做个表单校验」只说了会报错。先定是失焦就说、这一栏立刻说，还是提交时一次说完。 | active | 2026-08-23 | 2026-08-23 |
| [inverted-notch](../studies/inverted-notch/) | 内凹角该在父级挖孔。同色补丁缝回去，背景一变缝就露馅。 | active | 2026-08-21 | 2026-08-21 |
| [look-quantize](../studies/look-quantize/) | 指针偏了，视线落到图集格子。半径里平滑，格子外夹紧，眨眼走另一行。 | active | 2026-08-21 | 2026-08-21 |
| [intent-cascade](../studies/intent-cascade/) | 斜着滑进子菜单时，途经的项不该抢走展开。 | active | 2026-08-15 | 2026-08-15 |

## Questions

Each study answers one question (`asks`). Edges live on the study as `links`.

- **乐观更新** (`optimistic-rollback`) — 点完这一击，界面是等网络回执还是立即改？
- **长按选择** (`press-select`) — 列表中这一按，是直接打开还是激活批量选择？
- **下拉刷新** (`pull-refresh`) — 下拉手势何时接管滚动、何时提交刷新？
- **填写** (`fill-taxonomy`) — 填写前、填写中、提交后，这一栏该交代什么？
- **检索可解释性** (`bm25-explain`) — 检索排序怎么让人看明白？
- **读图** (`chart-read`) — 图上这一手是读数、过滤，还是改窗口？
- **变形** (`container-morph`) — 容器身份连续时，改的是宽、高、圆角，还是排版？停在展开态还是沿路收回？
- **拖放** (`drag-commit`) — 这一拖提交的是新顺序、一次接收、跨组转移，还是无效回弹？
- **展开** (`expand-inflow`) — 这块多出来的内容，是撑开文档流，还是盖一层？
- **引导** (`guide-interrupt`) — 引导何时出现、钉在谁身上、靠什么推进、结束后还挡不挡？
- **导航栏** (`nav-taxonomy`) — 这块叫导航的东西住在哪、怎么开？
- **浮层** (`overlay-taxonomy`) — 这块浮层打不打断、贴不贴触发点？
- **翻页** (`page-append`) — 这一批记录是整页替换，还是末尾追加？
- **等待** (`pending-taxonomy`) — 内容还没到，屏幕上该留什么？
- **进度** (`progress-taxonomy`) — 进度能不能算？
- **滚动条** (`scroll-chrome`) — 滚动提示是开场邀请，还是位置轨道？
- **对齐** (`align-craft`) — 对齐的是基线、焦点，还是盒子？
- **助手** (`assistant-chrome`) — 助手住在对话、侧栏、插件、浮层、画布，还是看不见？
- **边光** (`border-beam`) — 高光该走边框还是铺满卡片？
- **按钮** (`button-taxonomy`) — 这个动作该有多重？
- **轮播** (`carousel-taxonomy`) — 这一组画面怎么切？
- **图表** (`chart-taxonomy`) — 这组数据要看什么？
- **控件** (`control-taxonomy`) — 这一格是自己填还是从答案里选？
- **层递** (`dashboard-layers`) — 看板从结果往下钻，还是一盘端上来？
- **下拉框** (`dropdown-taxonomy`) — 往下展开的面板提交什么？
- **扫光** (`glyph-sweep`) — 扫光该跟字走还是跟块走？
- **首屏** (`hero-taxonomy`) — 打开第一眼要回答什么？
- **布局** (`layout-taxonomy`) — 这一页的骨架是哪一种？
- **登录** (`login-taxonomy`) — 登录是一张卡、分栏、沉浸、角色入口，还是分步？
- **提示** (`notify-taxonomy`) — 这条提示该打断到哪一档？
- **复习** (`recall-grade`) — 翻开之后提交的是记得程度，还是只是下一张？
- **侧边栏** (`sidebar-taxonomy`) — 靠左那一块占不占位、怎么让路？
- **页签** (`tab-taxonomy`) — 这一排标签，选中态是哪种模型？
- **计时** (`timer-taxonomy`) — 这一段时间是正数累计，还是倒数专注？
- **校验** (`validation-taxonomy`) — 错误该在什么时候说？
- **内凹角** (`inverted-notch`) — 内凹角该挖孔还是缝回去？
- **视线** (`look-quantize`) — 视线该连续转还是落到格子？
- **多级菜单** (`intent-cascade`) — 斜向穿越该不该换项？

## Edges

- `optimistic-rollback` contrast `pending-taxonomy` — 乐观更新不是等骨架占位
- `optimistic-rollback` contrast `progress-taxonomy` — 乐观更新不是在等待中转圈算进度
- `optimistic-rollback` contrast `notify-taxonomy` — 乐观状态不是一条消息通知
- `optimistic-rollback` contrast `button-taxonomy` — 乐观触发不是按钮重量
- `press-select` contrast `control-taxonomy` — 长按进入模式不是常驻复选框
- `press-select` contrast `drag-commit` — 长按进入选择不是拖动提交
- `press-select` contrast `page-append` — 批量选择不是列表翻页
- `pull-refresh` contrast `scroll-chrome` — 下拉刷新不是滚动条轨道
- `pull-refresh` contrast `page-append` — 顶部下拉刷新不是底部追加记录
- `pull-refresh` contrast `progress-taxonomy` — 下拉阻尼指示器不是工作进度条
- `fill-taxonomy` contrast `control-taxonomy` — 三个时刻该交代什么不是填还是选
- `fill-taxonomy` after `validation-taxonomy` — 若问题是错误何时开口
- `fill-taxonomy` contrast `validation-taxonomy` — 当场能改不是何时开口
- `fill-taxonomy` contrast `notify-taxonomy` — 提交成功不是一条 toast
- `bm25-explain` contrast `dashboard-layers` — 检索分数拆解不是业务看板层递
- `bm25-explain` contrast `chart-taxonomy` — 排序贡献瀑布图不是通用数据图表
- `bm25-explain` contrast `control-taxonomy` — 检索输入与参数实验不是普通表单填写
- `chart-read` contrast `chart-taxonomy` — 读数手势不是选图种
- `chart-read` contrast `dashboard-layers` — 图内换层不是看板从结果往下钻
- `chart-read` contrast `look-quantize` — 最近邻吸附是读点，不是视线落到格子
- `container-morph` contrast `overlay-taxonomy` — 同一容器变形不是新开一层
- `container-morph` contrast `carousel-taxonomy` — 连续变形不是切画面
- `container-morph` contrast `sidebar-taxonomy` — 不是侧栏变宽占位
- `drag-commit` contrast `look-quantize` — 拖放提交不是视线落到格子
- `drag-commit` contrast `carousel-taxonomy` — 不是转产品的角度
- `drag-commit` contrast `layout-taxonomy` — 不是拖动分栏分隔条
- `expand-inflow` contrast `overlay-taxonomy` — 流内撑开不是侧滑抽屉
- `expand-inflow` contrast `carousel-taxonomy` — FAQ 手风琴不是列宽画廊
- `expand-inflow` contrast `sidebar-taxonomy` — 内容树不是主导航多级
- `expand-inflow` after `page-append` — 若是列表变长而不是一块面板开合
- `guide-interrupt` contrast `overlay-taxonomy` — 教学打断不是任务弹窗
- `guide-interrupt` contrast `notify-taxonomy` — 教怎么用不是报已经发生的事
- `guide-interrupt` contrast `inverted-notch` — 挖孔遮罩不是卡片内凹角
- `nav-taxonomy` after `dropdown-taxonomy` — 若它是往下展开的面板
- `nav-taxonomy` after `sidebar-taxonomy` — 若它是靠左的一栏
- `nav-taxonomy` contrast `dropdown-taxonomy` — 站点栏目不是表单下拉
- `nav-taxonomy` contrast `sidebar-taxonomy` — 汉堡抽屉不是隐藏式侧栏
- `nav-taxonomy` after `tab-taxonomy` — 若它是页内切内容的一排标签
- `nav-taxonomy` contrast `tab-taxonomy` — 顶栏去哪不是页里切面板
- `nav-taxonomy` contrast `overlay-taxonomy` — 汉堡抽屉不是这一页的内容抽屉
- `nav-taxonomy` contrast `scroll-chrome` — 章节锚点不是滚动比例
- `overlay-taxonomy` after `dropdown-taxonomy` — 若它是往下展开且提交一个值
- `overlay-taxonomy` contrast `nav-taxonomy` — 内容抽屉不是汉堡主导航
- `overlay-taxonomy` contrast `sidebar-taxonomy` — 右侧抽屉不是隐藏式侧栏
- `overlay-taxonomy` contrast `notify-taxonomy` — 必须先处理的弹窗不是一条提示
- `overlay-taxonomy` contrast `guide-interrupt` — 任务浮层不是教学引导
- `overlay-taxonomy` contrast `expand-inflow` — 侧滑抽屉不是流内撑开
- `page-append` contrast `carousel-taxonomy` — 列表翻页不是走马灯
- `page-append` contrast `expand-inflow` — 集合怎么长不是一块面板怎么开
- `page-append` contrast `pending-taxonomy` — 已经到了一截不是骨架占位
- `page-append` contrast `progress-taxonomy` — 不是工作进度
- `pending-taxonomy` contrast `progress-taxonomy` — 骨架不是转圈进度
- `pending-taxonomy` contrast `notify-taxonomy` — 空状态不是一条提示
- `pending-taxonomy` contrast `page-append` — 骨架不是已经到了一截
- `progress-taxonomy` contrast `notify-taxonomy` — 进度不是一条 toast
- `progress-taxonomy` contrast `pending-taxonomy` — 进度是工作正在发生，不是布局占位
- `progress-taxonomy` contrast `timer-taxonomy` — 进度能不能算不是这一段往上还是往下
- `progress-taxonomy` contrast `scroll-chrome` — 工作进度不是文档滚过
- `progress-taxonomy` contrast `page-append` — 工作进度不是列表翻页
- `scroll-chrome` contrast `progress-taxonomy` — 文档滚过不是工作进度
- `scroll-chrome` after `nav-taxonomy` — 若点的是章节而不是比例
- `scroll-chrome` contrast `nav-taxonomy` — 点列不是章节锚点
- `align-craft` contrast `layout-taxonomy` — 对齐不是换骨架
- `assistant-chrome` contrast `layout-taxonomy` — 助手住哪不是整页骨架
- `assistant-chrome` contrast `overlay-taxonomy` — 选区工具条不是弹窗
- `border-beam` contrast `glyph-sweep` — 高光走边框不是走字形
- `button-taxonomy` contrast `control-taxonomy` — 按钮重量不是填还是选
- `carousel-taxonomy` contrast `notify-taxonomy` — 切画面不是通知跑马灯
- `carousel-taxonomy` contrast `layout-taxonomy` — 切画面不是瀑布骨架
- `carousel-taxonomy` contrast `recall-grade` — 切下一张不是提交记得程度
- `chart-taxonomy` after `dashboard-layers` — 若数字要对着结果往下钻
- `chart-taxonomy` contrast `dashboard-layers` — 选对图不是下钻
- `control-taxonomy` after `dropdown-taxonomy` — 若答案是往下展开的固定短列表
- `control-taxonomy` contrast `dropdown-taxonomy` — 可见的单选和复选不是下拉面板
- `control-taxonomy` after `validation-taxonomy` — 若问题是错误何时开口
- `control-taxonomy` contrast `validation-taxonomy` — 填还是选不是何时报错
- `control-taxonomy` contrast `button-taxonomy` — 填还是选不是按钮有多重
- `control-taxonomy` after `fill-taxonomy` — 若问题是填写前中后该交代什么
- `control-taxonomy` contrast `fill-taxonomy` — 填还是选不是三个时刻该交代什么
- `dashboard-layers` contrast `chart-taxonomy` — 下钻不是换图种
- `dashboard-layers` contrast `layout-taxonomy` — 层递不是仪表盘皮
- `dropdown-taxonomy` after `intent-cascade` — 若改成 hover 跟手
- `dropdown-taxonomy` contrast `control-taxonomy` — 往下展开的提交模型，不是先问填还是选
- `dropdown-taxonomy` contrast `overlay-taxonomy` — 往下提交一个值不是打断式浮层
- `glyph-sweep` contrast `border-beam` — 扫光跟字走，不是沿卡片边框
- `hero-taxonomy` contrast `layout-taxonomy` — 第一眼回答什么不是整页怎么铺
- `hero-taxonomy` contrast `login-taxonomy` — 首屏不是登录卡
- `layout-taxonomy` after `sidebar-taxonomy` — 若靠左那一栏才是问题
- `layout-taxonomy` after `nav-taxonomy` — 若问的是顶栏去哪
- `layout-taxonomy` contrast `sidebar-taxonomy` — 整页骨架不是侧栏占位
- `layout-taxonomy` contrast `nav-taxonomy` — 这一页怎么铺不是顶栏去哪
- `layout-taxonomy` contrast `carousel-taxonomy` — 瀑布骨架不是切画面
- `layout-taxonomy` after `hero-taxonomy` — 若问的是不滚动那一眼要确认什么
- `layout-taxonomy` contrast `hero-taxonomy` — 一屏占满不是第一眼回答什么
- `layout-taxonomy` contrast `login-taxonomy` — 工作区分栏不是登录左右栏
- `login-taxonomy` contrast `layout-taxonomy` — 登录卡怎么摆不是整页骨架
- `login-taxonomy` contrast `hero-taxonomy` — 登录不是卖点首屏
- `notify-taxonomy` after `overlay-taxonomy` — 若必须先处理才能继续
- `notify-taxonomy` contrast `overlay-taxonomy` — 提示不打断当前任务，弹窗才打断
- `notify-taxonomy` contrast `progress-taxonomy` — 结果提示不是进度
- `notify-taxonomy` contrast `fill-taxonomy` — 结果 toast 不是提交后的成功页
- `recall-grade` contrast `carousel-taxonomy` — 翻面打分不是切下一张画面
- `recall-grade` contrast `pending-taxonomy` — 今日无到期不是一条空提示
- `recall-grade` contrast `overlay-taxonomy` — 三个记得程度不是确认弹窗
- `sidebar-taxonomy` after `intent-cascade` — 若多级改成 hover 跟手
- `sidebar-taxonomy` contrast `overlay-taxonomy` — 隐藏式侧栏不是右侧内容抽屉
- `tab-taxonomy` contrast `nav-taxonomy` — 页签切的是这一页里的面板，不是顶栏去哪
- `timer-taxonomy` contrast `progress-taxonomy` — 计时的方向不是进度能不能算
- `timer-taxonomy` contrast `notify-taxonomy` — 专注到点不是一条 toast
- `validation-taxonomy` contrast `control-taxonomy` — 何时报错不是填还是选
- `validation-taxonomy` contrast `notify-taxonomy` — 行内报错不是一条 toast
- `validation-taxonomy` contrast `overlay-taxonomy` — 提交一次标出不是 modal 确认
- `validation-taxonomy` contrast `fill-taxonomy` — 何时开口不是三个时刻该交代什么

## How to read a row

- **Idea** is the transferable rule, not the demo skin.
- **Updated** is the day to bump when the study changes. The lab sorts by it.
- Do not keep a neighbor census in `idea.md`. The graph is `asks` + `links`.
