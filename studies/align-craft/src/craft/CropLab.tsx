import { useState } from "react";
import {
  centerCover,
  subjectCover,
  WALK_ASPECT,
  WALK_SUBJECT,
} from "../lib/crop";
import { useLocale } from "../lib/site-locale";
import { SUBJECT_ART } from "../lib/subject-art";
export function CropLab() {
  const en = useLocale() === "en";
  const [ratio, setRatio] = useState(1);
  const crop = subjectCover(WALK_SUBJECT, WALK_ASPECT, ratio);
  const center = centerCover(WALK_ASPECT, ratio);
  const previews = [
    { area: center, label: en ? "Centered" : "默认居中" },
    { area: crop, label: en ? "Subject-aware" : "围绕主体" },
  ];
  return (
    <section className="mt-6 rounded-xl border border-border p-4" data-crop-lab>
      <h3 className="font-semibold">
        {en ? "Calculate the crop from the subject" : "从主体框计算裁切位置"}
      </h3>
      <p className="mt-2 text-sm text-fg-muted">
        {en
          ? "The subject box is annotated in this fixture. Detection is separate; geometry keeps it inside the cover window when it fits."
          : "本例主体框已标注。识别主体是前置输入，几何计算负责让能容下的主体落在裁切窗口内。"}
      </p>
      <label className="my-4 flex items-center gap-3 text-sm">
        {en ? "Target ratio" : "目标比例"}
        <select
          className="rounded border border-border bg-surface p-2"
          aria-label={en ? "Target ratio" : "目标比例"}
          value={ratio}
          onChange={(e) => setRatio(Number(e.target.value))}
        >
          <option value={1}>1:1</option>
          <option value={16 / 9}>16:9</option>
          <option value={3 / 4}>3:4</option>
          <option value={3}>3:1</option>
        </select>
      </label>
      <div className="grid items-start gap-4 sm:grid-cols-3">
        <figure>
          <div
            className="relative mx-auto w-full max-w-48 overflow-hidden rounded-lg"
            style={{ aspectRatio: WALK_ASPECT }}
          >
            <img
              src={SUBJECT_ART}
              alt={en ? "Annotated source" : "标注主体的原图"}
              className="size-full"
            />
            <span
              className="absolute border-2 border-intent"
              style={{
                left: `${WALK_SUBJECT.x * 100}%`,
                top: `${WALK_SUBJECT.y * 100}%`,
                width: `${WALK_SUBJECT.w * 100}%`,
                height: `${WALK_SUBJECT.h * 100}%`,
              }}
            />
            <span
              className="absolute border-2 border-accent"
              style={{
                left: `${crop.left * 100}%`,
                top: `${crop.top * 100}%`,
                width: `${crop.width * 100}%`,
                height: `${crop.height * 100}%`,
              }}
            />
          </div>
          <figcaption className="mt-2 text-xs text-fg-muted">
            {en ? "Green: subject · accent: crop" : "绿框：主体 · 强调色：窗口"}
          </figcaption>
        </figure>
        {previews.map(({ area, label }) => (
          <figure key={label}>
            <div
              className="overflow-hidden rounded-lg bg-surface-2"
              style={{ aspectRatio: ratio }}
            >
              <img
                src={SUBJECT_ART}
                alt={String(label)}
                className="size-full object-cover"
                style={{ objectPosition: `${area.objectX}% ${area.objectY}%` }}
              />
            </div>
            <figcaption className="mt-2 text-xs text-fg-muted">
              {String(label)} · {area.objectY.toFixed(1)}%
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-4 break-words font-mono text-xs" data-crop-position>
        object-position: {crop.objectX.toFixed(1)}% {crop.objectY.toFixed(1)}%
      </p>
      <p className="mt-2 text-xs text-fg-muted">
        {en
          ? "A subject larger than the visible window cannot fit in full; change the ratio or use contain."
          : "主体比可见窗口还大时无法完整保留，应更换比例或使用 contain。"}
      </p>
    </section>
  );
}
