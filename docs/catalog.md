# Study Catalog

Generated from `studies/*/study.json`. Edit the JSON, then run `make catalog`.

The lab at `products/lab` discovers the same files with `import.meta.glob`.
Do not keep a second registry.

| Slug | Idea | Status | Created | Updated |
| --- | --- | --- | --- | --- |
| [align-craft](../studies/align-craft/) | 对齐不是看起来正。先问对齐的是文字基线、画面焦点，还是盒子。间距用 gap，贴边用帽高，定位用 inset。 | active | 2026-08-23 | 2026-08-23 |
| [button-taxonomy](../studies/button-taxonomy/) | 「做个按钮」只说了能点。先定这一区的主操作、次操作还是弱操作，一区只能有一个面状。 | active | 2026-08-23 | 2026-08-23 |
| [carousel-taxonomy](../studies/carousel-taxonomy/) | 一组画面只说了会换。先定是平移、淡入、木马、叠卡、翻页、手风琴、360 还是视差。 | active | 2026-08-23 | 2026-08-23 |
| [chart-taxonomy](../studies/chart-taxonomy/) | 「做个图表」只说了有数。先定要看变化、大小、占比、关系、流程还是能力，再选痕迹。 | active | 2026-08-23 | 2026-08-23 |
| [control-taxonomy](../studies/control-taxonomy/) | 「做个输入框」只说了能填。先定是自己填一行或一段，还是从答案里选：可见比较、短列表、边搜边选，或同时多个。 | active | 2026-08-23 | 2026-08-23 |
| [dashboard-layers](../studies/dashboard-layers/) | 看板该从结果往下钻。一盘端上 KPI、图、表，扫得到皮，钻不到因。 | active | 2026-08-23 | 2026-08-23 |
| [dropdown-taxonomy](../studies/dropdown-taxonomy/) | 往下展开只是外观。先定提交的是一个值、一组、一条路径，还是一次动作。 | active | 2026-08-15 | 2026-08-23 |
| [hero-taxonomy](../studies/hero-taxonomy/) | 「做个高级首屏」只说了要花哨。先定第一眼回答什么：能解决什么、你是谁、为什么现在、卖什么、发生了什么、能学到什么、能帮我做什么，还是谁在这里。 | active | 2026-08-23 | 2026-08-23 |
| [layout-taxonomy](../studies/layout-taxonomy/) | 「做个页面」只说了有块。先定是单栏、落地、瀑布、全屏、分栏、仪表盘还是模块拼贴。 | active | 2026-08-23 | 2026-08-23 |
| [login-taxonomy](../studies/login-taxonomy/) | 「做个登录页」只说了有表单。先定是居中卡片、左右分栏、沉浸背景、角色入口，还是分步。 | active | 2026-08-23 | 2026-08-23 |
| [nav-taxonomy](../studies/nav-taxonomy/) | 一排链接只说了有入口。先定住在哪、怎么开、滚的时候干什么。 | active | 2026-08-15 | 2026-08-23 |
| [notify-taxonomy](../studies/notify-taxonomy/) | 报一条消息只说了要出声。先定打断到哪一档：瞄一眼、自动消失、还能撤销、留档、还是必须处理。 | active | 2026-08-23 | 2026-08-23 |
| [overlay-taxonomy](../studies/overlay-taxonomy/) | 浮在页面上只是外观。先定打不打断当前任务，以及是否贴着触发点。 | active | 2026-08-23 | 2026-08-23 |
| [progress-taxonomy](../studies/progress-taxonomy/) | 转圈只说了在等。先定进度能不能算：能算就走到 100 停住；不能算就循环，不要假百分比。 | active | 2026-08-23 | 2026-08-23 |
| [sidebar-taxonomy](../studies/sidebar-taxonomy/) | 靠左只是外观。先定占不占位，展开改的是宽度还是图层。 | active | 2026-08-15 | 2026-08-23 |
| [tab-taxonomy](../studies/tab-taxonomy/) | 一排标签只说了能切。先定选中态是短线、连上面板、步骤三态、轨道滑块、叠纸，还是缩略图本身。 | active | 2026-08-23 | 2026-08-23 |
| [validation-taxonomy](../studies/validation-taxonomy/) | 「做个表单校验」只说了会报错。先定是失焦就说、这一栏立刻说，还是提交时一次说完。 | active | 2026-08-23 | 2026-08-23 |
| [glyph-sweep](../studies/glyph-sweep/) | 扫光跟字形走。光带宽度用 ch，时长等于字数乘每字秒数，不要去扫整块盒子。 | active | 2026-08-21 | 2026-08-21 |
| [inverted-notch](../studies/inverted-notch/) | 内凹角该在父级挖孔。同色补丁缝回去，背景一变缝就露馅。 | active | 2026-08-21 | 2026-08-21 |
| [look-quantize](../studies/look-quantize/) | 指针偏了，视线落到图集格子。半径里平滑，格子外夹紧，眨眼走另一行。 | active | 2026-08-21 | 2026-08-21 |
| [intent-cascade](../studies/intent-cascade/) | 斜着滑进子菜单时，途经的项不该抢走展开。 | active | 2026-08-15 | 2026-08-15 |

## Questions

Each study answers one question (`asks`). Edges live on the study as `links`.

- **对齐** (`align-craft`) — 对齐的是基线、焦点，还是盒子？
- **按钮** (`button-taxonomy`) — 这个动作该有多重？
- **轮播** (`carousel-taxonomy`) — 这一组画面怎么切？
- **图表** (`chart-taxonomy`) — 这组数据要看什么？
- **控件** (`control-taxonomy`) — 这一格是自己填还是从答案里选？
- **层递** (`dashboard-layers`) — 看板从结果往下钻，还是一盘端上来？
- **下拉框** (`dropdown-taxonomy`) — 往下展开的面板提交什么？
- **首屏** (`hero-taxonomy`) — 打开第一眼要回答什么？
- **布局** (`layout-taxonomy`) — 这一页的骨架是哪一种？
- **登录** (`login-taxonomy`) — 登录是一张卡、分栏、沉浸、角色入口，还是分步？
- **导航栏** (`nav-taxonomy`) — 这块叫导航的东西住在哪、怎么开？
- **提示** (`notify-taxonomy`) — 这条提示该打断到哪一档？
- **浮层** (`overlay-taxonomy`) — 这块浮层打不打断、贴不贴触发点？
- **进度** (`progress-taxonomy`) — 进度能不能算？
- **侧边栏** (`sidebar-taxonomy`) — 靠左那一块占不占位、怎么让路？
- **页签** (`tab-taxonomy`) — 这一排标签，选中态是哪种模型？
- **校验** (`validation-taxonomy`) — 错误该在什么时候说？
- **扫光** (`glyph-sweep`) — 扫光该跟字走还是跟块走？
- **内凹角** (`inverted-notch`) — 内凹角该挖孔还是缝回去？
- **视线** (`look-quantize`) — 视线该连续转还是落到格子？
- **多级菜单** (`intent-cascade`) — 斜向穿越该不该换项？

## Edges

- `align-craft` contrast `layout-taxonomy` — 对齐不是换骨架
- `button-taxonomy` contrast `control-taxonomy` — 按钮重量不是填还是选
- `carousel-taxonomy` contrast `notify-taxonomy` — 切画面不是通知跑马灯
- `carousel-taxonomy` contrast `layout-taxonomy` — 切画面不是瀑布骨架
- `chart-taxonomy` after `dashboard-layers` — 若数字要对着结果往下钻
- `chart-taxonomy` contrast `dashboard-layers` — 选对图不是下钻
- `control-taxonomy` after `dropdown-taxonomy` — 若答案是往下展开的固定短列表
- `control-taxonomy` contrast `dropdown-taxonomy` — 可见的单选和复选不是下拉面板
- `control-taxonomy` after `validation-taxonomy` — 若格子已经定了，下一步是错误何时说
- `control-taxonomy` contrast `validation-taxonomy` — 填还是选不是何时报错
- `control-taxonomy` contrast `button-taxonomy` — 填还是选不是按钮有多重
- `dashboard-layers` contrast `chart-taxonomy` — 下钻不是换图种
- `dashboard-layers` contrast `layout-taxonomy` — 层递不是仪表盘皮
- `dropdown-taxonomy` after `intent-cascade` — 若改成 hover 跟手
- `dropdown-taxonomy` contrast `control-taxonomy` — 往下展开的提交模型，不是先问填还是选
- `dropdown-taxonomy` contrast `overlay-taxonomy` — 往下提交一个值不是打断式浮层
- `hero-taxonomy` after `layout-taxonomy` — 若骨架已经是落地页
- `hero-taxonomy` contrast `login-taxonomy` — 首屏不是登录卡
- `layout-taxonomy` after `sidebar-taxonomy` — 若靠左那一栏才是问题
- `layout-taxonomy` after `nav-taxonomy` — 若问的是顶栏去哪
- `layout-taxonomy` contrast `sidebar-taxonomy` — 整页骨架不是侧栏占位
- `layout-taxonomy` contrast `nav-taxonomy` — 这一页怎么铺不是顶栏去哪
- `layout-taxonomy` contrast `carousel-taxonomy` — 瀑布骨架不是切画面
- `login-taxonomy` contrast `layout-taxonomy` — 登录卡怎么摆不是整页骨架
- `login-taxonomy` contrast `hero-taxonomy` — 登录不是卖点首屏
- `nav-taxonomy` after `dropdown-taxonomy` — 若它是往下展开的面板
- `nav-taxonomy` after `sidebar-taxonomy` — 若它是靠左的一栏
- `nav-taxonomy` contrast `dropdown-taxonomy` — 站点栏目不是表单下拉
- `nav-taxonomy` contrast `sidebar-taxonomy` — 汉堡抽屉不是隐藏式侧栏
- `nav-taxonomy` after `tab-taxonomy` — 若它是页内切内容的一排标签
- `nav-taxonomy` contrast `tab-taxonomy` — 顶栏去哪不是页里切面板
- `nav-taxonomy` contrast `overlay-taxonomy` — 汉堡抽屉不是这一页的内容抽屉
- `notify-taxonomy` after `overlay-taxonomy` — 若必须先处理才能继续
- `notify-taxonomy` contrast `overlay-taxonomy` — 提示不打断当前任务，弹窗才打断
- `notify-taxonomy` contrast `progress-taxonomy` — 结果提示不是进度
- `overlay-taxonomy` after `dropdown-taxonomy` — 若它是往下展开且提交一个值
- `overlay-taxonomy` contrast `nav-taxonomy` — 内容抽屉不是汉堡主导航
- `overlay-taxonomy` contrast `sidebar-taxonomy` — 右侧抽屉不是隐藏式侧栏
- `overlay-taxonomy` contrast `notify-taxonomy` — 必须先处理的弹窗不是一条提示
- `progress-taxonomy` contrast `notify-taxonomy` — 进度不是一条 toast
- `sidebar-taxonomy` after `intent-cascade` — 若多级改成 hover 跟手
- `sidebar-taxonomy` contrast `overlay-taxonomy` — 隐藏式侧栏不是右侧内容抽屉
- `tab-taxonomy` contrast `nav-taxonomy` — 页签切的是这一页里的面板，不是顶栏去哪
- `validation-taxonomy` contrast `control-taxonomy` — 何时报错不是填还是选
- `validation-taxonomy` contrast `notify-taxonomy` — 行内报错不是一条 toast
- `validation-taxonomy` contrast `overlay-taxonomy` — 提交一次标出不是 modal 确认

## How to read a row

- **Idea** is the transferable rule, not the demo skin.
- **Updated** is the day to bump when the study changes. The lab sorts by it.
- Do not keep a neighbor census in `idea.md`. The graph is `asks` + `links`.
