import type { StudyLink, StudyMeta, StudyRel } from "./study";

export type NeighborRel = "before" | "after" | "contrast";

export type Neighbor = {
  slug: string;
  rel: NeighborRel;
  when?: string;
  whenEn?: string;
};

export type AfterEdge = {
  from: string;
  to: string;
  when?: string;
  whenEn?: string;
};

export type ContrastPair = {
  a: string;
  b: string;
  when?: string;
  whenEn?: string;
};

export function isStudyRel(value: unknown): value is StudyRel {
  return value === "after" || value === "contrast";
}

export function normalizeLinks(raw: unknown): StudyLink[] {
  if (!Array.isArray(raw)) return [];
  const out: StudyLink[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    if (typeof rec.slug !== "string" || !rec.slug) continue;
    if (!isStudyRel(rec.rel)) continue;
    const key = `${rec.rel}|${rec.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      slug: rec.slug,
      rel: rec.rel,
      when: typeof rec.when === "string" ? rec.when : undefined,
      whenEn: typeof rec.whenEn === "string" ? rec.whenEn : undefined,
    });
  }
  return out;
}

function known(studies: readonly StudyMeta[]): Map<string, StudyMeta> {
  return new Map(studies.map((study) => [study.slug, study]));
}

function addNeighbor(into: Neighbor[], seen: Set<string>, neighbor: Neighbor, self: string, slugs: Map<string, StudyMeta>) {
  if (neighbor.slug === self || !slugs.has(neighbor.slug)) return;
  const key = `${neighbor.rel}|${neighbor.slug}`;
  if (seen.has(key)) return;
  seen.add(key);
  into.push(neighbor);
}

export function neighborsOf(slug: string, studies: readonly StudyMeta[]): Neighbor[] {
  const slugs = known(studies);
  const self = slugs.get(slug);
  const out: Neighbor[] = [];
  const seen = new Set<string>();

  for (const link of normalizeLinks(self?.links)) {
    if (link.rel === "after") {
      addNeighbor(out, seen, { slug: link.slug, rel: "after", when: link.when, whenEn: link.whenEn }, slug, slugs);
    }
    if (link.rel === "contrast") {
      addNeighbor(out, seen, { slug: link.slug, rel: "contrast", when: link.when, whenEn: link.whenEn }, slug, slugs);
    }
  }

  for (const other of studies) {
    if (other.slug === slug) continue;
    for (const link of normalizeLinks(other.links)) {
      if (link.slug !== slug) continue;
      if (link.rel === "after") {
        addNeighbor(out, seen, { slug: other.slug, rel: "before", when: link.when, whenEn: link.whenEn }, slug, slugs);
      }
      if (link.rel === "contrast") {
        addNeighbor(out, seen, { slug: other.slug, rel: "contrast", when: link.when, whenEn: link.whenEn }, slug, slugs);
      }
    }
  }

  const rank: Record<NeighborRel, number> = { before: 0, after: 1, contrast: 2 };
  return out.sort((a, b) => rank[a.rel] - rank[b.rel] || a.slug.localeCompare(b.slug));
}

export function afterEdges(studies: readonly StudyMeta[]): AfterEdge[] {
  const slugs = known(studies);
  const edges: AfterEdge[] = [];
  const seen = new Set<string>();
  for (const study of studies) {
    for (const link of normalizeLinks(study.links)) {
      if (link.rel !== "after" || !slugs.has(link.slug) || link.slug === study.slug) continue;
      const key = `${study.slug}>${link.slug}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ from: study.slug, to: link.slug, when: link.when, whenEn: link.whenEn });
    }
  }
  return edges.sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to));
}

export function contrastPairs(studies: readonly StudyMeta[]): ContrastPair[] {
  const slugs = known(studies);
  const pairs: ContrastPair[] = [];
  const seen = new Set<string>();
  for (const study of studies) {
    for (const link of normalizeLinks(study.links)) {
      if (link.rel !== "contrast" || !slugs.has(link.slug) || link.slug === study.slug) continue;
      const [a, b] = [study.slug, link.slug].sort();
      const key = `${a}|${b}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push({ a, b, when: link.when, whenEn: link.whenEn });
    }
  }
  return pairs.sort((a, b) => a.a.localeCompare(b.a) || a.b.localeCompare(b.b));
}

/** Layers of the after-DAG: earlier questions on the left / top. */
export function graphLevels(studies: readonly StudyMeta[]): StudyMeta[][] {
  const edges = afterEdges(studies);
  const connected = new Set<string>();
  for (const study of studies) {
    if (study.asks || (study.links && study.links.length > 0)) connected.add(study.slug);
  }
  for (const edge of edges) {
    connected.add(edge.from);
    connected.add(edge.to);
  }

  const indeg = new Map<string, number>();
  for (const slug of connected) indeg.set(slug, 0);
  for (const edge of edges) {
    if (!connected.has(edge.from) || !connected.has(edge.to)) continue;
    indeg.set(edge.to, (indeg.get(edge.to) ?? 0) + 1);
  }

  const ready = [...connected].filter((slug) => (indeg.get(slug) ?? 0) === 0).sort();
  const seen = new Set<string>();
  const layers: string[][] = [];
  while (ready.length) {
    const level = ready.splice(0, ready.length);
    layers.push(level);
    for (const slug of level) {
      seen.add(slug);
      for (const edge of edges) {
        if (edge.from !== slug) continue;
        const next = (indeg.get(edge.to) ?? 0) - 1;
        indeg.set(edge.to, next);
        if (next === 0) ready.push(edge.to);
      }
    }
    ready.sort();
  }
  const leftover = [...connected].filter((slug) => !seen.has(slug)).sort();
  if (leftover.length) layers.push(leftover);

  const bySlug = known(studies);
  return layers
    .map((level) => level.map((slug) => bySlug.get(slug)).filter((meta): meta is StudyMeta => Boolean(meta)))
    .filter((level) => level.length > 0);
}

export function graphNodes(studies: readonly StudyMeta[]): StudyMeta[] {
  return graphLevels(studies).flat();
}

export type DualEdge = {
  key: string;
  from: string;
  to: string;
  type: "after" | "contrast";
  when?: string;
  whenEn?: string;
};

export function allGraphEdges(studies: readonly StudyMeta[]): DualEdge[] {
  const edges: DualEdge[] = [];
  for (const edge of afterEdges(studies)) {
    edges.push({
      key: `after:${edge.from}>${edge.to}`,
      from: edge.from,
      to: edge.to,
      type: "after",
      when: edge.when,
      whenEn: edge.whenEn,
    });
  }
  for (const pair of contrastPairs(studies)) {
    edges.push({
      key: `contrast:${pair.a}<>${pair.b}`,
      from: pair.a,
      to: pair.b,
      type: "contrast",
      when: pair.when,
      whenEn: pair.whenEn,
    });
  }
  return edges;
}

export type Lineage = {
  self: string;
  ancestors: Set<string>;
  descendants: Set<string>;
  directBefore: string[];
  directAfter: string[];
  contrasts: string[];
  allActiveNodes: Set<string>;
  allActiveEdges: Set<string>;
};

export function lineageOf(slug: string, studies: readonly StudyMeta[]): Lineage {
  const edges = afterEdges(studies);
  const contrasts = contrastPairs(studies)
    .filter((p) => p.a === slug || p.b === slug)
    .map((p) => (p.a === slug ? p.b : p.a));

  const directBefore: string[] = [];
  const directAfter: string[] = [];

  for (const e of edges) {
    if (e.to === slug) directBefore.push(e.from);
    if (e.from === slug) directAfter.push(e.to);
  }

  // BFS / DFS ancestors
  const ancestors = new Set<string>();
  const ancestorQueue = [...directBefore];
  while (ancestorQueue.length > 0) {
    const curr = ancestorQueue.shift()!;
    if (!ancestors.has(curr)) {
      ancestors.add(curr);
      for (const e of edges) {
        if (e.to === curr && !ancestors.has(e.from)) {
          ancestorQueue.push(e.from);
        }
      }
    }
  }

  // BFS / DFS descendants
  const descendants = new Set<string>();
  const descendantQueue = [...directAfter];
  while (descendantQueue.length > 0) {
    const curr = descendantQueue.shift()!;
    if (!descendants.has(curr)) {
      descendants.add(curr);
      for (const e of edges) {
        if (e.from === curr && !descendants.has(e.to)) {
          descendantQueue.push(e.to);
        }
      }
    }
  }

  const allActiveNodes = new Set<string>([
    slug,
    ...ancestors,
    ...descendants,
    ...contrasts,
  ]);

  const allActiveEdges = new Set<string>();
  for (const e of edges) {
    if (allActiveNodes.has(e.from) && allActiveNodes.has(e.to)) {
      allActiveEdges.add(`after:${e.from}>${e.to}`);
    }
  }
  for (const c of contrasts) {
    const [a, b] = [slug, c].sort();
    allActiveEdges.add(`contrast:${a}<>${b}`);
  }

  return {
    self: slug,
    ancestors,
    descendants,
    directBefore,
    directAfter,
    contrasts,
    allActiveNodes,
    allActiveEdges,
  };
}
