import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkRecordedSource, formatSampleCheck } from "../src/lib/sample-check.ts";

const key = process.env.DEEPSEEK_API_KEY;
if (!key) {
  console.error("DEEPSEEK_API_KEY is not set. Refusing to write a sample.");
  process.exit(1);
}

const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const endpoint = "https://api.deepseek.com/chat/completions";
const prompt = `输出一个 JSON 对象，不要 markdown 围栏，键必须按这个顺序出现：
initialHeight, placeholderMessages, css, html, jsFunctions, jsExpressions。
initialHeight 是 180 到 320 之间的数字。
placeholderMessages 是 3 条简短中文。
css 是一段字符串，只样式化 .card，不要用 vh，不要引用外部资源。
html 是字符串数组，拼起来是一张卡片：标题、一句说明、两个按钮（id 为 ask 和 link）。不要写 script 标签。
jsFunctions 是一个字符串，定义 askHost 与 openDocs。它们只能调用已经存在的 sandboxHost.sendPrompt({ text }) 和 sandboxHost.openLink({ url })，url 必须是 https://example.com/sandbox-bridge 。用 .catch 吞掉拒绝。
jsExpressions 是字符串数组，给两个按钮绑定点击。
不要输出这六个键以外的键。`;

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model,
    stream: true,
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: "你只输出一个 JSON 对象。不要解释，不要代码围栏。",
      },
      { role: "user", content: prompt },
    ],
  }),
});

if (!response.ok || !response.body) {
  const detail = await response.text();
  console.error(`DeepSeek HTTP ${response.status}`);
  console.error(detail.slice(0, 500));
  process.exit(1);
}

let raw = "";
let id = "";
let seenModel = model;
const decoder = new TextDecoder();
let buffer = "";
for await (const chunk of response.body) {
  buffer += decoder.decode(chunk, { stream: true });
  const lines = buffer.split("\n");
  buffer = lines.pop() ?? "";
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) continue;
    const data = trimmed.slice(5).trim();
    if (data === "[DONE]") continue;
    const payload = JSON.parse(data);
    if (typeof payload.id === "string") id = payload.id;
    if (typeof payload.model === "string") seenModel = payload.model;
    const delta = payload.choices?.[0]?.delta?.content;
    if (typeof delta === "string") raw += delta;
  }
}

const source = stripFence(raw).trim();
const checks = checkRecordedSource(source);
let failed = false;
for (const check of checks) {
  console.log(formatSampleCheck(check));
  if (!check.ok) failed = true;
}
if (failed) {
  console.error("样本校验未通过，未写入 recorded-sample.ts");
  process.exit(1);
}

const recordedOn = new Date().toISOString().slice(0, 10);
const sample = {
  provider: "deepseek",
  model: seenModel,
  recordedOn,
  id: id || "unknown",
  source,
};
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/lib/recorded-sample.ts");
const file = `import type { RecordedSample } from "./samples";

export const recordedSample: RecordedSample = ${JSON.stringify(sample, null, 2)};
`;
await writeFile(out, file);
console.log(`Wrote ${path.relative(process.cwd(), out)} (${seenModel}, ${source.length} chars)`);

function stripFence(text) {
  const fence = text.match(/^\s*```(?:json)?\s*\n/);
  if (!fence) return text;
  return text.slice(fence[0].length).replace(/\n?```\s*$/, "");
}
