# Study Catalog

Generated from `studies/*/study.json`. Edit the JSON, then run `make catalog`.

The lab at `products/lab` discovers the same files with `import.meta.glob`.
Do not keep a second registry.

| Slug | Idea | Origin | Status |
| --- | --- | --- | --- |
| [intent-cascade](../studies/intent-cascade/) | 根据鼠标移动方向推测是不是要进子菜单，用安全三角保护斜向穿越，而不是给所有 hover 加一段 delay。 | Amazon mega dropdown / menu-aim | active |

## How to read a row

- **Idea** is the transferable rule, not the demo skin.
- **Origin** names the source we extracted from, or `original`.
- Host chrome from an external sandbox (auth, PWA, deploy adapters) is not part of the study.
