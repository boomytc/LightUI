import type { Locale } from "./site-locale";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function noticeDocument(text: string, locale: Locale): string {
  const title = locale === "en" ? "Notice" : "通知";
  const body = escapeHtml(text);
  return `<!DOCTYPE html>
<html lang="${locale === "en" ? "en" : "zh-CN"}">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  body { margin: 0; font-family: "IBM Plex Sans", "Noto Sans SC", sans-serif; color: #17181c; background: #f7f8fa; }
  article { margin: 16px; padding: 16px 18px; background: #fff; border: 1px solid rgba(23,24,28,.08); border-radius: 12px; }
  p { margin: 0; font-size: 15px; line-height: 1.6; }
  small { display: block; margin-top: 10px; color: #8b909a; font-size: 11px; letter-spacing: .04em; }
</style>
</head>
<body>
<article>
  <p>${body}</p>
  <small>sandbox document</small>
</article>
</body>
</html>`;
}

export function lunchDocument(locale: Locale): string {
  const copy =
    locale === "en"
      ? {
          title: "Lunch estimate",
          people: "People",
          each: "28 per person",
          suffix: "",
        }
      : {
          title: "午餐估算",
          people: "人数",
          each: "每人 28 元",
          suffix: "元",
        };
  return `<!DOCTYPE html>
<html lang="${locale === "en" ? "en" : "zh-CN"}">
<head>
<meta charset="utf-8" />
<title>${copy.title}</title>
<style>
  body { margin: 0; font-family: "IBM Plex Sans", "Noto Sans SC", sans-serif; color: #17181c; background: #fff; }
  form { margin: 16px; display: grid; gap: 10px; }
  h1 { margin: 0; font-size: 15px; font-weight: 600; }
  label { display: grid; gap: 4px; font-size: 12px; color: #5c616b; }
  input { width: 6rem; font: inherit; font-size: 15px; padding: 6px 8px; border: 1px solid rgba(23,24,28,.14); border-radius: 8px; }
  output { font-size: 22px; font-weight: 600; }
  small { color: #8b909a; font-size: 12px; }
</style>
</head>
<body>
<form>
  <h1>${copy.title}</h1>
  <label>${copy.people}
    <input id="people" type="number" min="1" value="6" />
  </label>
  <small>${copy.each}</small>
  <output id="total">${locale === "en" ? "168" : "168 元"}</output>
</form>
<script>
  const people = document.getElementById("people");
  const total = document.getElementById("total");
  const price = 28;
  const suffix = ${JSON.stringify(copy.suffix)};
  function render() {
    const count = Number(people.value);
    if (!Number.isFinite(count) || count <= 0) {
      total.textContent = "—";
      return;
    }
    total.textContent = String(count * price) + (suffix ? " " + suffix : "");
  }
  people.addEventListener("input", render);
</script>
</body>
</html>`;
}
