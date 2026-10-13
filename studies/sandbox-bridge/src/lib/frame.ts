import { HOST_CHANNEL, SANDBOX_CHANNEL } from "./machines";

const BOOTSTRAP = `
(function () {
  var SANDBOX = ${JSON.stringify(SANDBOX_CHANNEL)};
  var HOST = ${JSON.stringify(HOST_CHANNEL)};
  var pending = new Map();
  var seq = 0;
  var started = false;

  function measure() {
    if (!started) return;
    var root = document.getElementById("root");
    if (!root) return;
    var height = Math.ceil(root.getBoundingClientRect().height);
    parent.postMessage({ channel: SANDBOX, kind: "resize", height: height }, "*");
  }

  function callHost(name, args) {
    var id = "c" + (++seq);
    return new Promise(function (resolve, reject) {
      pending.set(id, { resolve: resolve, reject: reject });
      parent.postMessage({ channel: SANDBOX, kind: "call", id: id, name: name, args: args }, "*");
    });
  }

  window.sandboxHost = {
    sendPrompt: function (args) { return callHost("sendPrompt", args); },
    openLink: function (args) { return callHost("openLink", args); }
  };

  function runScript(code) {
    var el = document.createElement("script");
    el.textContent = code;
    document.body.appendChild(el);
    measure();
  }

  window.addEventListener("message", function (event) {
    if (event.source !== parent) return;
    var data = event.data;
    if (!data || data.channel !== HOST) return;
    if (data.kind === "result") {
      var item = pending.get(data.id);
      if (!item) return;
      pending.delete(data.id);
      if (data.ok) item.resolve(data.value);
      else item.reject(new Error(data.error || "rejected"));
      return;
    }
    if (data.kind === "css" && typeof data.css === "string") {
      var style = document.getElementById("sandbox-css");
      if (style) style.textContent = data.css;
      started = true;
      measure();
      return;
    }
    if (data.kind === "html" && typeof data.html === "string") {
      var root = document.getElementById("root");
      if (root) root.innerHTML = data.html;
      started = true;
      measure();
      return;
    }
    if (data.kind === "functions" && typeof data.code === "string") {
      runScript(data.code);
      return;
    }
    if (data.kind === "expression" && typeof data.code === "string") {
      runScript(data.code);
      return;
    }
    if (data.kind === "probe" && data.action === "call") {
      callHost(data.name, data.args).catch(function () {});
      return;
    }
    if (data.kind === "probe" && data.action === "resize") {
      var height = data.height;
      if (data.special === "nan") height = Number("not-a-number");
      if (data.special === "infinity") height = 1 / 0;
      parent.postMessage({ channel: SANDBOX, kind: "resize", height: height }, "*");
    }
  });

  var rootNode = document.getElementById("root");
  if (rootNode && typeof ResizeObserver === "function") {
    new ResizeObserver(measure).observe(rootNode);
  }
  parent.postMessage({ channel: SANDBOX, kind: "ready" }, "*");
})();
`;

export function frameDocument(): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="referrer" content="no-referrer">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<style>
  html, body { margin: 0; background: transparent; }
  body { height: auto; }
  #root { display: flow-root; }
</style>
<style id="sandbox-css"></style>
</head>
<body>
<div id="root"></div>
<script>${BOOTSTRAP}</script>
</body>
</html>`;
}
