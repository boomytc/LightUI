# login-taxonomy

「做个登录页」不是同一种东西。先定进门的舞台，再谈皮肤。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5192/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/login-taxonomy`。

建议按这个顺序点一遍，对照会最清楚：

1. 居中卡片：卡悬浮，页面留白
2. 左右分栏：左品牌，右表单；两格
3. 沉浸背景：全幅底上叠表单，不是第二栏
4. 角色入口：先选个人或企业，再进各自表单
5. 分步：邮箱再密码，一屏一件事（只有这一项可以往下走一步）

舞台查询：`?stage=1&kind=centered&state=default`。分步可用 `state=1` 或 `state=2`。
