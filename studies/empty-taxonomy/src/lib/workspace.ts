import {
  SAMPLE_CUSTOMERS,
  SAMPLE_FOLLOWUPS,
  sceneCustomers,
  sceneFilters,
  sceneFollowUps,
  sceneQuery,
} from "./fixtures";
import {
  emptyCause,
  snapshotOf,
  type Customer,
  type EmptyCause,
  type FilterId,
  type FollowUp,
  type KindId,
  type LoadStatus,
  type ViewId,
} from "./machines";

export type WorkspaceState = {
  kind: KindId;
  view: ViewId;
  customers: Customer[];
  followUps: FollowUp[];
  query: string;
  filters: FilterId[];
  loadStatus: LoadStatus;
  composing: boolean;
  draftName: string;
  followTab: "today" | "history";
  filterOpen: boolean;
};

export type WorkspaceAction =
  | { type: "query"; query: string }
  | { type: "toggleFilter"; id: FilterId }
  | { type: "removeFilter"; id: FilterId }
  | { type: "filterOpen"; open: boolean }
  | { type: "setView"; view: ViewId }
  | { type: "openComposer" }
  | { type: "closeComposer" }
  | { type: "draftName"; name: string }
  | { type: "save" }
  | { type: "composeFromFollowups" }
  | { type: "import" }
  | { type: "loadStatus"; status: LoadStatus }
  | { type: "followTab"; tab: "today" | "history" }
  | { type: "complete"; id: string };

export function sceneSeed(kind: KindId): WorkspaceState {
  return {
    kind,
    view: kind === "done" ? "followups" : "customers",
    customers: sceneCustomers(kind),
    followUps: sceneFollowUps(kind),
    query: sceneQuery(kind),
    filters: sceneFilters(kind),
    loadStatus: kind === "error" ? "error" : "idle",
    composing: false,
    draftName: "",
    followTab: "today",
    filterOpen: false,
  };
}

export function causeOf(state: WorkspaceState): EmptyCause {
  return emptyCause(snapshotOf(state));
}

export function reduceWorkspace(
  state: WorkspaceState,
  action: WorkspaceAction,
): WorkspaceState {
  switch (action.type) {
    case "query":
      return { ...state, query: action.query };
    case "toggleFilter": {
      const on = state.filters.includes(action.id);
      return {
        ...state,
        filters: on
          ? state.filters.filter((id) => id !== action.id)
          : [...state.filters, action.id],
      };
    }
    case "removeFilter":
      return {
        ...state,
        filters: state.filters.filter((id) => id !== action.id),
      };
    case "filterOpen":
      return { ...state, filterOpen: action.open };
    case "setView":
      return {
        ...state,
        view: action.view,
        composing: false,
        filterOpen: false,
      };
    case "openComposer":
      return { ...state, composing: true, draftName: "", filterOpen: false };
    case "closeComposer":
      return { ...state, composing: false, draftName: "" };
    case "draftName":
      return { ...state, draftName: action.name };
    case "save": {
      const name = state.draftName.trim();
      if (!name) return state;
      const customer: Customer = {
        id: `c-new-${state.customers.length}`,
        name,
        phone: "",
        city: "shanghai",
        company: "",
        status: "follow",
        thisWeek: true,
      };
      return {
        ...state,
        customers: [customer, ...state.customers],
        composing: false,
        draftName: "",
      };
    }
    case "composeFromFollowups":
      return {
        ...state,
        view: "customers",
        composing: true,
        draftName: "",
        filterOpen: false,
      };
    case "import":
      return {
        ...state,
        customers: mergeById(SAMPLE_CUSTOMERS, state.customers),
        followUps: mergeById(SAMPLE_FOLLOWUPS, state.followUps),
      };
    case "loadStatus":
      return { ...state, loadStatus: action.status };
    case "followTab":
      return { ...state, followTab: action.tab };
    case "complete":
      return {
        ...state,
        followUps: state.followUps.map((item) =>
          item.id === action.id ? { ...item, done: true } : item,
        ),
      };
  }
}

function mergeById<T extends { id: string }>(samples: readonly T[], current: T[]): T[] {
  const have = new Set(current.map((item) => item.id));
  const extra = samples.filter((item) => !have.has(item.id)).map((item) => ({ ...item }));
  return extra.length ? [...extra, ...current] : current;
}
