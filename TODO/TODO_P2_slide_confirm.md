# 阶段计划 P2：交互课题落地 studies/slide-confirm (物理位移确认)

> 阶段定位：**核心交互资产扩充与决策图谱完善 (Core Interaction Asset & Decision Graph)**  
> 目标模块：新建 [studies/slide-confirm](../studies/slide-confirm)（端口 5220）、更新 [categories.ts](../products/lab/src/lib/categories.ts) 与 [conventions.md](../docs/conventions.md)  
> 核心策略：严格按照 [docs/study-contract.md](../docs/study-contract.md) 与 [docs/conventions.md](../docs/conventions.md) 规范，落地“连续物理位移承诺”对高危不可逆操作的防误触设计，打通全流程自动建图校验。

---

## 1. 核心痛点与课题设问

### 1.1 为什么需要 slide-confirm？
在现有的交互决策图谱中，关于确认机制与手势已有两个重要课题：
1. [confirm-taxonomy](../studies/confirm-taxonomy)（确认阶梯）：探讨了打断程度与认知摩擦（轻量气泡 Popover -> 局部两步点击 -> 模态弹窗 -> 长按确认）；
2. [swipe-action](../studies/swipe-action)（列表侧滑）：探讨了多项列表行横竖意图消歧与快捷动作露出。

**然而存在一块关键的高摩擦防误触空白**：
当操作具有**极高破坏性或极高经济影响**（如：iOS 关机滑块、大额向陌生账户转账、云控制台“清空生产数据库”或“销毁实例”）时：
- 常规的模态弹窗（Modal Dialog）容易引发“确认疲劳”：用户往往盲目点击回车或蓝色主按钮；
- 简单的长按（Hold）虽然增加了时间摩擦，但在口袋或特定接触下可能发生偶发持续受压误触；
- **滑动确认（Slide to Confirm / 连续物理位移承诺）** 强制用户执行一段具有明确矢量方向、持续阻尼反馈、超过判定阈值（如 85%）且一旦中途松手即刻弹性回退的定向物理位移，将无意识点击误触降低为绝对零度。

### 1.2 课题契约定义
- **Slug**：`slide-confirm`
- **独立端口**：`5220`（紧随 5219 `touch-context` 之后）
- **包名**：`@lightui/slide-confirm`
- **分类归属**：`pointer`（指针与手势，符合“连续输入离散化、阻尼与基准吸附”）
- **设问 (`asks`)**：
  - 中文：*“高危不可逆操作，如何用连续物理位移杜绝误触疲劳？”*
  - 英文：*“How should critical irreversible actions use continuous physical displacement to prevent modal fatigue misclicks?”*
- **决策图谱关联 (`links`)**：
  - 对照 [confirm-taxonomy](../studies/confirm-taxonomy)：*“连续物理位移滑块是极限不可逆门禁，不同于模态弹窗与点击阶梯”*
  - 对照 [swipe-action](../studies/swipe-action)：*“滑动确认是单向单一阈值防误触门禁，列表侧滑是多动作就近露出与全滑触发”*
  - 对照 [drag-commit](../studies/drag-commit)：*“滑动确认是标量位移承诺，拖拽提交是空间落位与列表重排”*

---

## 2. 状态机与数学规则 (State Machine & Math)

文件位置：`studies/slide-confirm/src/lib/machines.ts`

```
           pointerDown
  [ IDLE ] ───────────► [ DRAGGING ]
     ▲                        │
     │ pointerUp (r < 0.85)   │ pointerUp (r >= 0.85)
     │ (Spring Rollback)      ▼
  [ RESETTING ] ◄───── [ COMMITTED ]
   (after delay)       (Trigger Action / Lock)
```

1. **几何与位移比例计算**：
   - 轨道可用滑行距离：$L = W_{track} - W_{thumb}$；
   - 原始指针偏移：$dx = x_{current} - x_{start}$；
   - 超出末端阻尼：若 $dx > L$，应用橡皮筋衰减公式 $dx = L + (dx - L)^{0.75}$；
   - 归一化进度：$r = \text{clamp}\left(\frac{dx}{L}, 0, 1\right)$。
2. **视觉提示渐隐与填充跟随**：
   - 滑道底色填充：宽度比例跟随 $r$ 实时增加，当 $r > 0.85$ 时高亮转为激活色（如危险红或确认主色）；
   - 轨道提示文案（如“滑动以确认销毁”）：透明度按 $\max(0, 1 - r \times 1.5)$ 随拖动线性渐隐；
   - 抓手微光（Sheen）：在 `idle` 状态下循环横向扫光，拖拽激活时停止。
3. **承诺裁决与释放判定**：
   - 若在 $r < 0.85$ 时释放指针：状态机切换至 `resetting`，启动 CSS Spring 或缓动回弹（$300\text{ms}$，`cubic-bezier(0.25, 1, 0.5, 1)`），平滑回到原点 `idle`；
   - 若在 $r \ge 0.85$ 时释放指针：状态机切换至 `committed`，抓手吸附贴至最右侧，触发触觉震动（`navigator.vibrate` 若可用），展示成功动画或执行回调。

---

## 3. 契约文件工程清单 (7 大契约文件与配套结构)

新建目录：`studies/slide-confirm/`

```
studies/slide-confirm/
├── AGENTS.md                   # 该 study 内部自律指引
├── README.md                   # 课题简述与端口 5220 说明
├── package.json                # @lightui/slide-confirm, port 5220
├── tsconfig.json               # 继承并保持严格类型检查
├── vite.config.ts              # 绑定 127.0.0.1:5220
├── index.html                  # 独立运行 HTML 模版
├── idea.md                     # 中文理念：回答三大黄金问题
├── idea.en.md                  # 英文理念
├── study.json                  # 机器可读元数据与图谱 links
└── src/
    ├── main.tsx                # 独立启动入口
    ├── App.tsx                 # 独立调试外壳（支持 ?stage=1）
    ├── StageView.tsx           # 纯净舞台：单一种类、锁定状态、无外部控件
    ├── StudyView.tsx           # 教学与交互游乐场（场景切换、阈值与阻尼调节）
    └── lib/
        ├── stage-query.ts      # 舞台参数读取辅助
        ├── machines.ts         # 纯函数：位移比率、阻尼公式、阈值判定
        └── machines.test.ts    # Node 20 / tsx 原生单元测试套件
```

### 关键联动修改（核心避坑）

#### 避坑点 1：必须在 `products/lab/src/lib/categories.ts` 注册
- **根因分析**：[scripts/sync-catalog.mjs](../scripts/sync-catalog.mjs) 在执行 `make catalog` 时，会严格校验全量 study slug 是否已在 `SLUG_CATEGORY_MAP` 中登记。若未登记，脚本将直接退出并报错 `missing category mapping in products/lab/src/lib/categories.ts: slide-confirm`。
- **改动代码**：
  在 `products/lab/src/lib/categories.ts` 的 `SLUG_CATEGORY_MAP` 中追加：
  ```ts
  "slide-confirm": "pointer",
  ```

#### 避坑点 2：必须在 `docs/conventions.md` 更新端口分配记录
- 将 `5220 slide-confirm` 记录至占用清单，将 `Next free:` 更新为 `5221`。

---

## 4. 实施步骤拆解

- [ ] **步骤 1：脚手架创建与端口/分类注册**
  - 创建 `studies/slide-confirm/` 基础配置文件（`package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`）；
  - 在 `categories.ts` 中登记 `"slide-confirm": "pointer"`；
  - 在 `docs/conventions.md` 中更新端口为 5220，并将下一个空闲端口递增为 5221。
- [ ] **步骤 2：撰写 `idea.md`、`idea.en.md` 与 `study.json`**
  - 回答好三大核心问题（缺少时破坏什么、真实物理规则、为什么常规按钮/弹窗较劣）；
  - 在 `study.json` 配置设问与同 `confirm-taxonomy`、`swipe-action` 的对比图谱连线。
- [ ] **步骤 3：编写状态机 `machines.ts` 与自动化测试 `machines.test.ts`**
  - 实现位移归一化、阈值裁决、阻尼计算纯函数；
  - 运行 `npm run test -w @lightui/slide-confirm`，验证临界点（0, 0.84, 0.85, 1.0, 越界负值与超大值）。
- [ ] **步骤 4：构建 `StageView.tsx` 与 `StudyView.tsx`**
  - 使用原生 Pointer Events（`onPointerDown`、`setPointerCapture`、`onPointerMove`、`onPointerUp`），确保桌面鼠标与移动触控跟手表现一致；
  - `StageView` 展现带有 `data-stage="root"` 与 `data-stage="fixture"` 的标准防误触危险销毁滑块；
  - `StudyView` 增加三种业务情境（转账 10,000 元、注销账号、抹掉服务器数据），支持配置回弹速度与提交阈值。
- [ ] **步骤 5：全局验证与目录同步**
  - 执行 `make catalog`，确认 `docs/catalog.md` 自动纳入新课题且 exit code 为 0；
  - 执行 `make typecheck` 与 `make test`；
  - 在决策图谱 `/graph` 查看新节点与连接线。

---

## 5. 验收标准与验证用例

1. **工作空间命令全通**：
   ```bash
   make catalog
   npm run test -w @lightui/slide-confirm
   make typecheck
   make test
   ```
2. **手势与跨平台跟手度验证**：
   - 鼠标或触控在滑块抓手按下并拖动，抓手平滑跟手，文字随位移平滑渐隐；
   - 拖动至 80% 处松开指针，抓手立即以弹簧曲线回弹至原点，不触发提交；
   - 拖动至 90% 处松开指针，抓手平滑吸附至末端，状态变为 `committed` 并触发回调；
   - 鼠标快速滑出浏览器窗口或移动端手指滑出边缘，`releasePointerCapture` 正常处理，无卡死。
3. **Lab 与图谱呈现验证**：
   - 在 `http://127.0.0.1:5173/studies` 出现新卡片；
   - 在 `/s/slide-confirm` 演示页交互流畅；
   - 在 `/graph` 判定图谱中与 `confirm-taxonomy` 正确连线。
