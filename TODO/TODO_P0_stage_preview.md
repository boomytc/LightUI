# 阶段计划 P0：目录卡片微缩舞台预览 (Stage Miniature Preview)

> 阶段定位：**视觉吸引力捕获 (Visual Appeal & Zero-Asset Preview)**  
> 目标模块：[StudyCard.tsx](../products/lab/src/components/StudyCard.tsx)、[Studies.tsx](../products/lab/src/pages/Studies.tsx) 与 [styles.css](../products/lab/src/styles.css)  
> 核心策略：利用内存中已动态加载的 `StageView`，借助 CSS `scale` + `inert` 隔离 + `IntersectionObserver` 懒挂载，以及专用样式重置（覆盖 `min-h-dvh`），实现零静态图片冗余的实时微缩预览。

---

## 1. 核心痛点与解决目标

### 1.1 现状痛点
- 当前 [StudyCard.tsx](../products/lab/src/components/StudyCard.tsx) 仅展示纯文字信息（`eyebrow`、`title`、`asks`、`summary`、`tags`、`date`）。
- 用户在浏览 [Studies.tsx](../products/lab/src/pages/Studies.tsx) 目录时，无法直观感知 46+ 个交互课题的形态与动态，必须逐一点开页面才能看到交互效果，视觉吸引力较弱。
- 若采用传统的“截取静态图片（Screenshots/Stills）”方案，将引入剧烈的历史兼容性包袱：
  - 需要在 CI 或本地维护 Headless Chromium 自动化截图脚本；
  - 仓库内产生海量二进制 PNG/WebP 膨胀；
  - 每次 study 样式微调或文案更新，静态图片便迅速过期失效。

### 1.2 预期成果
- 目录卡片顶部内嵌定高（约 `144px` / `h-36`）的**微缩舞台视口**；
- 直接复用 [catalog.ts](../products/lab/src/lib/catalog.ts) 中现成 eager-load 的 `StageView` React 组件（该组件本身就是各 study 单一锁定的纯净舞台实现，无页面外部 chrome）；
- **零静态图片资产**，纯 DOM 实时渲染；
- 具备视口可见性懒加载（Lazy Mount）与容错防御（ErrorBoundary），不造成首屏性能抖动与崩溃级联；
- 解决 `min-h-dvh` 导致的舞台错位，并通过现代 `inert` 属性实现无缝 A11y 焦点隔离。

---

## 2. 关键技术方案与深度避坑设计

### 2.1 架构层次图
```
+-----------------------------------------------------------------------+
| StudyCard (<a> 标签，点击直达 /s/:slug)                                |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | Preview Container (relative, overflow-hidden, h-36)             |  |
|  | [inert, aria-hidden="true", pointer-events-none, select-none]   |  |
|  |                                                                 |  |
|  |   +---------------------------------------------------------+   |  |
|  |   | Scaled Viewport (w-[560px] h-[300px], scale-[0.52])     |   |  |
|  |   | <PreviewErrorBoundary fallback={<StagePlaceholder />}>  |   |  |
|  |   |   {isInView ? (                                         |   |  |
|  |   |     <div className="lab-stage-preview">                 |   |  |
|  |   |       <StageView />                                     |   |  |
|  |   |     </div>                                              |   |  |
|  |   |   ) : <StagePlaceholder />}                             |   |  |
|  |   | </PreviewErrorBoundary>                                |   |  |
|  |   +---------------------------------------------------------+   |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  Eyebrow · Title                                                      |
|  Asks (设问气泡)                                                      |
|  Summary (描述)                                                       |
|  Tags · DateStamp                                                     |
+-----------------------------------------------------------------------+
```

### 2.2 核心避坑点与技术规范

#### 避坑点 1：`min-h-dvh` 视口撑破与偏移修复
- **根因分析**：LightUI 中几乎所有活跃 study 的 `StageView.tsx`（如 `confirm-taxonomy`, `swipe-action`, `touch-context`, `intent-cascade` 等）根节点均统一带有 `data-stage="root"`，并附带了 `min-h-dvh`（100dvh 高度）和 `p-6 sm:p-10` 填充。如果直接将其置入卡片，根节点会撑起 900px+ 并在大容器居中，导致实际的核心 fixture 偏出卡片可视区甚至完全白屏。
- **解决方案**：在 [styles.css](../products/lab/src/styles.css) 中为 `.lab-stage-preview` 容器注入专用重置规则：
  ```css
  /* 微缩舞台重置：重置 100dvh 与外层内边距，使 fixture 保持在居中可视区 */
  .lab-stage-preview [data-stage="root"] {
    min-height: 100% !important;
    height: 100% !important;
    padding: 1rem !important;
    background: transparent !important;
  }
  ```

#### 避坑点 2：严格的 A11y 焦点与事件穿透隔离 (`inert`)
- **根因分析**：卡片本身是 `<a>` 链接。如果内部渲染了 `StageView`，`StageView` 内可能包含大量的 `<button>`, `<input>`, `<select>` 等可交互元素。若仅使用 CSS `pointer-events-none`，键盘使用 Tab 键聚焦时，焦点仍会不可见地落入这些微缩控件中，严重违反无障碍可访问性。
- **解决方案**：利用现代 HTML 标准及 React 19 原生支持的 **`inert`** 属性：
  ```tsx
  <div
    inert
    aria-hidden="true"
    className="pointer-events-none select-none ..."
  >
  ```
  `inert` 会强制让浏览器忽略容器内所有元素的键盘聚焦、读屏朗读与交互，彻底规避无障碍陷阱。

#### 避坑点 3：轻量原生懒加载与错误隔离
- 首屏通过原生 `IntersectionObserver` 进行 `rootMargin: '160px'` 预判式挂载；未进入视口前仅渲染轻量网格骨架（`StagePlaceholder`），确保 46+ 个 Study 卡片滚动无卡顿。
- 使用 `PreviewErrorBoundary` 包装每个 `StageView`，任何单个 study 运行期异常仅降级为局部骨架，绝不引发整个 [Studies.tsx](../products/lab/src/pages/Studies.tsx) 白屏。

---

## 3. 文件改动与代码实现清单

### 3.1 `products/lab/src/styles.css`
新增微缩舞台重置类：
```css
/* 微缩舞台卡片适配 */
.lab-stage-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lab-stage-preview [data-stage="root"] {
  min-height: 100% !important;
  height: 100% !important;
  padding: 1rem !important;
  background: transparent !important;
  box-shadow: none !important;
}
```

### 3.2 `products/lab/src/components/StudyCard.tsx`
- **新增组件及入参**：
  ```tsx
  import React, { Component, type ComponentType, type ReactNode, useEffect, useRef, useState } from "react";
  
  // 轻量错误边界
  class PreviewErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
    state = { hasError: false };
    static getDerivedStateFromError() {
      return { hasError: true };
    }
    render() {
      return this.state.hasError ? this.props.fallback : this.props.children;
    }
  }

  // 占位骨架
  function StagePlaceholder() {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-surface-2/30">
        <div className="size-8 rounded-full border border-border/80 border-t-accent/60 animate-spin opacity-20" />
      </div>
    );
  }
  ```
- **扩展 `StudyCard` 参数**：
  ```tsx
  export function StudyCard({
    meta,
    locale,
    StageView, // 新增：当前 study 的 StageView 组件
    onSelectTag,
    selectedTag,
  }: {
    meta: StudyMeta;
    locale: Locale;
    StageView?: ComponentType;
    onSelectTag?: (tag: string) => void;
    selectedTag?: string;
  })
  ```
- **顶部微缩视口渲染**：
  ```tsx
  <div
    ref={containerRef}
    inert
    aria-hidden="true"
    className="relative mb-3.5 h-36 w-full overflow-hidden rounded-xl border border-border/60 bg-surface-2/40 pointer-events-none select-none transition-colors duration-150 group-hover:border-border-strong"
  >
    {StageView && isInView ? (
      <PreviewErrorBoundary fallback={<StagePlaceholder />}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[560px] h-[300px] shrink-0 flex items-center justify-center origin-center scale-[0.52]">
            <div className="lab-stage-preview">
              <StageView />
            </div>
          </div>
        </div>
      </PreviewErrorBoundary>
    ) : (
      <StagePlaceholder />
    )}
  </div>
  ```

### 3.3 `products/lab/src/pages/Studies.tsx`
- 透传 `s.StageView`：
  ```tsx
  <StudyCard
    meta={s.meta}
    StageView={s.StageView}
    locale={locale}
    selectedTag={selectedTag}
    onSelectTag={(tag) => handleSelectTag(tag)}
  />
  ```

---

## 4. 实施步骤拆解

- [ ] **步骤 1：在 `styles.css` 增加 `.lab-stage-preview` 样式重置规则**
  - 重置 `[data-stage="root"]` 的 `min-height`、`padding` 和 `background`。
- [ ] **步骤 2：在 `StudyCard.tsx` 构建 `PreviewErrorBoundary` 与 `useInView`**
  - 实现原生 `IntersectionObserver` 懒挂载；
  - 包装容器并标记 `inert` 与 `aria-hidden="true"`。
- [ ] **步骤 3：在 `Studies.tsx` 传递 `s.StageView`**
  - 测试在各类过滤条件（Tag、搜索、分类）切换时，微缩预览正常挂载和回收。
- [ ] **步骤 4：无障碍与事件穿透审计**
  - 确认点击微缩区域任一点均能顺利触发外层 `<a>` 跳转；
  - 确认底部 `#tag` 按钮的 `stopPropagation` 仍能独立捕获并筛选。

---

## 5. 验收标准与验证用例

1. **工作空间类型检查与测试全通**：
   ```bash
   make typecheck
   make test
   ```
2. **滚动性能与无抖动验证**：
   - 打开 `http://127.0.0.1:5173/studies`；
   - 快速上下滚动页面，FPS 稳定在 60 帧，DOM 仅渲染临近视口卡片的 React 树。
3. **视觉布局保真度**：
   - 抽检 `confirm-taxonomy`、`intent-cascade`、`swipe-action`、`sheet-snap`，各卡片微缩画面居中完整，无垂直偏移或裁切缺失。
4. **无障碍焦点验证**：
   - 键盘按下 `Tab` 键连续聚焦，焦点直接在卡片外层 `<a>` 和 `#tag` 按钮之间移动，绝对不进入微缩视口内的任何子控件。
