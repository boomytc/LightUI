import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseRoute } from "./nav";

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
