import { SEED } from "./seed";

export const KIND_IDS = [
  "filter",
  "sort",
  "sticky",
  "actions",
  "columns",
  "bulk",
  "chips",
] as const;

export type KindId = (typeof KIND_IDS)[number];

export const STATUSES = ["待跟进", "已联系", "已完成"] as const;
export type Status = (typeof STATUSES)[number];

export const OWNERS = ["林悦", "陈晨", "周宁"] as const;
export type Owner = (typeof OWNERS)[number];

export const TAGS = ["重点客户", "零售", "餐饮", "家居", "服务", "住宿"] as const;
export type Tag = (typeof TAGS)[number];

export type FacetKey = "tags" | "owners" | "statuses";

export type Customer = {
  id: string;
  name: string;
  tags: Tag[];
  amount: number;
  owner: Owner;
  status: Status;
  updatedAt: string;
  note: string;
};

export type Facets = {
  tags: Tag[];
  owners: Owner[];
  statuses: Status[];
};

export type SortDir = "none" | "asc" | "desc";

export const COLUMN_KEYS = ["name", "tags", "amount", "owner", "status", "updatedAt"] as const;
export type ColumnKey = (typeof COLUMN_KEYS)[number];

export type Visibility = Record<ColumnKey, boolean>;

export const DEFAULT_VISIBILITY: Visibility = {
  name: true,
  tags: true,
  amount: true,
  owner: true,
  status: true,
  updatedAt: false,
};

export const ROW_ACTIONS = ["view", "edit", "duplicate", "delete"] as const;
export type RowAction = (typeof ROW_ACTIONS)[number];

export type Panel =
  | { type: "none" }
  | { type: "facet"; facet: FacetKey }
  | { type: "columns" }
  | { type: "row"; id: string }
  | { type: "bulk"; which: "status" | "owner" };

export type DialogMode = "view" | "edit" | "create" | "delete";

export type DialogState = { mode: DialogMode; id: string | null } | null;

export type Flash =
  | null
  | { code: "copied"; name: string }
  | { code: "saved"; name: string }
  | { code: "created"; name: string }
  | { code: "deleted"; name: string }
  | { code: "bulk-status"; count: number; status: Status }
  | { code: "bulk-owner"; count: number; owner: Owner }
  | { code: "reset" };

export type DeskState = {
  rows: Customer[];
  query: string;
  facets: Facets;
  sort: SortDir;
  selected: string[];
  visibility: Visibility;
  panel: Panel;
  draft: string[];
  dialog: DialogState;
  flash: Flash;
};

export type Chip = { facet: FacetKey; value: string };

export type MissCause = "none" | "query" | "facets" | "both" | "first-use";

export type DeskAction =
  | { type: "query"; query: string }
  | { type: "cycleSort" }
  | { type: "openFacet"; facet: FacetKey }
  | { type: "toggleDraft"; value: string }
  | { type: "resetDraft" }
  | { type: "applyDraft" }
  | { type: "removeChip"; facet: FacetKey; value: string }
  | { type: "clearFacets" }
  | { type: "toggleColumn"; key: ColumnKey }
  | { type: "toggleRow"; id: string }
  | { type: "toggleAllVisible" }
  | { type: "clearSelection" }
  | { type: "bulkStatus"; status: Status; updatedAt: string }
  | { type: "bulkOwner"; owner: Owner; updatedAt: string }
  | { type: "openRow"; id: string }
  | { type: "openColumns" }
  | { type: "openBulk"; which: "status" | "owner" }
  | { type: "closePanel" }
  | { type: "openDialog"; mode: DialogMode; id: string | null }
  | { type: "closeDialog" }
  | { type: "save"; customer: Customer }
  | { type: "remove"; id: string }
  | { type: "duplicate"; id: string; nextId: string; updatedAt: string }
  | { type: "reset" }
  | { type: "prime"; kind: KindId };

const STAGE_STATES: Record<KindId, readonly string[]> = {
  filter: ["open", "closed"],
  sort: ["desc", "asc", "none"],
  sticky: ["scrolled", "top"],
  actions: ["open", "closed"],
  columns: ["open", "closed"],
  bulk: ["selected", "idle"],
  chips: ["applied", "clear"],
};

export const STICKY_SCROLL_TOP = 140;

export function isKindId(value: string): value is KindId {
  return (KIND_IDS as readonly string[]).includes(value);
}

export function resolveState(kind: KindId, state: string): string {
  const allowed = STAGE_STATES[kind];
  return allowed.includes(state) ? state : allowed[0]!;
}

export function stageScroll(kind: KindId, state: string): { top: number; left: number } {
  if (kind === "sticky" && resolveState(kind, state) === "scrolled") {
    return { top: STICKY_SCROLL_TOP, left: 0 };
  }
  return { top: 0, left: 0 };
}

export function emptyFacets(): Facets {
  return { tags: [], owners: [], statuses: [] };
}

export function isTag(value: string): value is Tag {
  return (TAGS as readonly string[]).includes(value);
}

export function isOwner(value: string): value is Owner {
  return (OWNERS as readonly string[]).includes(value);
}

export function isStatus(value: string): value is Status {
  return (STATUSES as readonly string[]).includes(value);
}

function cloneCustomer(row: Customer): Customer {
  return { ...row, tags: [...row.tags] };
}

export function resting(rows: readonly Customer[] = SEED): DeskState {
  return {
    rows: rows.map(cloneCustomer),
    query: "",
    facets: emptyFacets(),
    sort: "none",
    selected: [],
    visibility: { ...DEFAULT_VISIBILITY },
    panel: { type: "none" },
    draft: [],
    dialog: null,
    flash: null,
  };
}

/** Header filter: OR inside one facet, AND across facets. Name query is separate. */
export function rowMatches(row: Customer, facets: Facets, query: string): boolean {
  const q = query.trim();
  if (q && !row.name.includes(q)) return false;
  if (facets.tags.length > 0 && !facets.tags.some((tag) => row.tags.includes(tag))) return false;
  if (facets.owners.length > 0 && !facets.owners.includes(row.owner)) return false;
  if (facets.statuses.length > 0 && !facets.statuses.includes(row.status)) return false;
  return true;
}

/** none → high-to-low → low-to-high → none. Order only; the set stays. */
export function cycleSort(dir: SortDir): SortDir {
  if (dir === "none") return "desc";
  if (dir === "desc") return "asc";
  return "none";
}

export function visibleCustomers(
  rows: readonly Customer[],
  facets: Facets,
  query: string,
  sort: SortDir,
): Customer[] {
  const filtered = rows.filter((row) => rowMatches(row, facets, query));
  if (sort === "none") return filtered;
  const dir = sort === "asc" ? 1 : -1;
  return filtered
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const delta = a.row.amount - b.row.amount;
      if (delta !== 0) return delta * dir;
      return a.index - b.index;
    })
    .map((item) => item.row);
}

export function visibleIds(state: DeskState): string[] {
  return visibleIdList(state.rows, state.facets, state.query, state.sort);
}

export function chipsOf(facets: Facets): Chip[] {
  return [
    ...facets.tags.map((value) => ({ facet: "tags" as const, value })),
    ...facets.owners.map((value) => ({ facet: "owners" as const, value })),
    ...facets.statuses.map((value) => ({ facet: "statuses" as const, value })),
  ];
}

export function removeChip(facets: Facets, facet: FacetKey, value: string): Facets {
  if (facet === "tags") return { ...facets, tags: facets.tags.filter((tag) => tag !== value) };
  if (facet === "owners") return { ...facets, owners: facets.owners.filter((owner) => owner !== value) };
  return { ...facets, statuses: facets.statuses.filter((status) => status !== value) };
}

export function clearFacets(): Facets {
  return emptyFacets();
}

export function writeFacet(facets: Facets, facet: FacetKey, values: readonly string[]): Facets {
  if (facet === "tags") return { ...facets, tags: values.filter(isTag) };
  if (facet === "owners") return { ...facets, owners: values.filter(isOwner) };
  return { ...facets, statuses: values.filter(isStatus) };
}

/** Column key `owner` / `status` filters the facet `owners` / `statuses`. */
export function facetOfColumn(key: ColumnKey): FacetKey | null {
  switch (key) {
    case "tags":
      return "tags";
    case "owner":
      return "owners";
    case "status":
      return "statuses";
    default:
      return null;
  }
}

export function columnOn(visibility: Visibility, key: ColumnKey): boolean {
  if (key === "name") return true;
  return visibility[key];
}

export function toggleColumn(visibility: Visibility, key: ColumnKey): Visibility {
  if (key === "name") return { ...visibility, name: true };
  return { ...visibility, name: true, [key]: !visibility[key] };
}

export function bulkVisible(selectedCount: number): boolean {
  return selectedCount > 0;
}

export function selectionMark(
  selected: readonly string[],
  visible: readonly string[],
): "none" | "some" | "all" {
  if (visible.length === 0) return "none";
  const picked = new Set(selected);
  let count = 0;
  for (const id of visible) if (picked.has(id)) count += 1;
  if (count === 0) return "none";
  if (count === visible.length) return "all";
  return "some";
}

export function toggleVisible(
  selected: readonly string[],
  visible: readonly string[],
  on: boolean,
): string[] {
  const vis = new Set(visible);
  if (on) {
    const next = [...selected];
    for (const id of visible) if (!next.includes(id)) next.push(id);
    return next;
  }
  return selected.filter((id) => !vis.has(id));
}

export function retainVisible(selected: readonly string[], visible: readonly string[]): string[] {
  const vis = new Set(visible);
  return selected.filter((id) => vis.has(id));
}

export function actionPlace(action: RowAction): "primary" | "overflow" {
  return action === "view" ? "primary" : "overflow";
}

export function actionTone(action: RowAction): "default" | "danger" {
  return action === "delete" ? "danger" : "default";
}

export function duplicateCustomer(row: Customer, id: string, updatedAt: string): Customer {
  return {
    ...row,
    tags: [...row.tags],
    id,
    name: `${row.name}（副本）`,
    status: "待跟进",
    updatedAt,
  };
}

export function patchRows(
  rows: readonly Customer[],
  ids: readonly string[],
  patch: { status?: Status; owner?: Owner },
  updatedAt: string,
): Customer[] {
  const picked = new Set(ids);
  return rows.map((row) => {
    if (!picked.has(row.id)) return row;
    return { ...row, tags: [...row.tags], ...patch, updatedAt };
  });
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US").format(amount);
}

export function todayStamp(date = new Date()): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseAmount(raw: string): number | null {
  const text = raw.trim();
  if (!/^\d+$/.test(text)) return null;
  return Number(text);
}

export function canSaveCustomer(name: string, amount: string): boolean {
  return name.trim().length > 0 && parseAmount(amount) !== null;
}

export function filterOptions(
  options: readonly string[],
  query: string,
  label: (value: string) => string,
): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...options];
  return options.filter((value) => value.toLowerCase().includes(q) || label(value).toLowerCase().includes(q));
}

export function missCause(total: number, visible: number, facets: Facets, query: string): MissCause {
  if (visible > 0) return "none";
  const hasFacets = chipsOf(facets).length > 0;
  const hasQuery = query.trim().length > 0;
  if (hasFacets && hasQuery) return "both";
  if (hasFacets) return "facets";
  if (hasQuery) return "query";
  if (total === 0) return "first-use";
  return "none";
}

export function sameSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(b);
  return a.every((value) => set.has(value));
}

export function draftPending(state: DeskState): boolean {
  if (state.panel.type !== "facet") return false;
  return !sameSet(state.draft, state.facets[state.panel.facet]);
}

function visibleIdList(
  rows: readonly Customer[],
  facets: Facets,
  query: string,
  sort: SortDir,
): string[] {
  return visibleCustomers(rows, facets, query, sort).map((row) => row.id);
}

function withView(state: DeskState, facets: Facets, query: string): DeskState {
  return {
    ...state,
    facets,
    query,
    selected: retainVisible(state.selected, visibleIdList(state.rows, facets, query, state.sort)),
  };
}

function withRows(state: DeskState, rows: Customer[]): DeskState {
  return {
    ...state,
    rows,
    selected: retainVisible(state.selected, visibleIdList(rows, state.facets, state.query, state.sort)),
  };
}

export function prime(kind: KindId, state: DeskState): DeskState {
  const next: DeskState = {
    ...state,
    facets: {
      tags: [...state.facets.tags],
      owners: [...state.facets.owners],
      statuses: [...state.facets.statuses],
    },
    selected: [...state.selected],
    visibility: { ...state.visibility, name: true },
    panel: { type: "none" },
    draft: [],
    dialog: null,
    flash: null,
  };
  const ids = visibleIds(next);
  switch (kind) {
    case "filter":
      return { ...next, panel: { type: "facet", facet: "tags" }, draft: [...next.facets.tags] };
    case "sort":
      return { ...next, sort: next.sort === "none" ? "desc" : next.sort };
    case "sticky":
      return next;
    case "actions":
      return ids[0] ? { ...next, panel: { type: "row", id: ids[0] } } : next;
    case "columns":
      return { ...next, panel: { type: "columns" } };
    case "bulk":
      return { ...next, selected: next.selected.length > 0 ? next.selected : ids.slice(0, 2) };
    case "chips": {
      const facets: Facets =
        chipsOf(next.facets).length > 0 ? next.facets : { ...next.facets, tags: ["重点客户"] };
      const selected = retainVisible(
        next.selected,
        visibleCustomers(next.rows, facets, next.query, next.sort).map((row) => row.id),
      );
      return { ...next, facets, selected };
    }
    default: {
      const unreachable: never = kind;
      return unreachable;
    }
  }
}

export function stageDesk(kind: KindId, state: string): DeskState {
  const base = resting();
  const resolved = resolveState(kind, state);
  switch (kind) {
    case "filter":
      if (resolved === "open") {
        return { ...base, panel: { type: "facet", facet: "tags" }, draft: ["重点客户"] };
      }
      return base;
    case "sort":
      return { ...base, sort: resolved === "asc" || resolved === "desc" ? resolved : "none" };
    case "sticky":
      return base;
    case "actions":
      if (resolved === "open") return { ...base, panel: { type: "row", id: base.rows[0]!.id } };
      return base;
    case "columns":
      if (resolved === "open") return { ...base, panel: { type: "columns" } };
      return base;
    case "bulk":
      if (resolved === "selected") return { ...base, selected: [base.rows[0]!.id, base.rows[2]!.id] };
      return base;
    case "chips":
      if (resolved === "applied") {
        return { ...base, facets: { tags: ["重点客户"], owners: [], statuses: ["待跟进"] } };
      }
      return base;
    default: {
      const unreachable: never = kind;
      return unreachable;
    }
  }
}

export function reduceDesk(state: DeskState, action: DeskAction): DeskState {
  switch (action.type) {
    case "query":
      return withView(state, state.facets, action.query);
    case "cycleSort":
      return { ...state, sort: cycleSort(state.sort) };
    case "openFacet":
      if (state.panel.type === "facet" && state.panel.facet === action.facet) {
        return { ...state, panel: { type: "none" }, draft: [] };
      }
      return {
        ...state,
        panel: { type: "facet", facet: action.facet },
        draft: [...state.facets[action.facet]],
        flash: null,
      };
    case "toggleDraft":
      if (state.panel.type !== "facet") return state;
      return {
        ...state,
        draft: state.draft.includes(action.value)
          ? state.draft.filter((value) => value !== action.value)
          : [...state.draft, action.value],
      };
    case "resetDraft":
      return state.panel.type === "facet" ? { ...state, draft: [] } : state;
    case "applyDraft": {
      if (state.panel.type !== "facet") return state;
      const facets = writeFacet(state.facets, state.panel.facet, state.draft);
      return {
        ...withView(state, facets, state.query),
        panel: { type: "none" },
        draft: [],
      };
    }
    case "removeChip":
      return {
        ...withView(state, removeChip(state.facets, action.facet, action.value), state.query),
        panel: state.panel.type === "facet" ? { type: "none" } : state.panel,
        draft: [],
      };
    case "clearFacets":
      return { ...withView(state, clearFacets(), state.query), panel: { type: "none" }, draft: [] };
    case "toggleColumn":
      return { ...state, visibility: toggleColumn(state.visibility, action.key) };
    case "toggleRow": {
      const selected = state.selected.includes(action.id)
        ? state.selected.filter((id) => id !== action.id)
        : [...state.selected, action.id];
      return { ...state, selected };
    }
    case "toggleAllVisible": {
      const visible = visibleIds(state);
      const mark = selectionMark(state.selected, visible);
      return { ...state, selected: toggleVisible(state.selected, visible, mark !== "all") };
    }
    case "clearSelection":
      return { ...state, selected: [], panel: state.panel.type === "bulk" ? { type: "none" } : state.panel };
    case "bulkStatus":
      return {
        ...withRows(state, patchRows(state.rows, state.selected, { status: action.status }, action.updatedAt)),
        panel: { type: "none" },
        flash: { code: "bulk-status", count: state.selected.length, status: action.status },
      };
    case "bulkOwner":
      return {
        ...withRows(state, patchRows(state.rows, state.selected, { owner: action.owner }, action.updatedAt)),
        panel: { type: "none" },
        flash: { code: "bulk-owner", count: state.selected.length, owner: action.owner },
      };
    case "openRow":
      if (state.panel.type === "row" && state.panel.id === action.id) {
        return { ...state, panel: { type: "none" } };
      }
      return { ...state, panel: { type: "row", id: action.id }, draft: [], flash: null };
    case "openColumns":
      return state.panel.type === "columns"
        ? { ...state, panel: { type: "none" } }
        : { ...state, panel: { type: "columns" }, draft: [], flash: null };
    case "openBulk":
      if (state.panel.type === "bulk" && state.panel.which === action.which) {
        return { ...state, panel: { type: "none" } };
      }
      return { ...state, panel: { type: "bulk", which: action.which }, draft: [], flash: null };
    case "closePanel":
      return { ...state, panel: { type: "none" }, draft: [] };
    case "openDialog":
      return {
        ...state,
        dialog: { mode: action.mode, id: action.id },
        panel: { type: "none" },
        draft: [],
      };
    case "closeDialog":
      return { ...state, dialog: null };
    case "save": {
      const exists = state.rows.some((row) => row.id === action.customer.id);
      const rows = exists
        ? state.rows.map((row) => (row.id === action.customer.id ? cloneCustomer(action.customer) : row))
        : [cloneCustomer(action.customer), ...state.rows];
      return {
        ...withRows(state, rows),
        dialog: null,
        panel: { type: "none" },
        draft: [],
        flash: { code: exists ? "saved" : "created", name: action.customer.name },
      };
    }
    case "remove":
      return {
        ...state,
        rows: state.rows.filter((row) => row.id !== action.id),
        selected: state.selected.filter((id) => id !== action.id),
        dialog: null,
        panel: { type: "none" },
        flash: {
          code: "deleted",
          name: state.rows.find((row) => row.id === action.id)?.name ?? "",
        },
      };
    case "duplicate": {
      const src = state.rows.find((row) => row.id === action.id);
      if (!src) return state;
      const copy = duplicateCustomer(src, action.nextId, action.updatedAt);
      return {
        ...state,
        rows: [copy, ...state.rows],
        panel: { type: "none" },
        flash: { code: "copied", name: src.name },
      };
    }
    case "reset":
      return { ...resting(), flash: { code: "reset" } };
    case "prime":
      return prime(action.kind, state);
    default: {
      const unreachable: never = action;
      return unreachable;
    }
  }
}
