import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { catalogFromRegistry } from "../src/lib/catalog";
import { buildRoutePrompt, extractRouteJson, routeTurn } from "../src/lib/machines";
import { readRecording } from "../src/lib/recording";
import { ACCEPT_REQUEST } from "../src/lib/samples";

const key = process.env.DEEPSEEK_API_KEY;
if (!key) {
  console.error("DEEPSEEK_API_KEY is not set. Refusing to write a recording.");
  process.exit(2);
}

const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
const catalog = catalogFromRegistry();
const prompt = buildRoutePrompt(catalog, ACCEPT_REQUEST);

const response = await fetch("https://api.deepseek.com/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  },
  body: JSON.stringify({
    model,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ],
  }),
});

if (!response.ok) {
  const detail = await response.text();
  console.error(`DeepSeek HTTP ${response.status}: ${detail.slice(0, 500)}`);
  process.exit(1);
}

const body = (await response.json()) as {
  choices?: { message?: { content?: string } }[];
};
const content = body.choices?.[0]?.message?.content;
if (typeof content !== "string" || !content.trim()) {
  console.error("DeepSeek returned no message content.");
  process.exit(1);
}

const extracted = extractRouteJson(content);
if (!extracted.ok || !extracted.value || typeof extracted.value !== "object" || Array.isArray(extracted.value)) {
  console.error(extracted.ok ? "DeepSeek JSON was not an object." : extracted.error);
  console.error(content.slice(0, 500));
  process.exit(1);
}

const routed = routeTurn(extracted.value, catalog);
if (routed.status === "pending") {
  console.error("DeepSeek payload did not close into a route.");
  process.exit(1);
}

const payload = {
  status: "recorded" as const,
  model,
  recordedAt: new Date().toISOString(),
  request: ACCEPT_REQUEST,
  raw: JSON.stringify(extracted.value),
};

if (readRecording(payload).status !== "recorded") {
  console.error("recording payload failed validation");
  process.exit(1);
}

const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/lib/recording-data.ts");
const source = `export const recordingData: unknown = ${JSON.stringify(payload, null, 2)};\n`;
writeFileSync(file, source);
console.log(`recorded ${routed.status} surface=${routed.surface ?? "none"} degradation=${routed.degradation ?? "none"}`);
