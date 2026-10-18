import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseFrontmatter } from "./frontmatter";

describe("parseFrontmatter", () => {
  it("reads keys and leaves the body", () => {
    const raw = `---
title: 斜线不该换菜单
date: 2026-08-15
summary: hello
related: intent-cascade
---

正文第一段。
`;
    const { data, body } = parseFrontmatter(raw);
    assert.equal(data.title, "斜线不该换菜单");
    assert.equal(data.date, "2026-08-15");
    assert.equal(data.related, "intent-cascade");
    assert.equal(body.startsWith("正文第一段"), true);
  });

  it("returns the whole file when there is no fence", () => {
    const { data, body } = parseFrontmatter("# 关于\n\n一段话。");
    assert.deepEqual(data, {});
    assert.equal(body.includes("一段话"), true);
  });

  it("strips an empty fence block instead of leaking it into the body", () => {
    const { data, body } = parseFrontmatter("---\n---\n正文。\n");
    assert.deepEqual(data, {});
    assert.equal(body, "正文。\n");
  });

  it("reads a note that starts with a byte-order mark", () => {
    const { data, body } = parseFrontmatter("\uFEFF---\ntitle: 标题\n---\n正文。\n");
    assert.equal(data.title, "标题");
    assert.equal(body.startsWith("正文"), true);
  });

  it("accepts CRLF fences and bodies", () => {
    const { data, body } = parseFrontmatter("---\r\ntitle: 标题\r\n---\r\n正文。\r\n");
    assert.equal(data.title, "标题");
    assert.equal(body.startsWith("正文"), true);
  });

  it("keeps the fence in the body when the closing fence is missing", () => {
    const { data, body } = parseFrontmatter("---\ntitle: x\n\n正文");
    assert.deepEqual(data, {});
    assert.equal(body.startsWith("---"), true);
  });
});
