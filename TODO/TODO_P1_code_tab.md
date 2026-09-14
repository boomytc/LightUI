# 阶段计划 P1：研究页源码消费落地 (Code Tab & Source Export)

> 阶段定位：**代码消费与落地可用性 (Code Portability & Instant Reuse)**  
> 目标模块：[StudyPage.tsx](../products/lab/src/pages/StudyPage.tsx)、[catalog.ts](../products/lab/src/lib/catalog.ts)、[i18n.ts](../products/lab/src/lib/i18n.ts) 与 [Markdown.tsx](../products/lab/src/lib/Markdown.tsx)  
> 核心策略：通过 Vite 原生 `?raw` 动态导入当前 Study 的纯净舞台（`StageView.tsx`）与核心状态机（`machines.ts`）源码，增设第 4 个 Tab "Code"，复用现有轻量高亮渲染器并激活 `copyCode` / `copiedCode` 国际化复制能力。

---

## 1. 核心痛点与解决目标

### 1.1 现状痛点
- 当前 [StudyPage.tsx](../products/lab/src/pages/StudyPage.tsx) 顶部导航仅有 3 个 Tab：
  1. `play`（综合演示，包含调参滑块与教学说明）；
  2. `stage`（独立舞台，锁定单状态的无 chrome 纯净组件）；
  3. `idea`（设计理念与设问长文）。
- 开发者在看到心仪的交互方案后，想要在自己的项目中吸收移植，却**无法直接在 Lab 界面查看并复制代码**；
- 必须通过 Git 克隆整个 LightUI 仓库，深入 `studies/<slug>/src/` 翻找源文件，消费摩擦极大；
- 国际化文件 [i18n.ts](../products/lab/src/lib/i18n.ts) 中早已定义了 `copyCode: "复制代码"` 和 `copiedCode: "已复制"` 词条，但目前处于闲置状态；
- `Markdown.tsx` 内的 `CodeBlock` 组件中复制按钮文案硬编码为英文（`"Copy"` / `"Copied"`），未对接统一的 i18n 系统。

### 1.2 预期成果
- 在 `StudyPage.tsx` 中增设第 4 个 Tab：“`code` (源码)”；
- 用户一键切换至 Code Tab，可即时浏览当前研究的 **纯净舞台实现（StageView.tsx）** 及 **状态机计算数学（machines.ts）**；
- 优雅兼容 9 个纯几何/CSS 课题（无 `machines.ts` 的课题）单文件降级展示；
- 提供清晰的文件切换标签、代码行数与文件名信息、语法着色与一键复制反馈；
- 遵循 YAGNI：完全使用 Vite 原生 `?raw` 机制与现存自研轻量高亮器，**不安装 PrismJS / Shiki / Monaco 等沉重依赖**。

---

## 2. 架构设计与无冗余考量

### 2.1 源码加载流水线
```
studies/<slug>/src/StageView.tsx (必选)
studies/<slug>/src/lib/machines.ts (可选，37/46 课题具备)
                │
                ▼ Vite import.meta.glob (query: '?raw', eager: true)
products/lab/src/lib/catalog.ts
  LoadedStudy {
    meta, ideas, StudyView, StageView,
    stageCode?: string,
    machinesCode?: string
  }
                │
                ▼
products/lab/src/pages/StudyPage.tsx (Tab: "code")
  [文件切换: StageView.tsx | machines.ts] (仅在两者均有时展示切换器)
  <CodeBlock 
    code={currentCode} 
    filename={activeFilename}
    copyLabel={copy.copyCode}
    copiedLabel={copy.copiedCode}
  />
```

### 2.2 关键设计决策
1. **为什么只展示 StageView 与 machines，不展示 StudyView？**
   - `StudyView.tsx` 包含了大量 Lab 演示特有的调试面板、辅助线开关、教具容器等展示脚手架代码，并非开发者想要直接移植的核心行为；
   - `StageView.tsx` 才是被 [docs/study-contract.md](../docs/study-contract.md) 锁定的、无多余依赖的纯净交互契约；
   - `machines.ts` 承载了纯函数的几何与状态机数学规则，是交互逻辑的核心灵魂；
   - 聚焦两者，能给开发者带来最高密度的消费价值，避免冗余代码造成的阅读负担。

2. **为什么复用 `Markdown.tsx` 而不引入外部高亮库？**
   - [Markdown.tsx](../products/lab/src/lib/Markdown.tsx) 内部已经实现了一套极简、高执行效率的 `highlightCode` 正则分词器与 `CodeBlock` 视图；
   - 覆盖了关键词、字符串、注释、数字、函数调用的完整着色，完全贴合 LightUI 自有设计主题；
   - 扩展 `CodeBlock` 属性支持透传 `filename`、`copyLabel` 和 `copiedLabel`，零新增 NPM 依赖，完全符合 YAGNI 原则。

---

## 3. 文件改动与代码实现清单

### 3.1 `products/lab/src/lib/catalog.ts`
- **引入 Vite ?raw Glob 映射**：
  ```ts
  const stageRawModules = import.meta.glob("../../../../studies/*/src/StageView.tsx", {
    eager: true,
    query: "?raw",
    import: "default",
  }) as Record<string, string>;

  const machinesRawModules = import.meta.glob("../../../../studies/*/src/lib/machines.ts", {
    eager: true,
    query: "?raw",
    import: "default",
  }) as Record<string, string>;
  ```
- **扩展 `LoadedStudy` 类型**：
  ```ts
  export type LoadedStudy = {
    meta: StudyMeta;
    ideas: { zh: string; en: string };
    StudyView?: ComponentType;
    StageView?: ComponentType;
    stageCode?: string;
    machinesCode?: string;
  };
  ```
- **在 `loadStudies()` 中绑定代码字符串**：
  ```ts
  return {
    meta,
    ideas: { zh, en: ideaEnModules[`${dir}/idea.en.md`] ?? zh },
    StudyView: viewModules[`${dir}/src/StudyView.tsx`]?.StudyView,
    StageView: stageModules[`${dir}/src/StageView.tsx`]?.StageView,
    stageCode: stageRawModules[`${dir}/src/StageView.tsx`],
    machinesCode: machinesRawModules[`${dir}/src/lib/machines.ts`],
  };
  ```

### 3.2 `products/lab/src/lib/i18n.ts`
在 `zh` 与 `en` 词典中补充 Tab 对应文案（中英严格对称）：
```ts
// zh 字典中追加：
tabCode: "源码",
codeHeading: "纯净组件源码",
codeDesc: "无外部教学脚手架的自包含实现与状态机计算数学，可直接移植",
codeFileStage: "舞台组件 (StageView.tsx)",
codeFileMachines: "状态机数学 (machines.ts)",

// en 字典中追加：
tabCode: "Code",
codeHeading: "Clean Component Source",
codeDesc: "Self-contained implementation and math logic ready for direct porting",
codeFileStage: "Stage Component (StageView.tsx)",
codeFileMachines: "State Machine (machines.ts)",
```

### 3.3 `products/lab/src/lib/Markdown.tsx`
- 重构并导出 `CodeBlock` 组件，消除硬编码英文，支持透传标签：
  ```tsx
  export function CodeBlock({
    code,
    filename = "code",
    copyLabel = "Copy",
    copiedLabel = "Copied",
  }: {
    code: string;
    filename?: string;
    copyLabel?: string;
    copiedLabel?: string;
  }) {
    const [copied, setCopied] = useState(false);

    async function copy() {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      } catch {
        setCopied(false);
      }
    }

    return (
      <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-[#12141a] p-4 text-[#e2e4ea] shadow-card sm:p-5">
        <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
          <span className="font-mono text-[11px] tracking-wider text-white/50">
            {filename}
          </span>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
            <span>{copied ? copiedLabel : copyLabel}</span>
          </button>
        </div>
        <pre className="overflow-x-auto font-mono text-[12px] leading-relaxed text-[#dcdfe6]">
          {highlightCode(code)}
        </pre>
      </div>
    );
  }
  ```

### 3.4 `products/lab/src/pages/StudyPage.tsx`
- **更新 Tab 常量与类型**：
  ```ts
  const TABS = ["play", "stage", "code", "idea"] as const;
  type StudyTab = (typeof TABS)[number];
  ```
- **更新键盘导航循环**：
  ```ts
  function onTabListKeyDown(e: React.KeyboardEvent) {
    const index = TABS.indexOf(tab);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      activate(TABS[(index + 1) % TABS.length], "keyboard");
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      activate(TABS[(index - 1 + TABS.length) % TABS.length], "keyboard");
    } else if (e.key === "Home") {
      e.preventDefault();
      activate("play", "keyboard");
    } else if (e.key === "End") {
      e.preventDefault();
      activate("idea", "keyboard");
    }
  }
  ```
- **Tab 按钮渲染标签**：
  ```tsx
  {id === "play" ? copy.tabPlay : id === "stage" ? copy.tabStage : id === "code" ? copy.tabCode : copy.tabIdea}
  ```
- **Code 面板渲染实现（含单文件与双文件自适应）**：
  ```tsx
  const [activeCodeFile, setActiveCodeFile] = useState<"stage" | "machines">("stage");
  const stageCode = study.stageCode ?? "";
  const machinesCode = study.machinesCode;
  const currentCode = activeCodeFile === "machines" && machinesCode ? machinesCode : stageCode;
  const currentFilename = activeCodeFile === "machines" ? "machines.ts" : "StageView.tsx";
  ```
  ```tsx
  tab === "code" ? (
    <div className="page-width py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-fg">{copy.codeHeading}</h2>
            <p className="mt-0.5 text-[13px] text-fg-muted">{copy.codeDesc}</p>
          </div>
          {machinesCode ? (
            <div className="flex rounded-lg border border-border bg-surface-2 p-0.5 text-[12px]">
              <button
                type="button"
                onClick={() => setActiveCodeFile("stage")}
                className={
                  activeCodeFile === "stage"
                    ? "rounded-md bg-surface px-2.5 py-1 font-medium text-fg shadow-xs"
                    : "rounded-md px-2.5 py-1 font-medium text-fg-muted hover:text-fg"
                }
              >
                {copy.codeFileStage}
              </button>
              <button
                type="button"
                onClick={() => setActiveCodeFile("machines")}
                className={
                  activeCodeFile === "machines"
                    ? "rounded-md bg-surface px-2.5 py-1 font-medium text-fg shadow-xs"
                    : "rounded-md px-2.5 py-1 font-medium text-fg-muted hover:text-fg"
                }
              >
                {copy.codeFileMachines}
              </button>
            </div>
          ) : null}
        </div>
        <CodeBlock
          code={currentCode}
          filename={currentFilename}
          copyLabel={copy.copyCode}
          copiedLabel={copy.copiedCode}
        />
      </div>
    </div>
  ) : ...
  ```

---

## 4. 实施步骤拆解

- [ ] **步骤 1：在 `catalog.ts` 接入 `?raw` Glob 导入**
  - 动态载入全量 studies 的 `StageView.tsx` 与 `src/lib/machines.ts`；
  - 验证构建期与运行期类型定义无报错。
- [ ] **步骤 2：在 `i18n.ts` 补齐 Tab 与文件标签词条**
  - 确保中英文双语一致性，激活预留的 `copyCode` / `copiedCode`。
- [ ] **步骤 3：重构并导出 `Markdown.tsx` 中的 `CodeBlock`**
  - 参数化 `copyLabel`、`copiedLabel` 与 `filename`。
- [ ] **步骤 4：在 `StudyPage.tsx` 整合 Code Tab**
  - 接入 `TABS` 四键循环导航；
  - 针对存在与缺失 `machines.ts` 的两类 Study 进行文件标签与代码渲染验证。

---

## 5. 验收标准与验证用例

1. **类型检查与单元测试**：
   ```bash
   make typecheck
   make test
   ```
2. **Tab 交互与无障碍测试**：
   - 访问任意 Study（如 `/s/intent-cascade`），点击第四个 Tab “源码”；
   - 检查高亮着色正常，无乱码，无格式错位；
   - 点击“复制代码”按钮，验证剪贴板成功写入，按钮状态转变为“已复制”并在 1.6s 后恢复；
   - 键盘按下 `ArrowRight` / `ArrowLeft` 可在 4 个 Tab 之间顺序循环切换，`Home` 直达演示，`End` 直达理念。
3. **9 个无 `machines.ts` 课题的降级测试**：
   - 访问 `/s/inverted-notch` 或 `/s/border-beam`，验证 Code Tab 仅展示 `StageView.tsx`，顶部不出现空切换器。
4. **语言切换验证**：
   - 中英切换时，Tab 文案（源码 / Code）、描述文案与复制按钮文案实时同步切换。
