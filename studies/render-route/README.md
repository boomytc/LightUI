# @lightui/render-route

One generated turn, shown three ways: plain text, a native component from the genui v0 contract, or an iframe document. Illegal names, props that fail the schema, and unclosed JSON degrade before anything mounts.

## Commands

```bash
npm run dev -w @lightui/render-route
npm test -w @lightui/render-route
npm run typecheck -w @lightui/render-route
```

Binds to `http://127.0.0.1:5233`.
Stage fixture: `http://127.0.0.1:5233/?stage=1`

`npm run accept -w @lightui/render-route` calls DeepSeek when `DEEPSEEK_API_KEY` is set and rewrites `src/lib/recording-data.ts`. The playground does not read that variable.
