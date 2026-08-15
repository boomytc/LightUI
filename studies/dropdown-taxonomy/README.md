# dropdown-taxonomy

往下展开的面板不是同一种东西。先按提交规则选模型，再谈外观。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5175/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/dropdown-taxonomy`。

建议按这个顺序点一遍，对照会最清楚：

1. Select：点一项就关
2. Multi-select：列表保持开着，标签可以单独摘
3. Grouped Select → Cascader：分组标题不是路径；省只展开、区才提交
4. Split Button：主体直接发布，不必打开菜单
5. Mega Menu：这是导航，不是表单
6. Date Picker：过去的日子点不了，两端齐了才有晚数
