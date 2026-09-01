<div align="center">

# LightUI

<p><strong>UI/UX 交互逻辑、微动效几何与设计工程决策的开源实验场</strong></p>
<p><em>A curated UI/UX interaction laboratory and design engineering study catalog.</em></p>

<p align="center">
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black&style=flat-square" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white&style=flat-square" alt="TypeScript" /></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-8.1-646CFF?logo=vite&logoColor=white&style=flat-square" alt="Vite" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss&logoColor=white&style=flat-square" alt="Tailwind CSS" /></a>
  <a href="docs/catalog.md"><img src="https://img.shields.io/badge/Studies-41_Active-10B981?style=flat-square" alt="Studies" /></a>
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

LightUI 目前收录了 **41 个经过深思与实战检验的交互课题**（完整列表见 [docs/catalog.md](docs/catalog.md)）：

### 🎯 手势与连续交互 (Gestures & Micro-interactions)

| 课题 (Study) | 核心交互逻辑与决策要点 |
| :--- | :--- |
| **[intent-cascade](studies/intent-cascade/)** | **多级子菜单斜向穿越**：基于视线/光标预测三角形区域（Raycasting Guard），避免斜向滑入子菜单时被中间邻项误触发打断。 |
| **[press-select](studies/press-select/)** | **长按激活多选与滑动防抖**：短按打开、长按超 480ms 激活批量选择；在容差位移内滑动则立即注销长按转为原生顺畅滚动。 |
| **[pull-refresh](studies/pull-refresh/)** | **下拉刷新与滚动接管**：顶部向下时接管滚动，施加非线性阻尼与最大拉动阈值；松手超阈值提交刷新，未达阈值弹性复位。 |
| **[drag-commit](studies/drag-commit/)** | **拖放意图识别**：同一拖拽手势精准区分新顺序重排、一次性接收区接收、跨分组转移与无效回弹。 |

### 📐 动效与几何工程 (Motion & Geometric Craft)

| 课题 (Study) | 核心交互逻辑与决策要点 |
| :--- | :--- |
| **[path-morph](studies/path-morph/)** | **矢量路径极坐标形变**：利用 2D Procrustes 相似分解求解旋转缩放，配合极坐标插值消除直线插值造成的几何塌陷与自相交。 |
| **[container-morph](studies/container-morph/)** | **容器身份连续变形**：同一元素连续展开时遵循「内容先走、容器后收」的动效节奏，保持视觉连续性。 |
| **[inverted-notch](studies/inverted-notch/)** | **内凹圆角挖孔方案**：父级使用真实几何裁切与 Mask 挖孔，彻底杜绝同色补丁在渐变背景或换肤时的接缝露馅问题。 |
| **[glyph-sweep](studies/glyph-sweep/)** / **[border-beam](studies/border-beam/)** | **高光扫光与边界光束**：扫光宽度随字形宽度（`ch`）动态计算，边框光束沿圆角路径独立绕行，杜绝粗暴的全卡片渐变遮罩。 |

### ⚖️ 认知与决策分类学 (Decision Taxonomies & Cognition)

| 课题 (Study) | 核心交互逻辑与决策要点 |
| :--- | :--- |
| **[confirm-taxonomy](studies/confirm-taxonomy/)** | **破坏性操作确认阶梯**：打断程度与认知摩擦必须与后果的不可逆性严格成正比（行内撤销 → 气泡确认 → 倒计时模态框 → 输入验证码）。 |
| **[optimistic-rollback](studies/optimistic-rollback/)** | **乐观更新与原位快照回滚**：UI 先行响应提升流畅感；若网络失败，依据原子快照原位回滚并准确交代原因，禁用于高风险不可逆动作。 |
| **[locator-taxonomy](studies/locator-taxonomy/)** | **长页面定位意图**：长页面不只是滚动更多。区分连续阅读进度、结构大纲跳转、折叠展开与行内检索筛选。 |
| **[pending-taxonomy](studies/pending-taxonomy/)** / **[progress-taxonomy](studies/progress-taxonomy/)** | **等待与进度度量**：内容未到时用骨架占位布局；进度能算则步进至 100 停住，不可算则循环动效，绝不呈现伪百分比。 |
| **[fill-taxonomy](studies/fill-taxonomy/)** / **[validation-taxonomy](studies/validation-taxonomy/)** | **表单阶段披露与报错时机**：明确填写前、填写中、提交后各阶段披露内容；失焦报错、行内即时反馈与提交汇总校验的严谨分流。 |
| **[bm25-explain](studies/bm25-explain/)** | **检索相关性可解释性**：将检索排序总分拆解为词频饱和曲线与篇幅惩罚瀑布图，拒绝黑盒打分。 |

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
├── study.json            # 🏷️ 元数据：创建/更新日期、asks（核心问题）、links（图谱连边）
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

```
LightUI/
├── design/                   # 🎨 设计代币源：色板、字体、圆角（tokens.css, base.css）
├── docs/                     # 📚 架构与设计契约
│   ├── catalog.md            #   由 study.json 自动汇总生成的完整索引
│   ├── conventions.md        #   如何新增 Study 与设计规范
│   ├── study-contract.md     #   Study 契约接口定义
│   └── writing.md            #   设计笔记写作约定
├── products/lab/             # 🔬 Lab 综合站点（首页 / 作品列表 / 知识图谱 / 思考笔记）
├── studies/                  # 🧪 41 个独立的交互研究课题目录
│   ├── intent-cascade/
│   ├── path-morph/
│   ├── confirm-taxonomy/
│   └── ...
├── writing/                  # ✍️ 公开设计与交互工程笔记（中英双语）
├── skills/                   # 🤖 仓库 Agent 规范与工作流技能
├── scripts/                  # 🛠️ 自动化同步与静帧抓取脚本
│   ├── sync-catalog.mjs      #   自动扫描 study.json 并生成 catalog.md
│   └── capture-stage.py      #   自动化 Playwright 舞台静帧导出
├── package.json              # 根目录 npm workspace 编排配置
└── Makefile                  # 统一工作流命令入口
```

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
| `make test` | 运行所有 workspace 的单元测试与状态机测试 |
| `make typecheck` | 运行 TypeScript 严格类型检查 |
| `make catalog` | 从各 `study.json` 自动重新生成 `docs/catalog.md` 索引 |
| `make build` | 构建 Lab 与全部 Study 产物 |
| `make preview` | 本地预览 Lab 构建产物 |
| `make stills` | 从各 Study Stage 导出高保真静帧截图 |
| `make clean` | 清理各目录下的构建缓存与临时文件 |

---

<a id="contribute"></a>
## ✍️ 如何新增一个 Study

添加一个 Study 的核心是 **明确要回答的交互问题**：

1. **确定问题**：如果当前问题已有相似 Study 仅需换表现形式，优先在现有 Study 扩充种类；如果是新问题，在 `studies/<slug>/` 创建新目录。
2. **遵循契约**：补齐 `idea.md`、`study.json`、`src/StudyView.tsx`、`src/StageView.tsx`、`README.md` 与 `AGENTS.md`。
3. **连接图谱**：在 `study.json` 中配置 `asks` 与 `links`（`after` / `contrast`）。
4. **同步与验证**：
   ```bash
   make catalog   # 自动同步索引至 docs/catalog.md
   make test      # 确保测试通过
   make typecheck # 确保类型检查通过
   make dev       # 在 Lab 中验证卡片与交互
   ```

详见 [docs/conventions.md](docs/conventions.md) 与 [docs/study-contract.md](docs/study-contract.md)。
