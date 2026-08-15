# study-films

Operator tooling only. The Remotion / TTS / capture pipeline now lives in
the sibling LightWeaver workspace (`products/study-films`).

From the LightUI repo root (lab must be running at `http://127.0.0.1:5173`):

```bash
make films
```

Requires `../LightWeaver`, or set `LIGHTWEAVER`. Published stills and mp4s
still land in `studies/<slug>/references/`.

Do not mention sibling private repos on public lab pages.
