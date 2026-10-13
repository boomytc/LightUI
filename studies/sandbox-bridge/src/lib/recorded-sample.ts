import type { RecordedSample } from "./samples";

export const recordedSample: RecordedSample = {
  "provider": "deepseek",
  "requestedModel": "deepseek-chat",
  "model": "deepseek-flash",
  "recordedOn": "2026-10-13",
  "id": "c30831fc-ecfc-4bd3-a5d3-c362be11e5c3",
  "source": "{\"initialHeight\":240,\"placeholderMessages\":[\"输入你的问题\",\"试试问：这个沙箱能做什么？\",\"描述你想要的界面\"],\"css\":\".card{box-sizing:border-box;width:100%;max-width:420px;margin:0 auto;padding:20px;border:1px solid #d9dee7;border-radius:14px;background:#ffffff;color:#1f2937;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;box-shadow:0 8px 24px rgba(15,23,42,.08)}.card h2{margin:0 0 8px;font-size:20px;line-height:1.3}.card p{margin:0 0 16px;font-size:14px;line-height:1.6;color:#4b5563}.card .actions{display:flex;gap:10px;flex-wrap:wrap}.card button{flex:1 1 140px;padding:10px 14px;border:1px solid #2563eb;border-radius:10px;background:#2563eb;color:#ffffff;font-size:14px;cursor:pointer}.card button#link{background:#ffffff;color:#2563eb}.card button:active{transform:translateY(1px)}\",\"html\":[\"<section class=\\\"card\\\">\",\"<h2>沙箱桥接卡片</h2>\",\"<p>通过按钮向宿主发送提示，或打开指定的沙箱文档链接。</p>\",\"<div class=\\\"actions\\\">\",\"<button id=\\\"ask\\\" type=\\\"button\\\">发送提示</button>\",\"<button id=\\\"link\\\" type=\\\"button\\\">打开文档</button>\",\"</div>\",\"</section>\"],\"jsFunctions\":\"function askHost(){sandboxHost.sendPrompt({text:'请介绍一下这个沙箱桥接能力'}).catch(function(){});}function openDocs(){sandboxHost.openLink({url:'https://example.com/sandbox-bridge'}).catch(function(){});}\",\"jsExpressions\":[\"document.getElementById('ask').addEventListener('click', askHost)\",\"document.getElementById('link').addEventListener('click', openDocs)\"]}"
};
