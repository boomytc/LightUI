import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { afterEdges, contrastPairs, graphLevels, graphNodes, neighborsOf, normalizeLinks } from "./graph";
import type { StudyMeta } from "./study";

function study(partial: Partial<StudyMeta> & Pick<StudyMeta, "slug">): StudyMeta {
  return {
    title: partial.slug,
    summary: "",
    status: "active",
    tags: [],
    ...partial,
  };
}

const pack: StudyMeta[] = [
  study({
    slug: "nav",
    asks: "住在哪？",
    links: [
      { slug: "drop", rel: "after", when: "若是往下展开的面板" },
      { slug: "side", rel: "after", when: "若是靠左的一栏" },
      { slug: "side", rel: "contrast", when: "抽屉不是隐藏式" },
    ],
  }),
  study({
    slug: "drop",
    asks: "提交什么？",
    links: [{ slug: "intent", rel: "after", when: "若改成 hover" }],
  }),
  study({
    slug: "side",
    asks: "占不占位？",
    links: [{ slug: "intent", rel: "after", when: "若改成 hover" }],
  }),
  study({ slug: "intent", asks: "斜向该不该换项？" }),
  study({ slug: "orphan", asks: "还没连上的问题" }),
];

describe("normalizeLinks", () => {
  it("drops junk and self-duplicates", () => {
    assert.deepEqual(
      normalizeLinks([
        { slug: "drop", rel: "after" },
        { slug: "drop", rel: "after" },
        { slug: "x", rel: "later" },
        { rel: "after" },
        null,
      ]),
      [{ slug: "drop", rel: "after", when: undefined, whenEn: undefined }],
    );
  });
});

describe("neighborsOf", () => {
  it("reverses after into before", () => {
    const next = neighborsOf("drop", pack);
    assert.deepEqual(
      next.map((n) => n.rel + ":" + n.slug),
      ["before:nav", "after:intent"],
    );
    assert.equal(next[0]?.when, "若是往下展开的面板");
  });

  it("treats contrast as undirected and ignores missing slugs", () => {
    const fromNav = neighborsOf("nav", pack);
    assert.ok(fromNav.some((n) => n.rel === "contrast" && n.slug === "side"));
    const fromSide = neighborsOf("side", pack);
    assert.ok(fromSide.some((n) => n.rel === "contrast" && n.slug === "nav"));
    assert.deepEqual(
      neighborsOf("nav", [
        study({ slug: "nav", links: [{ slug: "ghost", rel: "after" }] }),
      ]),
      [],
    );
  });
});

describe("afterEdges / contrastPairs / graphNodes", () => {
  it("lists each after edge once", () => {
    const edges = afterEdges(pack);
    assert.deepEqual(
      edges.map((e) => `${e.from}>${e.to}`),
      ["drop>intent", "nav>drop", "nav>side", "side>intent"],
    );
  });

  it("dedupes contrast pairs", () => {
    const pairs = contrastPairs(pack);
    assert.equal(pairs.length, 1);
    assert.equal(pairs[0]?.a, "nav");
    assert.equal(pairs[0]?.b, "side");
  });

  it("orders nodes so earlier questions come first", () => {
    assert.deepEqual(
      graphNodes(pack).map((s) => s.slug),
      ["nav", "orphan", "drop", "side", "intent"],
    );
  });

  it("layers the after-DAG", () => {
    assert.deepEqual(
      graphLevels(pack).map((level) => level.map((s) => s.slug)),
      [["nav", "orphan"], ["drop", "side"], ["intent"]],
    );
  });
});
