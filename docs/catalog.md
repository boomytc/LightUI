# Study Catalog

Generated from `studies/*/study.json`. Edit the JSON, then run `make catalog`.

The lab at `products/lab` discovers the same files with `import.meta.glob`.
Do not keep a second registry.

| Slug | Idea | Status | Created | Updated |
| --- | --- | --- | --- | --- |
| [dropdown-taxonomy](../studies/dropdown-taxonomy/) | 往下展开的面板不是同一种东西。先按提交规则选模型（单选 / 多选 / 分组 / 级联 / 分割按钮 / 巨型导航 / 日期），再谈外观。 | active | 2026-08-15 | 2026-08-15 |
| [intent-cascade](../studies/intent-cascade/) | 根据鼠标移动方向推测是不是要进子菜单，用安全三角保护斜向穿越，而不是给所有 hover 加一段 delay。 | active | 2026-08-15 | 2026-08-15 |
| [nav-taxonomy](../studies/nav-taxonomy/) | 「做个导航栏」只说了有一排链接。先按放在哪、怎么打开、滚的时候干什么选模型（吸顶 / 侧栏 / 面包屑 / 下拉 / 巨型 / 抽屉 / 全屏 / 锚点 / 收缩），再谈外观。 | active | 2026-08-15 | 2026-08-15 |
| [sidebar-taxonomy](../studies/sidebar-taxonomy/) | 靠左的导航不是同一种东西。先按占位和展开方式选模型（悬浮岛 / 滚轮 / 多级 / 可折叠 / 隐藏式），再谈外观。 | active | 2026-08-15 | 2026-08-15 |

## Questions

Each study answers one question (`asks`). Edges live on the study as `links`.

- **下拉框** (`dropdown-taxonomy`) — 往下展开的面板提交什么？
- **多级菜单** (`intent-cascade`) — 斜向穿越该不该换项？
- **导航栏** (`nav-taxonomy`) — 这块叫导航的东西住在哪、怎么开？
- **侧边栏** (`sidebar-taxonomy`) — 靠左那一块占不占位、怎么让路？

## Edges

- `dropdown-taxonomy` after `intent-cascade` — 若改成 hover 跟手
- `nav-taxonomy` after `dropdown-taxonomy` — 若它是往下展开的面板
- `nav-taxonomy` after `sidebar-taxonomy` — 若它是靠左的一栏
- `nav-taxonomy` contrast `dropdown-taxonomy` — 站点栏目不是表单下拉
- `nav-taxonomy` contrast `sidebar-taxonomy` — 汉堡抽屉不是隐藏式侧栏
- `sidebar-taxonomy` after `intent-cascade` — 若多级改成 hover 跟手

## How to read a row

- **Idea** is the transferable rule, not the demo skin.
- **Updated** is the day to bump when the study changes. The lab sorts by it.
- Do not keep a neighbor census in `idea.md`. The graph is `asks` + `links`.
