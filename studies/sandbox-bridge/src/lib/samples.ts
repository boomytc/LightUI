export type RecordedSample = {
  provider: "deepseek";
  requestedModel: string;
  model: string;
  recordedOn: string;
  id: string;
  source: string;
};

const teaching = {
  initialHeight: 260,
  placeholderMessages: [
    "先记下这块区域大概多高",
    "样式还没到，先不把结构露出来",
    "按钮和说明正在接上",
  ],
  css: [
    ".card {",
    "  margin: 0;",
    "  padding: 16px 18px 14px;",
    "  font-family: \"IBM Plex Sans\", \"Noto Sans SC\", system-ui, sans-serif;",
    "  color: #17181c;",
    "  background: #ffffff;",
    "  border: 1px solid rgba(23, 24, 28, 0.08);",
    "  border-radius: 16px;",
    "}",
    ".card h2 { margin: 0 0 6px; font-size: 16px; letter-spacing: -0.01em; }",
    ".card p { margin: 0; font-size: 13px; line-height: 1.55; color: #5c616b; }",
    ".row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }",
    "button {",
    "  font: inherit;",
    "  font-size: 13px;",
    "  border-radius: 999px;",
    "  border: 1px solid rgba(23, 24, 28, 0.14);",
    "  background: #f7f8fa;",
    "  color: #17181c;",
    "  padding: 6px 12px;",
    "}",
    "button.primary { background: #17181c; color: #ffffff; border-color: #17181c; }",
    "#more { display: grid; gap: 8px; margin-top: 10px; }",
  ].join("\n"),
  html: [
    '<article class="card">',
    "<h2>沙盒里的一张卡片</h2>",
    '<p id="lead">样式到齐之后，这段才应该出现。</p>',
    '<div class="row"><button type="button" class="primary" id="ask">继续问 ↗</button><button type="button" id="link">打开链接 ↗</button><button type="button" id="grow">再长一截</button></div>',
    '<div id="more"></div></article>',
  ],
  jsFunctions: [
    "function askHost() {",
    "  return sandboxHost.sendPrompt({ text: \"把这张卡片的说明再写短一点\" }).catch(function () {});",
    "}",
    "function openDocs() {",
    "  return sandboxHost.openLink({ url: \"https://example.com/sandbox-bridge\" }).catch(function () {});",
    "}",
    "function grow() {",
    "  var more = document.getElementById(\"more\");",
    "  var p = document.createElement(\"p\");",
    "  p.textContent = \"这段长在沙盒里面。宿主看不到这里的 DOM，只收下随后报上来的高度。\";",
    "  more.appendChild(p);",
    "}",
  ].join("\n"),
  jsExpressions: [
    'document.getElementById("ask").addEventListener("click", askHost);',
    'document.getElementById("link").addEventListener("click", openDocs);',
    'document.getElementById("grow").addEventListener("click", grow);',
    "grow();",
  ],
};

export const TEACHING_SOURCE = JSON.stringify(teaching, null, 2);
