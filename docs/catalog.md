# Study Catalog

Generated from `studies/*/study.json`. Edit the JSON, then run `make catalog`.

The lab at `products/lab` discovers the same files with `import.meta.glob`.
Do not keep a second registry.

| Slug | Idea | Status | Created | Updated |
| --- | --- | --- | --- | --- |
| [nav-taxonomy](../studies/nav-taxonomy/) | 一排链接只说了有入口。先定住在哪、怎么开、滚的时候干什么。 | active | 2026-08-15 | 2026-08-23 |
| [tab-taxonomy](../studies/tab-taxonomy/) | 一排标签只说了能切。先定选中态是短线、连上面板、步骤三态、轨道滑块、叠纸，还是缩略图本身。 | active | 2026-08-23 | 2026-08-23 |
| [glyph-sweep](../studies/glyph-sweep/) | 扫光跟字形走。光带宽度用 ch，时长等于字数乘每字秒数，不要去扫整块盒子。 | active | 2026-08-21 | 2026-08-21 |
| [inverted-notch](../studies/inverted-notch/) | 内凹角该在父级挖孔。同色补丁缝回去，背景一变缝就露馅。 | active | 2026-08-21 | 2026-08-21 |
| [look-quantize](../studies/look-quantize/) | 指针偏了，视线落到图集格子。半径里平滑，格子外夹紧，眨眼走另一行。 | active | 2026-08-21 | 2026-08-21 |
| [dropdown-taxonomy](../studies/dropdown-taxonomy/) | 往下展开只是外观。先定提交的是一个值、一组、一条路径，还是一次动作。 | active | 2026-08-15 | 2026-08-15 |
| [intent-cascade](../studies/intent-cascade/) | 斜着滑进子菜单时，途经的项不该抢走展开。 | active | 2026-08-15 | 2026-08-15 |
| [sidebar-taxonomy](../studies/sidebar-taxonomy/) | 靠左只是外观。先定占不占位，展开改的是宽度还是图层。 | active | 2026-08-15 | 2026-08-15 |

## Questions

Each study answers one question (`asks`). Edges live on the study as `links`.

- **导航栏** (`nav-taxonomy`) — 这块叫导航的东西住在哪、怎么开？
- **页签** (`tab-taxonomy`) — 这一排标签，选中态是哪种模型？
- **扫光** (`glyph-sweep`) — 扫光该跟字走还是跟块走？
- **内凹角** (`inverted-notch`) — 内凹角该挖孔还是缝回去？
- **视线** (`look-quantize`) — 视线该连续转还是落到格子？
- **下拉框** (`dropdown-taxonomy`) — 往下展开的面板提交什么？
- **多级菜单** (`intent-cascade`) — 斜向穿越该不该换项？
- **侧边栏** (`sidebar-taxonomy`) — 靠左那一块占不占位、怎么让路？

## Edges

- `nav-taxonomy` after `dropdown-taxonomy` — 若它是往下展开的面板
- `nav-taxonomy` after `sidebar-taxonomy` — 若它是靠左的一栏
- `nav-taxonomy` contrast `dropdown-taxonomy` — 站点栏目不是表单下拉
- `nav-taxonomy` contrast `sidebar-taxonomy` — 汉堡抽屉不是隐藏式侧栏
- `nav-taxonomy` after `tab-taxonomy` — 若它是页内切内容的一排标签
- `nav-taxonomy` contrast `tab-taxonomy` — 顶栏去哪不是页里切面板
- `tab-taxonomy` contrast `nav-taxonomy` — 页签切的是这一页里的面板，不是顶栏去哪
- `dropdown-taxonomy` after `intent-cascade` — 若改成 hover 跟手
- `sidebar-taxonomy` after `intent-cascade` — 若多级改成 hover 跟手

## How to read a row

- **Idea** is the transferable rule, not the demo skin.
- **Updated** is the day to bump when the study changes. The lab sorts by it.
- Do not keep a neighbor census in `idea.md`. The graph is `asks` + `links`.
