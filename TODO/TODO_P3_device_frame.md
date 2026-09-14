# 阶段计划 P3：设备情境拟真外壳 (DeviceFrame & Mobile Viewport)

> 阶段定位：**情境拟真与沉浸式手感校验 (Contextual Realism & Touch Fidelity)**  
> 目标模块：新建 [DeviceFrame.tsx](../products/lab/src/components/DeviceFrame.tsx)，并在 [StudyPage.tsx](../products/lab/src/pages/StudyPage.tsx) 与 [i18n.ts](../products/lab/src/lib/i18n.ts) 中集成  
> 核心策略：通过纯 CSS 工具类打造极简现代移动视口外壳（393px × 820px），为触控手势类课题提供“宽屏展开 / 设备拟真”无级切换；解决现有带壳组件的“套娃外壳”冲突；并在手机访问时自动解包平滑降级，零 3D 与 iframe 开销。

---

## 1. 核心痛点与解决目标

### 1.1 现状痛点
- LightUI 沉淀了一批高水准的移动触控交互课题，例如：
  - [pull-refresh](../studies/pull-refresh)（下拉阻尼刷新）；
  - [touch-context](../studies/touch-context)（长按气泡上下文菜单）；
  - [press-select](../studies/press-select)（长按多选时序消歧）；
  - 以及 P2 阶段新增的 [slide-confirm](../studies/slide-confirm)（滑动防误触确认）。
- 在宽屏（如 1440px / 1920px）桌面浏览器下全幅平铺时，手势操作的几何尺度严重失真：
  - 手势位移横向拉扯，视觉焦点过于松散；
  - 缺乏单手握持时紧凑的视距与上下边界感；
- **但是部分课题现状存在分歧**：
  - `wheel-picker`、`sheet-snap`、`swipe-action` 在各自的 `StageView` 中已自行内嵌了轻度手机框（如 `.wheel-phone` 或 `rounded-[32px] border-4`）；
  - 若不假思索地在全局强行套壳，将引发**“手机框里套手机框”**的滑稽双层套娃问题。

### 1.2 预期成果
- 构建通用轻量纯 CSS [DeviceFrame.tsx](../products/lab/src/components/DeviceFrame.tsx)；
- 在 [StudyPage.tsx](../products/lab/src/pages/StudyPage.tsx) 针对需要视口约束的触控课题，提供“设备拟真 (Smartphone)”与“宽屏视口 (Monitor)”的无级切换；
- 建立**防套娃识别机制**：仅针对无内置外壳的触控课题（或在 StageView 中透传无壳模式）激活 DeviceFrame；
- **真机访问彻底解包**：在移动端原生访问时（`< 640px`），边框、圆角、灵动岛、Home 条全部彻底清除，无缝铺满屏幕；
- **零 3D 与零 iframe 开销**：直接内联渲染 React 组件树，维持 CSS 变量高光一致性。

---

## 2. 视觉规范与架构设计

### 2.1 现代极简外壳几何参数 (iPhone 15/16 Pro 基准)
```
+-----------------------------------------------------------+
| DeviceFrame (桌面端: 393px × 820px, 窄屏端: 100% 展开)     |
| sm:border-[8px] sm:border-border-strong sm:rounded-[48px]  |
| sm:shadow-2xl sm:bg-surface                               |
|                                                           |
|    +-------------------------------------------------+    |
|    | Dynamic Island (桌面端显示, 窄屏 hidden)         |    |
|    +-------------------------------------------------+    |
|                                                           |
|    + - - - - - - - - - - - - - - - - - - - - - - - - +    |
|    | Inner Viewport (sm:rounded-[40px], overflow-auto)    |
|    |                                                 |    |
|    |   {children} -> <StudyView /> / <StageView />   |    |
|    |                                                 |    |
|    + - - - - - - - - - - - - - - - - - - - - - - - - +    |
|                                                           |
|    +-------------------------------------------------+    |
|    | Home Indicator Bar (桌面端显示, 窄屏 hidden)     |    |
|    +-------------------------------------------------+    |
+-----------------------------------------------------------+
```

### 2.2 核心避坑设计

#### 避坑点 1：真机自适应解包 (Unwrap on Small Screens)
- **根因分析**：若直接在容器上写死 `border-[8px]`、`rounded-[48px]` 与高度限制，在真正的移动端浏览器（宽度 375px~430px）打开时，会出现屏幕内额外缩进 8px 黑边并裁剪高度的灾难体验。
- **解决方案**：外壳所有拟真装饰全部使用响应式前缀 `sm:` 约束。在 `< 640px` 时，外壳完全无边框、无圆角、无占位高度限制，自然融进手机屏幕。

#### 避坑点 2：防双层外壳嵌套 (Matryoshka Prevention)
- **根因分析**：
  - `wheel-picker` 的 `StageView` 自带了 `.wheel-phone` 和 `.wheel-phone-notch`；
  - `sheet-snap` 的 `StageView` 自带了 `PhoneSheet`（340px 宽度卡片）；
- **解决方案**：
  - 在 `StudyPage.tsx` 中定义需要外壳包裹的目标集合（优先为无内置框的手势课题，如 `pull-refresh`, `touch-context`, `press-select`, `slide-confirm`）；
  - 或者支持由用户点击顶部视口切换按钮自主决定是否开闭。

---

## 3. 文件改动与实现清单

### 3.1 `products/lab/src/components/DeviceFrame.tsx` (新建)
```tsx
import { type ReactNode } from "react";

export function DeviceFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto flex w-full justify-center sm:py-6 ${className}`}>
      {/* 桌面端呈现拟真边框，手机原生端彻底平铺解包 */}
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-bg sm:h-[820px] sm:max-h-[85vh] sm:max-w-[393px] sm:rounded-[48px] sm:border-[8px] sm:border-border-strong sm:bg-surface sm:shadow-2xl">
        {/* 顶部灵动岛：仅桌面端展示，手机端隐藏 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-3 z-30 hidden h-6 w-28 -translate-x-1/2 rounded-full bg-fg/90 transition-transform duration-200 sm:block"
        />

        {/* 内屏视口容器 */}
        <div className="relative flex-1 h-full w-full overflow-y-auto overflow-x-hidden bg-bg sm:rounded-[40px]">
          {children}
        </div>

        {/* 底部 Home 横条：仅桌面端展示，手机端隐藏 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1.5 left-1/2 z-30 hidden h-1 w-32 -translate-x-1/2 rounded-full bg-fg/25 sm:block"
        />
      </div>
    </div>
  );
}
```

### 3.2 `products/lab/src/lib/i18n.ts`
在 `zh` 与 `en` 字典中补充视口切换词条：
```ts
// zh 字典：
viewportFull: "宽屏视口",
viewportDevice: "设备拟真",

// en 字典：
viewportFull: "Full Width",
viewportDevice: "Device Frame",
```

### 3.3 `products/lab/src/pages/StudyPage.tsx`
- **引入依赖与状态**：
  ```tsx
  import { Monitor, Smartphone } from "lucide-react";
  import { DeviceFrame } from "../components/DeviceFrame";
  ```
- **识别目标课题与状态**：
  ```tsx
  // 具备手势特性且自身未内置重型外壳的课题
  const GESTURE_STUDIES = new Set([
    "pull-refresh",
    "touch-context",
    "press-select",
    "slide-confirm",
  ]);
  const isGestureStudy = GESTURE_STUDIES.has(meta.slug);
  const [useDeviceFrame, setUseDeviceFrame] = useState(isGestureStudy);

  // 路由切 Study 时重置默认状态
  useEffect(() => {
    setUseDeviceFrame(isGestureStudy);
  }, [slug, isGestureStudy]);
  ```
- **操作栏中追加切换按钮**：
  ```tsx
  {isGestureStudy && (tab === "play" || tab === "stage") ? (
    <button
      type="button"
      onClick={() => setUseDeviceFrame(!useDeviceFrame)}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
      title={useDeviceFrame ? copy.viewportFull : copy.viewportDevice}
      aria-label={useDeviceFrame ? copy.viewportFull : copy.viewportDevice}
    >
      {useDeviceFrame ? <Monitor className="size-3.5" /> : <Smartphone className="size-3.5" />}
      <span className="hidden sm:inline">
        {useDeviceFrame ? copy.viewportFull : copy.viewportDevice}
      </span>
    </button>
  ) : null}
  ```
- **包裹渲染**：
  在 `tab === "play"` 或 `tab === "stage"` 时，若 `useDeviceFrame` 为真，则使用 `<DeviceFrame>` 包含渲染。

---

## 4. 实施步骤拆解

- [ ] **步骤 1：创建 `DeviceFrame.tsx` 响应式组件**
  - 实现极简边框、顶部灵动岛与底部横条；
  - 确认在 `< 640px` 视口下装饰全部隐藏，内容无边框占满屏幕。
- [ ] **步骤 2：在 `i18n.ts` 补充视口切换词条**
  - 中英文双语支持。
- [ ] **步骤 3：在 `StudyPage.tsx` 接入视口控制**
  - 为 `pull-refresh`、`touch-context`、`press-select`、`slide-confirm` 提供自适应外壳呈现。
- [ ] **步骤 4：手势与边界交互调优**
  - 验证长按浮层（`touch-context`）在外壳边界内的避让翻转逻辑；
  - 验证下拉刷新（`pull-refresh`）和滑动确认（`slide-confirm`）跟手流畅度。

---

## 5. 验收标准与验证用例

1. **类型检查与自动化验证**：
   ```bash
   make typecheck
   make test
   ```
2. **多端拟真与响应式测试**：
   - 在 1440px 桌面打开 `/s/pull-refresh`，默认呈现手机外壳，尺寸居中紧凑；
   - 点击“宽屏视口”按钮，内容平滑展开为桌面全宽视图；
   - 使用 Chrome DevTools 切换至 iPhone 14/15 模式（393px 宽），外壳自动展开全屏，无双重边框或水平滚动条。
3. **套娃隔离测试**：
   - 打开自带外壳的 `/s/wheel-picker`，默认不出现双层边框嵌套；各组件显示清晰。
