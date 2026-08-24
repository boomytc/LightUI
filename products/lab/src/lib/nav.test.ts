import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { backHref, canPopHistory, parseRoute, readFrom, routePath } from "./nav";

describe("parseRoute", () => {
  it("maps the catalog surfaces", () => {
    assert.deepEqual(parseRoute("/"), { name: "home" });
    assert.deepEqual(parseRoute("/studies"), { name: "studies" });
    assert.deepEqual(parseRoute("/graph"), { name: "graph" });
    assert.deepEqual(parseRoute("/notes"), { name: "notes" });
  });

  it("maps a study and its stage before a missing page", () => {
    assert.deepEqual(parseRoute("/s/dropdown-taxonomy"), { name: "study", slug: "dropdown-taxonomy" });
    assert.deepEqual(parseRoute("/s/dropdown-taxonomy/stage"), { name: "stage", slug: "dropdown-taxonomy" });
    assert.deepEqual(parseRoute("/s/dropdown-taxonomy/stage/"), { name: "stage", slug: "dropdown-taxonomy" });
  });

  it("maps a note and treats an unknown path as missing", () => {
    assert.deepEqual(parseRoute("/notes/name-the-dropdown"), { name: "note", slug: "name-the-dropdown" });
    assert.deepEqual(parseRoute("/about"), { name: "missing", path: "/about" });
    assert.deepEqual(parseRoute("/s/dropdown-taxonomy/gallery"), {
      name: "missing",
      path: "/s/dropdown-taxonomy/gallery",
    });
  });
});

describe("routePath", () => {
  it("drops query and hash before matching a route", () => {
    assert.equal(routePath("/graph#intent-cascade"), "/graph");
    assert.equal(routePath("/notes/name-the-button?x=1"), "/notes/name-the-button");
    assert.equal(routePath("/"), "/");
  });
});

describe("readFrom", () => {
  it("reads the previous href off a lab history state", () => {
    assert.equal(readFrom({ lab: true, from: "/notes/name-the-button" }), "/notes/name-the-button");
    assert.equal(readFrom({ lab: true, from: "/graph#button-taxonomy" }), "/graph#button-taxonomy");
  });

  it("ignores empty or foreign state", () => {
    assert.equal(readFrom(null), null);
    assert.equal(readFrom({ lab: true, from: "" }), null);
    assert.equal(readFrom({ from: "/studies" }), null);
    assert.equal(readFrom({ lab: true }), null);
  });
});

describe("backHref", () => {
  it("returns the previous in-app page and keeps its hash", () => {
    assert.equal(backHref("/notes/name-the-button", "/studies"), "/notes/name-the-button");
    assert.equal(backHref("/graph#intent-cascade", "/studies"), "/graph#intent-cascade");
    assert.equal(backHref("/", "/studies"), "/");
    assert.equal(backHref("/s/control-taxonomy", "/studies"), "/s/control-taxonomy");
  });

  it("falls back when there is no previous app page", () => {
    assert.equal(backHref(null, "/studies"), "/studies");
    assert.equal(backHref("/about", "/notes"), "/notes");
  });

  it("pops history when the previous page is the fallback itself", () => {
    assert.equal(canPopHistory("/studies", "/studies", "/s/button-taxonomy"), true);
    assert.equal(canPopHistory("/notes/name-the-button", "/studies", "/s/button-taxonomy"), true);
    assert.equal(canPopHistory(null, "/studies", "/s/button-taxonomy"), false);
    assert.equal(canPopHistory("/about", "/studies", "/s/button-taxonomy"), false);
  });
});
