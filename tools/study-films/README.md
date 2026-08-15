# study-films

First-party screenshots and Remotion films for `studies/*/references/`.

Stills come from the running lab (`http://127.0.0.1:5173/s/<slug>`).

Each study gets a Chinese film and an English film. Voice is VoxCPM2 Hi-Fi clone from a per-locale prompt wav. Chinese lines localize component names (选择, 多选择, 分组选择, 级联选择, 分割按钮, 巨型导航, 日期选择). Subtitles follow the spoken sentences.

## Outputs

| Study | Chinese | English |
| --- | --- | --- |
| intent-cascade | `cursor-movement.mp4` | `cursor-movement.en.mp4` |
| dropdown-taxonomy | `source-tutorial.mp4` | `source-tutorial.en.mp4` |

## Prerequisites

- Lab: `make dev` at the repo root
- Chromium for Playwright (installed on first capture)
- `MODELBEST_API_KEY` and `MODELBEST_BASE_URL`, or `tools/study-films/config.local.yaml` (gitignored)
- `ffmpeg` on `PATH`

## Commands

From this directory, after `npm install`:

```bash
npm run capture    # lab stills (zh → references + public/stills; en → public/stills/en)
npm run tts        # Hi-Fi clone WAV lines into public/voice/{zh,en}
                   # add -- --seed to rebuild prompt wavs
npm run render     # Remotion, then ffmpeg CRF 28 → studies/*/references/*.{mp4,en.mp4}
npm run films      # all three
npm run studio     # preview compositions
```

From the repo root: `make films`.

Do not mention sibling private repos on public lab pages. This folder is operator tooling only.
