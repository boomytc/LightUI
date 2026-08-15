import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const filmsRoot = path.resolve(here, "..");
const repoRoot = path.resolve(filmsRoot, "../..");

const JOBS = [
  { id: "intent-cascade-zh", film: "intent-cascade", locale: "zh", file: "cursor-movement.mp4" },
  { id: "intent-cascade-en", film: "intent-cascade", locale: "en", file: "cursor-movement.en.mp4" },
  { id: "dropdown-taxonomy-zh", film: "dropdown-taxonomy", locale: "zh", file: "source-tutorial.mp4" },
  { id: "dropdown-taxonomy-en", film: "dropdown-taxonomy", locale: "en", file: "source-tutorial.en.mp4" },
];

const only = process.argv[2];
const jobs = only
  ? JOBS.filter((job) => job.id === only || job.film === only || job.locale === only)
  : JOBS;
if (!jobs.length) {
  console.error("unknown film id:", only);
  process.exit(1);
}

const remotion = path.join(filmsRoot, "node_modules/.bin/remotion");
const outDir = path.join(filmsRoot, "out");
fs.mkdirSync(outDir, { recursive: true });

function compressMp4(src, dest) {
  const tmp = `${dest}.tmp.mp4`;
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      src,
      "-vf",
      "scale=1280:720",
      "-c:v",
      "libx264",
      "-crf",
      "26",
      "-preset",
      "slow",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "64k",
      "-ac",
      "1",
      "-movflags",
      "+faststart",
      tmp,
    ],
    { stdio: "inherit" },
  );
  fs.renameSync(tmp, dest);
}

for (const job of jobs) {
  const wavDir = path.join(filmsRoot, "public/voice", job.locale, job.film);
  if (!fs.existsSync(wavDir)) {
    throw new Error(`missing voice for ${job.locale}/${job.film}; run: python3 scripts/tts.py`);
  }
  const raw = path.join(outDir, `raw-${job.file}`);
  const dest = path.join(outDir, job.file);
  console.log("render", job.id);
  execFileSync(
    remotion,
    [
      "render",
      job.id,
      raw,
      "--codec",
      "h264",
      "--crf",
      "26",
      "--jpeg-quality",
      "80",
      "--audio-bitrate",
      "128k",
      "--concurrency",
      "50%",
    ],
    { cwd: filmsRoot, stdio: "inherit" },
  );
  console.log("compress", job.file);
  compressMp4(raw, dest);
  fs.rmSync(raw, { force: true });
  const published = path.join(repoRoot, "studies", job.film, "references", job.file);
  fs.copyFileSync(dest, published);
  console.log("published", path.relative(repoRoot, published));
}
