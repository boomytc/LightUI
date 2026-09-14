# LightUI 渐进式演进与落地执行总索引 (TODO)

> 本文档为 LightUI 借鉴 OpenSourceUI 优秀交互展台实践、深化研究深度与消费便利性的总执行蓝图。  
> 核心原则：**小步快跑、契约至上、遵循 YAGNI、拒绝历史兼容冗余与过度实现**。

---

## 1. 目标背景 (Background & Objective)

LightUI 是一个专注于 UI/UX 微交互、几何规则与状态机决策推演的研究工作空间（非单一通用业务应用，亦非大而全的组件库）。

在借鉴优秀的开源交互展台（如 OpenSourceUI）后，我们发现 LightUI 在**“纯粹理论研究”**与**“开发者低摩擦消费”**之间，存在四个关键演进抓手：

1. **视觉首屏缺乏抓手**：目录页（[Studies.tsx](./products/lab/src/pages/Studies.tsx)）纯文字卡片信息密度偏干，缺乏第一时间的“交互所见即所得”吸引力；
2. **源码落地存在门槛**：研究页（[StudyPage.tsx](./products/lab/src/pages/StudyPage.tsx)）有演示、舞台、理念，但未直接暴露最纯净的舞台实现与状态机核心代码，无法一键复制消费；
3. **关键交互分类缺失**：在确认机制谱系中，尚缺“物理位移承诺”（Slide to Confirm，如关机滑块、高危不可逆操作滑动确认），未将其纳入确认阶梯（[confirm-taxonomy](./studies/confirm-taxonomy)）；
4. **移动手势情境失真**：触控手势类课题在 1920px 宽屏桌面下被拉伸平铺，操作几何失真，缺乏拟真微视口约束。

为此，规划 **四阶段有序推进计划**，确保每个阶段均产出可验证、零包袱的真实增量。

---

## 2. 核心设计原则 (Design Principles)

所有阶段的设计与编码必须严格遵循以下原则：

1. **遵循 YAGNI (You Aren't Gonna Need It)**：
   - 绝不为了“未来可能复用”创建无第二个使用场景的抽象层；
   - 严禁创建全局共享的 `@lightui/components` 巨石组件库；各 study 严格自治自包含。
2. **零历史冗余包袱 (No Legacy Baggage)**：
   - **严禁引入静态截图抓取流水线**：根据 [docs/study-contract.md](./docs/study-contract.md)，静帧（Stills）不属于契约部分；微缩预览直接基于内存中已加载的 React 组件动态渲染，杜绝二进制 PNG 维护梦魇；
   - **严禁引入笨重第三方依赖**：高亮复用现有轻量解析器，不引入 Prism/Shiki/Monaco；拟真外壳使用纯 CSS，不引入 Three.js/Canvas 3D 渲染；
   - **严禁使用 `<iframe>` 嵌套**：避免多重浏览上下文造成的巨大内存占用与 CSS 变量作用域割裂。
3. **契约至上 (Contract-Driven)**：
   - 严格遵循 [AGENTS.md](./AGENTS.md)、[docs/study-contract.md](./docs/study-contract.md) 与 [docs/conventions.md](./docs/conventions.md)；
   - 每个 study 必须完备包含核心契约文件，通过 Vite `import.meta.glob` 自动发现，并在 [categories.ts](./products/lab/src/lib/categories.ts) 完成映射，确保 `make catalog` 一次通过。
4. **性能保真与无障碍规范 (Performance & A11y Fidelity)**：
   - 目录微缩预览配合 `IntersectionObserver` 懒挂载，防止 46+ 个组件在首屏并发挂载引起主线程卡顿；
   - 采用标准 **`inert`** 属性与 CSS 样式重置，彻底解决微缩视口 `min-h-dvh` 错位与键盘 Tab 键焦点穿透陷阱。

---

## 3. 四阶段推进矩阵 (Progression Matrix)

| 阶段 | 优先级 | 核心课题与目标 | 核心涉及文件 | 预估复杂度 | 依赖前置项 | 阶段详细文档 |
| :--- | :---: | :--- | :--- | :---: | :---: | :--- |
| **P0** | **高** | **微缩舞台预览**<br>在 StudyCard 基于内存 StageView 呈现微缩视口，无需截图文件 | [StudyCard.tsx](./products/lab/src/components/StudyCard.tsx)<br>[Studies.tsx](./products/lab/src/pages/Studies.tsx)<br>[styles.css](./products/lab/src/styles.css) | 低 | 无 | [TODO/TODO_P0_stage_preview.md](./TODO/TODO_P0_stage_preview.md) |
| **P1** | **高** | **代码消费落地**<br>StudyPage 增设第 4 Tab "Code"，Vite ?raw 导入纯净代码，激活复制 | [StudyPage.tsx](./products/lab/src/pages/StudyPage.tsx)<br>[catalog.ts](./products/lab/src/lib/catalog.ts)<br>[i18n.ts](./products/lab/src/lib/i18n.ts)<br>[Markdown.tsx](./products/lab/src/lib/Markdown.tsx) | 低 | 无 | [TODO/TODO_P1_code_tab.md](./TODO/TODO_P1_code_tab.md) |
| **P2** | **中** | **交互课题补充**<br>新建 studies/slide-confirm (5220)，补全物理位移承诺确认阶梯 | [studies/slide-confirm](./studies/slide-confirm)<br>[categories.ts](./products/lab/src/lib/categories.ts)<br>[conventions.md](./docs/conventions.md) | 中 | 无 | [TODO/TODO_P2_slide_confirm.md](./TODO/TODO_P2_slide_confirm.md) |
| **P3** | **中** | **设备情境拟真**<br>创建 DeviceFrame 手机视口，在 StudyPage 为手势课题提供微视口切换 | [DeviceFrame.tsx](./products/lab/src/components/DeviceFrame.tsx)<br>[StudyPage.tsx](./products/lab/src/pages/StudyPage.tsx)<br>[i18n.ts](./products/lab/src/lib/i18n.ts) | 中 | P0, P1 | [TODO/TODO_P3_device_frame.md](./TODO/TODO_P3_device_frame.md) |

---

## 4. 全局边界与非目标 (Boundaries & Non-goals)

为防止项目范围蔓延与过度设计，以下事项明确列为**非目标 (Non-goals)**：

- ❌ **非目标 1：构建通用的全局 UI 组件库**。LightUI 的定位是交互思考笔记与行为原型实验室，绝不能退化为常规的 Button/Input/Dialog NPM 包分发器。
- ❌ **非目标 2：全量自动化截图与图像存储流水线**。严禁将 PNG/JPG/WebP 静帧提交至 Git 仓库。卡片预览统一走 DOM 动态微缩，规避 CI 运行 Chromium 抓图的脆弱性。
- ❌ **非目标 3：支持海量移动设备型号与多平台模拟**。无需支持 iPhone 8、Pixel 4、iPad 等几十种分辨率矩阵；P3 阶段仅抽象一套标准现代手机微视口（393px × 820px，19.5:9 黄金比例）。
- ❌ **非目标 4：复杂的多文件在线 IDE / 编辑器**。P1 阶段仅聚焦核心转移价值（纯净 StageView 与状态机源码），不做在线编译、实时沙盒编辑（StackBlitz 式）等沉重架构。
- ❌ **非目标 5：破坏现有路由与状态设计**。保持轻量路由 [nav.ts](./products/lab/src/lib/nav.ts) 的极简实现，不引入庞大的第三方路由库。

---

## 5. 阶段索引与执行指引 (Phase Execution Guide)

请按推荐顺序依次推进实现，每完成一个阶段必须通过完整质量验证：

1. 👉 **[阶段 P0 详细计划：TODO_P0_stage_preview.md](./TODO/TODO_P0_stage_preview.md)**
   - 目标：卡片微缩舞台预览，零截图资产，CSS scale + `inert` 隔离 + `min-h-dvh` 样式重置 + `IntersectionObserver` 懒挂载。
2. 👉 **[阶段 P1 详细计划：TODO_P1_code_tab.md](./TODO/TODO_P1_code_tab.md)**
   - 目标：StudyPage 增设 Code Tab，Vite ?raw 动态引入，复用轻量高亮，激活双语复制。
3. 👉 **[阶段 P2 详细计划：TODO_P2_slide_confirm.md](./TODO/TODO_P2_slide_confirm.md)**
   - 目标：落地 studies/slide-confirm（端口 5220），在 `categories.ts` 登记分类，规范 7 大件，接入 `confirm-taxonomy` 决策图谱。
4. 👉 **[阶段 P3 详细计划：TODO_P3_device_frame.md](./TODO/TODO_P3_device_frame.md)**
   - 目标：轻量级 DeviceFrame 拟真外壳，手势课题自适应微视口切换，大屏居中拟真，小屏自适应解包降级，防双层嵌套。

### 验收流水线命令 (Validation Commands)

```bash
# 1. 验证所有 study 契约完整性与目录同步
make catalog

# 2. 验证全工作空间 TypeScript 类型安全（含 lab 与所有 studies）
make typecheck

# 3. 运行全部工作空间自动化测试（含状态机数学测试）
make test

# 4. 本地启动验证（Lab: 5173，独立 Study: 5220 等）
make dev
```
