export type KindId = "first-use" | "search" | "filter" | "error" | "done";

export const KIND_IDS: readonly KindId[] = [
  "first-use",
  "search",
  "filter",
  "error",
  "done",
];

export type ViewId = "customers" | "followups";

export type LoadStatus = "idle" | "error" | "loading" | "success";

export type FilterId =
  | "shanghai"
  | "beijing"
  | "this-week"
  | "follow"
  | "contacted"
  | "closed";

export type CityId = "shanghai" | "beijing" | "hangzhou";

export type CustomerStatus = "follow" | "contacted" | "closed";

export type EmptyCause = KindId | "populated";

export type EmptyAction =
  | "create"
  | "revise-query"
  | "loosen-filter"
  | "retry"
  | "celebrate"
  | "none";

export type StageState = "empty" | "miss" | "banner" | "clear";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  city: CityId;
  company: string;
  status: CustomerStatus;
  thisWeek: boolean;
};

export type FollowUp = {
  id: string;
  customerId: string;
  titleZh: string;
  titleEn: string;
  done: boolean;
};

export type Snapshot = {
  view: ViewId;
  records: number;
  visible: number;
  query: string;
  filters: number;
  loadStatus: LoadStatus;
  pending: number;
  history: number;
};

export function isKindId(value: string): value is KindId {
  return (KIND_IDS as readonly string[]).includes(value);
}

/**
 * Why this view looks empty. Order is the rule:
 * error beats empty; search beats filter; done needs history.
 */
export function emptyCause(snap: Snapshot): EmptyCause {
  if (snap.view === "followups") {
    if (snap.pending === 0 && snap.history === 0) return "first-use";
    if (snap.pending === 0 && snap.history > 0) return "done";
    return "populated";
  }

  if (snap.loadStatus === "error") return "error";
  if (snap.records === 0) return "first-use";
  if (snap.query.trim().length > 0 && snap.visible === 0) return "search";
  if (snap.filters > 0 && snap.visible === 0) return "filter";
  return "populated";
}

export function emptyAction(cause: EmptyCause): EmptyAction {
  switch (cause) {
    case "first-use":
      return "create";
    case "search":
      return "revise-query";
    case "filter":
      return "loosen-filter";
    case "error":
      return "retry";
    case "done":
      return "celebrate";
    case "populated":
      return "none";
  }
}

/** A primary create button is only for a library that has never started. */
export function showsPrimaryCta(cause: EmptyCause): boolean {
  return emptyAction(cause) === "create";
}

/** A failed refresh must not wipe the last list. */
export function keepsExistingList(cause: EmptyCause): boolean {
  return cause === "error" || cause === "populated";
}

export function preservesQuery(cause: EmptyCause): boolean {
  return cause === "search";
}

export function preservesFilters(cause: EmptyCause): boolean {
  return cause === "filter";
}

export function isTrulyEmpty(cause: EmptyCause): boolean {
  return (
    cause === "first-use" ||
    cause === "search" ||
    cause === "filter" ||
    cause === "done"
  );
}

export function defaultStageState(kind: KindId): StageState {
  switch (kind) {
    case "first-use":
      return "empty";
    case "search":
    case "filter":
      return "miss";
    case "error":
      return "banner";
    case "done":
      return "clear";
  }
}

/** Each kind has one diagnostic fixture. Any other `state` param falls back to it. */
export function stageState(raw: string, kind: KindId): StageState {
  const expected = defaultStageState(kind);
  return raw === expected ? raw : expected;
}

export function customerMatchesFilters(
  customer: Customer,
  filters: readonly FilterId[],
): boolean {
  return filters.every((filter) => {
    if (filter === "shanghai" || filter === "beijing") return customer.city === filter;
    if (filter === "this-week") return customer.thisWeek;
    return customer.status === filter;
  });
}

export function customerMatchesQuery(customer: Customer, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    customer.name.toLowerCase().includes(q) ||
    customer.phone.includes(q.replace(/\s/g, ""))
  );
}

export function visibleCustomers(
  customers: readonly Customer[],
  query: string,
  filters: readonly FilterId[],
): Customer[] {
  return customers.filter(
    (customer) =>
      customerMatchesQuery(customer, query) &&
      customerMatchesFilters(customer, filters),
  );
}

export function snapshotOf(input: {
  view: ViewId;
  customers: readonly Customer[];
  followUps: readonly FollowUp[];
  query: string;
  filters: readonly FilterId[];
  loadStatus: LoadStatus;
}): Snapshot {
  const visible = visibleCustomers(input.customers, input.query, input.filters);
  return {
    view: input.view,
    records: input.customers.length,
    visible: visible.length,
    query: input.query,
    filters: input.filters.length,
    loadStatus: input.loadStatus,
    pending: input.followUps.filter((item) => !item.done).length,
    history: input.followUps.filter((item) => item.done).length,
  };
}
