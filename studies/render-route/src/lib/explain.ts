import type { RouteResult, SchemaError } from "./machines";
import type { Locale } from "./site-locale";

export function hostExplanation(
  result: RouteResult,
  names: readonly string[],
  locale: Locale,
): string {
  const listed = names.join(locale === "en" ? ", " : "、");
  const name = result.requestedComponent || (locale === "en" ? "that name" : "这个名字");
  if (result.degradation === "unknown-component") {
    return locale === "en"
      ? `${name} is not in the catalog. Nothing by that name is mounted. Text fallback is committed. Catalog: ${listed}.`
      : `目录里没有 ${name}。这个名字不会被挂载，已改交纯文本。目录现有：${listed}。`;
  }
  if (result.degradation === "invalid-props") {
    const detail = result.errors.map((error) => schemaError(error, locale)).join(locale === "en" ? " " : "");
    return locale === "en"
      ? `Props failed the schema, so the component stays unmounted. ${detail}`
      : `props 没通过 schema，组件没有挂载。${detail}`;
  }
  if (result.degradation === "partial-stream") {
    return locale === "en"
      ? "The JSON has not closed, so this turn commits nothing."
      : "JSON 还没闭合，这一轮还没提交。";
  }
  if (result.degradation === "invalid-document") {
    return locale === "en"
      ? "The sandbox document is empty, so the host commits text."
      : "沙盒文档是空的，已改交纯文本。";
  }
  if (result.degradation === "invalid-surface") {
    return locale === "en"
      ? "The surface declaration cannot be committed, so the host commits text."
      : "表面声明无法提交，已改交纯文本。";
  }
  if (result.surface === "text") {
    return locale === "en"
      ? "Committed as plain text. No component is mounted."
      : "提交为纯文本。没有挂载组件。";
  }
  if (result.surface === "native") {
    return locale === "en"
      ? `Committed ${result.component ?? "the component"} from the catalog. Props passed the schema.`
      : `提交目录里的 ${result.component ?? "组件"}。props 已通过 schema。`;
  }
  if (result.surface === "iframe") {
    return locale === "en"
      ? "Committed an iframe document. It does not receive the host origin."
      : "提交一份 iframe 文档。它拿不到宿主的同源权限。";
  }
  return locale === "en" ? "Nothing is committed yet." : "还没有提交。";
}

function schemaError(error: SchemaError, locale: Locale): string {
  if (error.code === "unexpected") {
    return locale === "en" ? `Unexpected field ${error.path}.` : `多了字段 ${error.path}。`;
  }
  if (error.code === "missing") {
    return locale === "en" ? `Missing ${error.path}.` : `缺少 ${error.path}。`;
  }
  if (error.code === "type") {
    return locale === "en"
      ? `${error.path} should be ${error.expected}, got ${error.received}.`
      : `${error.path} 需要 ${error.expected}，得到的是 ${error.received}。`;
  }
  return locale === "en" ? "Props are not an object." : "props 不是对象。";
}

export function surfaceLabel(surface: "text" | "native" | "iframe" | "none", locale: Locale): string {
  if (surface === "text") return locale === "en" ? "Plain text" : "纯文本";
  if (surface === "native") return locale === "en" ? "Native component" : "原生组件";
  if (surface === "iframe") return locale === "en" ? "iframe sandbox" : "iframe 沙盒";
  return locale === "en" ? "Not committed" : "尚未提交";
}
