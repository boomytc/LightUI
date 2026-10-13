<div align="center">

# LightUI

<p><strong>UI/UX 交互逻辑、微动效几何与设计工程决策的开源实验场</strong></p>
<p><em>A curated UI/UX interaction laboratory and design engineering study catalog.</em></p>

<p align="center">
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black&style=flat-square" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white&style=flat-square" alt="TypeScript" /></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-8.1-646CFF?logo=vite&logoColor=white&style=flat-square" alt="Vite" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss&logoColor=white&style=flat-square" alt="Tailwind CSS" /></a>
  <!-- catalog:badge -->
  <a href="docs/catalog.md"><img src="https://img.shields.io/badge/Studies-54_Active-10B981?style=flat-square" alt="Studies" /></a>
  <!-- /catalog:badge -->
  <a href="Makefile"><img src="https://img.shields.io/badge/Tests-Passing-success?style=flat-square" alt="Tests" /></a>
  <a href="package.json"><img src="https://img.shields.io/badge/Node-%3E%3D20-339933?logo=node.js&logoColor=white&style=flat-square" alt="Node" /></a>
</p>

<p align="center">
  <a href="#quick-start">🚀 快速上手</a> •
  <a href="docs/catalog.md">📖 完整研究索引 (Catalog)</a> •
  <a href="#featured-studies">🧩 精选专题</a> •
  <a href="#interaction-graph">🕸️ 交互图谱</a> •
  <a href="#study-contract">🏛️ 架构契约</a> •
  <a href="docs/conventions.md">📐 设计约定</a>
</p>

---

</div>

<a id="what-is-lightui"></a>
## 💡 什么是 LightUI

**LightUI 不是传统的单体 UI 组件库。**

在很多场景下，界面开发往往先套用现成的「卡片」、「弹窗」或「下拉框」，却忽略了交互中最核心的决策问题：
- 列表中这一按，是直接打开还是激活多选？滑动时如何平滑放弃？
- 破坏性操作的二次确认，什么时候该用轻量气泡，什么时候该用倒计时模态框？
- 矢量图标变形时，如何通过几何分解与极坐标插值杜绝弦长塌陷？
- 容器展开时，究竟是撑开文档流，还是盖一层浮层？

LightUI 是一个专注于 **「先回答问题，再决定交互机器与外观」** 的设计工程工作区。每个研究（Study）都是独立的沙盒单元，包含可交互的教学操场（Playground）、零干扰的独立舞台（Stage）、严谨的状态机定义以及决策思考记录（`idea.md`）。

---

<a id="featured-studies"></a>
## 🧩 精选专题与分类学 (Featured Studies)

<!-- catalog:featured -->
LightUI 目前收录了 **54 个经过深思与实战检验的交互课题**（完整列表见 [docs/catalog.md](docs/catalog.md)）：

下表按每个 `study.json` 的 `category` 与 `summary` 生成。改课题后运行 `make catalog`，不要手改表。

### 指针与手势 (Pointer & Gesture)

| 课题 (Study) | 核心规则 |
| :--- | :--- |
| **[chart-read](studies/chart-read/)** 读图 | 图画好之后，这一手是读数、过滤还是改窗口。选图种是另一问；看板层递也是另一问。 |
| **[cone-reveal](studies/cone-reveal/)** 锥光揭密 | 密文不该整段亮出来。指针从固定原点射出锥光，只有落在锥内的字形变成明文，锥外仍是圆点。 |
| **[cursor-spring](studies/cursor-spring/)** 协作光标 | 网络只能丢稀疏坐标，协作光标如何平滑跟手？解耦网络采样与屏幕刷新，用二阶弹簧半隐式欧拉积分重建自然惯性与微过冲。 |
| **[drag-commit](studies/drag-commit/)** 拖放 | 同一抓取手势，松手提交的不是同一种结果。先定是新顺序、一次接收、跨组转移，还是无效回弹。 |
| **[intent-cascade](studies/intent-cascade/)** 多级菜单 | 斜着滑进子菜单时，途经的项不该抢走展开。 |
| **[look-quantize](studies/look-quantize/)** 视线 | 指针偏了，视线落到图集格子。半径里平滑，格子外夹紧，眨眼走另一行。 |
| **[press-select](studies/press-select/)** 长按选择 | 列表中这一按，是直接打开还是激活批量选择？单击默认打开；按住超 480ms 且位移在容差内激活选择模式；滑动则立即注销长按转为滚动。 |
| **[pull-refresh](studies/pull-refresh/)** 下拉刷新 | 下拉手势何时接管滚动、何时提交刷新？顶边且向下才接管；位移应用阻尼并设上限；松手超阈值才提交刷新，未达阈值弹性复位。 |
| **[scroll-chrome](studies/scroll-chrome/)** 滚动条 | 滚动提示是开场邀请，还是位置轨道？先定报什么。邀请只在顶上；轨道点的是比例，不是章节。 |
| **[sheet-snap](studies/sheet-snap/)** 抽屉吸附 | 多档抽屉不是简单的二元开合。拖动时全量跟手并带越界阻尼，松手依据位移与速度综合裁定落入哪个离散档位。 |
| **[slide-confirm](studies/slide-confirm/)** 滑动确认 | 高危不可逆操作，如何用连续物理位移杜绝误触疲劳？滑动确认强制用户执行一段具有明确矢量方向的物理行程，未达阈值松手弹性回退，超过判定阈值才完成破坏性承诺。 |
| **[sling-throw](studies/sling-throw/)** 弹弓抛掷 | 沿轨道调值时，离轨不该被夹回一维。拉过离轨阈值，松手按抛体落点改值。 |
| **[swipe-action](studies/swipe-action/)** 列表侧滑 | 列表行向左侧滑时，8px 矢量消歧区分纵向滚动与横向侧滑；释放时依据位移与阻尼裁定回弹、吸附露出快捷操作，或超过深滑阈值直接全滑提交删除。 |
| **[touch-context](studies/touch-context/)** 长按上下文 | 触控长按不是简单弹窗。原地按住约 460ms 且位移在 10px 容差内触发；位移超标立即销毁定时器让路给滚动；菜单紧贴触控点就近浮现并在视口边界自动翻转避让。 |
| **[wheel-picker](studies/wheel-picker/)** 滚轮选择器 | 有序离散数据或时间刻度，不要弹虚拟键盘也不要展开60项长列表。上下拨动连续滑动，松手依据滚动吸附中央基准线，离基准线越远透明度与尺寸沿圆柱面几何递减。 |

### 结构与导览 (Layout & Navigation)

| 课题 (Study) | 核心规则 |
| :--- | :--- |
| **[assistant-chrome](studies/assistant-chrome/)** 助手 | 助手不是默认整页聊天。先定它住在对话、侧栏、插件、浮层、画布，还是看不见。 |
| **[dashboard-layers](studies/dashboard-layers/)** 层递 | 看板该从结果往下钻。一盘端上 KPI、图、表，扫得到皮，钻不到因。 |
| **[expand-inflow](studies/expand-inflow/)** 展开 | 多出来的内容先问撑开文档流还是盖一层。互斥还是独立，是流里的第二问。不要把抽屉再做一遍。 |
| **[group-taxonomy](studies/group-taxonomy/)** 分组 | 信息块分组不是默认套卡片。卡片只装真正独立的对象，关系才是分组的答案。 |
| **[hero-taxonomy](studies/hero-taxonomy/)** 首屏 | 「做个高级首屏」只说了要花哨。先定第一眼回答什么：能解决什么、你是谁、为什么现在、卖什么、发生了什么、能学到什么、能帮我做什么，还是谁在这里。 |
| **[layout-taxonomy](studies/layout-taxonomy/)** 布局 | 「做个页面」只说了有块。先定是单栏、落地、瀑布、全屏、分栏、仪表盘还是模块拼贴。 |
| **[locator-taxonomy](studies/locator-taxonomy/)** 定位器 | 页面变长时只是滚动更多。真正要先定的是意图：是连续阅读、结构跳转、折叠展开，还是行内检索与筛选。 |
| **[login-taxonomy](studies/login-taxonomy/)** 登录 | 「做个登录页」只说了有表单。先定是居中卡片、左右分栏、沉浸背景、角色入口，还是分步。 |
| **[nav-taxonomy](studies/nav-taxonomy/)** 导航栏 | 一排链接只说了有入口。先定住在哪、怎么开、滚的时候干什么。 |
| **[page-append](studies/page-append/)** 翻页 | 一批记录先问整页替换还是末尾追加。翻页会丢掉上一页并回到顶部；追加只增加 visibleCount，旧节点不卸。 |
| **[sidebar-taxonomy](studies/sidebar-taxonomy/)** 侧边栏 | 靠左只是外观。先定占不占位，展开改的是宽度还是图层。 |
| **[transcript-stream](studies/transcript-stream/)** 转录流 | 实时多说话人转录流不应粗暴全量重绘；在会前声纹抽屉预先建档，在会中以打字机平滑追加字词、解决后验换名与重叠抢话碰撞，并在会后无缝跃迁至双栏时间轴与结构化纪要。 |

### 表单与控件 (Controls & Forms)

| 课题 (Study) | 核心规则 |
| :--- | :--- |
| **[button-taxonomy](studies/button-taxonomy/)** 按钮 | 「做个按钮」只说了能点。先定这一区的主操作、次操作还是弱操作，一区只能有一个面状。 |
| **[control-taxonomy](studies/control-taxonomy/)** 控件 | 「做个输入框」只说了能填。先定是自己填一行或一段，还是从答案里选：可见比较、短列表、边搜边选，或同时多个。 |
| **[dropdown-taxonomy](studies/dropdown-taxonomy/)** 下拉框 | 往下展开只是外观。先定提交的是一个值、一组、一条路径，还是一次动作。 |
| **[fill-taxonomy](studies/fill-taxonomy/)** 填写 | 「做个表单」只说了有格子。先定填写前、填写中、提交后这一栏该交代什么：标签常在、必填先标、错在栏下能改、成功带下一步。 |
| **[picker-taxonomy](studies/picker-taxonomy/)** 选控 | 「做个选择器」只说了能点。先定选的是一个刻度、一段区间、按步加减、逐级路径，还是一段日期：尺子松手对齐，双端不交叉，下限禁用，换上级清空下级，止晚于起。 |
| **[tab-taxonomy](studies/tab-taxonomy/)** 页签 | 一排标签只说了能切。先定选中态是短线、连上面板、步骤三态、轨道滑块、叠纸，还是缩略图本身。 |
| **[table-taxonomy](studies/table-taxonomy/)** 记录表 | 记录表先问找、看、改落在哪一层。筛在这一列的表头，条件留在上方；表头钉在表自己的滚动区，名称列不能藏；一行只露出查看；有勾选，批量条才换掉搜索。 |
| **[validation-taxonomy](studies/validation-taxonomy/)** 校验 | 「做个表单校验」只说了会报错。先定是失焦就说、这一栏立刻说，还是提交时一次说完。 |

### 反馈与打断 (Feedback & Interruption)

| 课题 (Study) | 核心规则 |
| :--- | :--- |
| **[carousel-taxonomy](studies/carousel-taxonomy/)** 轮播 | 一组画面只说了会换。先定是平移、淡入、木马、叠卡、翻页、手风琴、360 还是视差。 |
| **[confirm-taxonomy](studies/confirm-taxonomy/)** 二次确认 | 二次确认不是一律弹窗。打断程度与认知摩擦，必须与后果的不可逆性及影响范围严格成正比。 |
| **[empty-taxonomy](studies/empty-taxonomy/)** 空白 | 空状态不要一律「暂无数据 + 一个按钮」。先判断为什么空：创建给入口，搜索改关键词，筛选改条件，失败可重试并保留原列表，完成给反馈不要再催。 |
| **[guide-interrupt](studies/guide-interrupt/)** 引导 | 教学不是弹窗，也不是一条提示。先定何时出现、钉在谁身上、靠什么推进、结束后还挡不挡。 |
| **[notify-taxonomy](studies/notify-taxonomy/)** 提示 | 报一条消息只说了要出声。先定打断到哪一档：瞄一眼、自动消失、还能撤销、留档、还是必须处理。 |
| **[optimistic-rollback](studies/optimistic-rollback/)** 乐观更新 | 点完这一击，界面是等网络回执还是立即改？成功是默认路径，UI 先行响应；若网络失败，根据快照原位回滚并说明原因；不可逆高风险操作禁止乐观更新。 |
| **[overlay-taxonomy](studies/overlay-taxonomy/)** 浮层 | 浮在页面上只是外观。先定打不打断当前任务，以及是否贴着触发点。 |
| **[pending-taxonomy](studies/pending-taxonomy/)** 等待 | 内容还没到，屏幕上该留什么？骨架占布局位子；空状态给人话和下一步；壳未知时整页遮罩。不要转圈，不要假进度条。 |
| **[progress-taxonomy](studies/progress-taxonomy/)** 进度 | 转圈只说了在等。先定进度能不能算：能算就走到 100 停住；不能算就循环，不要假百分比。 |
| **[recall-grade](studies/recall-grade/)** 复习 | 翻开之后提交的是记得程度，用来排下次间隔。不是滑走下一张，也不是确认弹窗。 |
| **[timer-taxonomy](studies/timer-taxonomy/)** 计时 | 这一段时间是正数累计，还是倒数专注？先定会话的方向。累计没有上限；专注到 0 自己停住，不要变成负数，也不要弹一条 toast。 |

### 工程与几何 (Craft & Geometry)

| 课题 (Study) | 核心规则 |
| :--- | :--- |
| **[align-craft](studies/align-craft/)** 对齐 | 对齐不是看起来正。先问对齐的是文字基线、画面焦点、数位还是盒子。间距用 gap，贴边用帽高，定位用 inset，金额用等宽，列表用两端扫读。 |
| **[bm25-explain](studies/bm25-explain/)** 检索可解释性 | 检索排序不是黑盒总分。先定稀疏与向量的分数不可直接相加，再把得分拆解为词频饱和与篇幅惩罚。 |
| **[border-beam](studies/border-beam/)** 边光 | 高光沿圆角边框绕行，不要铺满卡片。内层实心底，外层透明边框叠光束。品牌强调色，不要彩虹。 |
| **[chart-taxonomy](studies/chart-taxonomy/)** 图表 | 「做个图表」只说了有数。先定要看变化、大小、占比、关系、流程还是能力，再选痕迹。 |
| **[container-morph](studies/container-morph/)** 变形 | 同一入口连续变形。先定改宽、高、圆角还是排版；停在展开态，或沿原路收回——内容先走，容器后收。 |
| **[glyph-sweep](studies/glyph-sweep/)** 扫光 | 扫光跟字形走。光带宽度用 ch，时长等于字数乘每字秒数，不要去扫整块盒子。 |
| **[inverted-notch](studies/inverted-notch/)** 内凹角 | 内凹角该在父级挖孔。同色补丁缝回去，背景一变缝就露馅。 |
| **[path-morph](studies/path-morph/)** 路径变形 | 矢量路径变形。2D Procrustes 相似分解求解旋转与缩放，极坐标插值杜绝弦长塌陷，角点锚定保证静止态保真。 |
<!-- /catalog:featured -->

---

<a id="interaction-graph"></a>
## 🕸️ 交互决策知识图谱 (Interaction Graph)

LightUI 中的课题并非孤立存在，而是通过 **决策关系图谱** 组织在一起：
- **`asks`**：每个 Study 要优先回答的交互问题。
- **`links: after`**：解决当前问题之后，下一步自然引导出的后置问题。
- **`links: contrast`**：外观形似但交互本质不同的易混淆对比。

在 Lab 站点（`products/lab`）中提供了交互式力导向网络图谱（Network）、聚类分组（Cluster）与对比矩阵（Matrix），帮助开发者系统性梳理交互决策路径。

---

<a id="study-contract"></a>
## 🏛️ Study 架构与契约 (Study Contract)

为了保证每个课题独立自洽、易于移植且具备极高的教学演示价值，每个 `studies/<slug>/` 均遵循标准契约：

```
studies/<slug>/
├── idea.md               # 💡 核心决策思考：解决了什么痛点、核心规则、反例反思
├── study.json            # 🏷️ 元数据：category、日期、asks（核心问题）、links（图谱连边）
├── README.md             # 📖 该 Study 的独立说明
├── AGENTS.md             # 🤖 针对 AI 协作的工作流约定
├── package.json          # 📦 独立的 npm workspace package (@lightui/<slug>)
└── src/
    ├── StudyView.tsx     # 🎛️ 交互式教学操场（Playground）：包含参数调节器、对比视图与说明
    ├── StageView.tsx     # 🎬 零干扰纯净舞台（Fixture）：供测试、快照录制与嵌入使用
    └── main.tsx          # 🚀 独立运行的 Vite 启动入口
```

---

<a id="structure"></a>
## 📂 仓库结构

<!-- catalog:tree -->
```
LightUI/
├── design/                   # 🎨 设计代币源：色板、字体、圆角（tokens.css, base.css）
├── docs/                     # 📚 架构与设计契约
│   ├── catalog.md            #   由 study.json 自动汇总生成的完整索引
│   ├── conventions.md        #   如何新增 Study 与设计规范
│   ├── study-contract.md     #   Study 契约接口定义
│   └── writing.md            #   设计笔记写作约定
├── products/lab/             # 🔬 Lab 综合站点（首页 / 作品列表 / 知识图谱 / 思考笔记）
├── studies/                  # 🧪 54 个独立的交互研究课题目录
│   ├── intent-cascade/
│   ├── path-morph/
│   ├── confirm-taxonomy/
│   └── ...
├── writing/                  # ✍️ 公开设计与交互工程笔记（中英双语）
├── skills/                   # 🤖 仓库 Agent 规范与工作流技能
├── scripts/                  # 🛠️ 自动化同步与静帧抓取脚本
│   ├── sync-catalog.mjs      #   自动扫描 study.json 并生成 catalog.md 与 README 标记块
│   └── capture-stage.py      #   自动化 Playwright 舞台静帧导出
├── package.json              # 根目录 npm workspace 编排配置
└── Makefile                  # 统一工作流命令入口
```
<!-- /catalog:tree -->

---

<a id="quick-start"></a>
## 🚀 快速上手

### 环境要求
- **Node.js**: `>= 20.0.0`
- **npm**: `>= 10.0.0`

### 1. 安装依赖

```bash
make install
```

### 2. 启动 Lab 综合站点

```bash
make dev
```
打开浏览器访问 [http://127.0.0.1:5173/](http://127.0.0.1:5173/)，即可浏览全部 Study 交互操场、全屏 Stage 演示、交互关系图谱与思考笔记。

### 3. 独立运行单个 Study

每个 Study 均可独立启动运行，无需依赖 Lab 站点：

```bash
# 启动 intent-cascade 独立 Playground (端口 5174)
make dev-study STUDY=intent-cascade

# 启动 path-morph 独立 Playground (端口 5214)
make dev-study STUDY=path-morph
```

*(各 Study 端口分配规则见 [docs/conventions.md](docs/conventions.md))*

---

<a id="commands"></a>
## 🛠️ 常用开发命令

| 命令 | 说明 |
| :--- | :--- |
| `make dev` | 启动 Lab 综合呈现站点 (`http://127.0.0.1:5173`) |
| `make dev-study STUDY=<slug>` | 启动指定 Study 的独立 Playground |
| `make test` | 先做目录一致性检查，再跑全部 workspace 测试 |
| `make typecheck` | 先做目录一致性检查，再做 TypeScript 严格类型检查 |
| `make catalog` | 从各 `study.json` 生成 `docs/catalog.md` 与 README 标记块 |
| `make catalog-check` | 目录或 README 标记块与 `study.json` 不一致时失败 |
| `make build` | 构建 Lab 与全部 Study 产物 |
| `make preview` | 本地预览 Lab 构建产物 |
| `make stills` | 从各 Study Stage 导出高保真静帧截图 |
| `make clean` | 清理各目录下的构建缓存与临时文件 |

---

<a id="contribute"></a>
## ✍️ 如何新增一个 Study

添加一个 Study 的核心是 **明确要回答的交互问题**：

1. **确定问题**：如果当前问题已有相似 Study 仅需换表现形式，优先在现有 Study 扩充种类；如果是新问题，在 `studies/<slug>/` 创建新目录。
2. **遵循契约**：补齐 `idea.md`、`study.json`（含 `category`）、`src/StudyView.tsx`、`src/StageView.tsx`、`README.md` 与 `AGENTS.md`。
3. **连接图谱**：在 `study.json` 中配置 `asks` 与 `links`（`after` / `contrast`）。
4. **同步与验证**：
   ```bash
   make catalog        # 写入 docs/catalog.md 与 README 标记块
   make catalog-check  # 产物与 study.json 不一致则失败
   make test           # 含 catalog-check，并跑全部测试
   make typecheck      # 含 catalog-check，并做类型检查
   make dev            # 在 Lab 中验证卡片与交互
   ```

详见 [docs/conventions.md](docs/conventions.md) 与 [docs/study-contract.md](docs/study-contract.md)。
