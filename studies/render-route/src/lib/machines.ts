import { classifyNativeRoute, readClosedJsonObject, validateComponentProps } from "@lightui/genui";
import type { RouteErrorCode, RouteSchemaError } from "@lightui/genui";

export type { RouteErrorCode };

export const SURFACES = ["text", "native", "iframe"] as const;

export type Surface = (typeof SURFACES)[number];

export type Degradation =
  | "partial-stream"
  | "unknown-component"
  | "invalid-props"
  | "invalid-document"
  | "invalid-surface";

export type Paint = Surface | "none" | "error";

export type PropField = {
  type: string;
  description?: string;
};

export type PropsSchema = {
  type: "object";
  additionalProperties: boolean;
  properties: Record<string, PropField>;
  required: readonly string[];
};

export type ComponentSchema = {
  name: string;
  description: string;
  props: PropsSchema;
};

export type Catalog = {
  protocol: "lightui.genui";
  version: string;
  components: readonly ComponentSchema[];
};

export type RouteDraft = {
  surface?: unknown;
  reason?: unknown;
  text?: unknown;
  component?: unknown;
  props?: unknown;
  document?: unknown;
};

export type SchemaError = RouteSchemaError;

export type RouteResult = {
  status: "pending" | "committed" | "degraded" | "error";
  surface: Surface | null;
  requested: Surface | null;
  text: string;
  reason: string;
  component: string | null;
  props: Record<string, unknown> | null;
  document: string | null;
  degradation: Degradation | null;
  errorCode: RouteErrorCode | null;
  errors: SchemaError[];
  requestedComponent: string | null;
  buffer: string;
};

export const MOUNTED_COMPONENTS = ["Text"] as const;

export function isSurface(value: unknown): value is Surface {
  return value === "text" || value === "native" || value === "iframe";
}

export function isMountedComponent(name: string): boolean {
  return (MOUNTED_COMPONENTS as readonly string[]).includes(name);
}

export function componentNames(catalog: Catalog): string[] {
  return catalog.components.map((component) => component.name);
}

export function validateProps(schema: PropsSchema, props: unknown): SchemaError[] {
  return validateComponentProps(schema, props);
}

export function routeTurn(draft: RouteDraft, catalog: Catalog): RouteResult {
  const requested = isSurface(draft.surface) ? draft.surface : null;
  const reason = stringOrEmpty(draft.reason);
  const text = typeof draft.text === "string" ? draft.text : "";
  const requestedComponent = typeof draft.component === "string" ? draft.component : null;

  if (!requested) {
    return degrade("invalid-surface", {
      requested,
      requestedComponent,
      text,
      reason,
    });
  }

  if (requested === "text") {
    if (typeof draft.text !== "string") {
      return degrade("invalid-surface", { requested, requestedComponent, text: "", reason });
    }
    return commit({
      surface: "text",
      requested,
      text,
      reason,
    });
  }

  if (requested === "native") {
    const decision = classifyNativeRoute(catalog.components, draft.component, draft.props);
    if (decision.status === "error") {
      return fail(
        decision.errorCode,
        decision.errorCode === "unknown_component" ? "unknown-component" : "invalid-props",
        {
          requested,
          requestedComponent: decision.requestedComponent,
          text,
          reason,
          errors: decision.errors,
        },
      );
    }
    return commit({
      surface: "native",
      requested,
      text,
      reason,
      component: decision.name,
      props: decision.props,
    });
  }

  if (typeof draft.document !== "string" || draft.document.trim() === "") {
    return degrade("invalid-document", { requested, requestedComponent, text, reason });
  }
  return commit({
    surface: "iframe",
    requested,
    text,
    reason,
    document: draft.document,
  });
}

export function routeBuffer(buffer: string, catalog: Catalog): RouteResult {
  const closed = readClosedJsonObject(buffer);
  if (closed.status === "pending") return pending(buffer);
  return routeTurn(closed.value, catalog);
}

export function paintSurface(result: RouteResult): Paint {
  if (result.status === "pending") return "none";
  if (result.status === "error") return "error";
  if (result.status === "committed" && result.surface === "native") return "native";
  if (result.status === "committed" && result.surface === "iframe") return "iframe";
  if (result.status === "committed" && result.surface === "text") return "text";
  if (result.status === "degraded") return "text";
  return "none";
}

export function committedNative(
  result: RouteResult,
): { name: string; props: Record<string, unknown> } | null {
  if (paintSurface(result) !== "native" || !result.component || !result.props) return null;
  return { name: result.component, props: result.props };
}

export function buildRoutePrompt(catalog: Catalog, request: string): { system: string; user: string } {
  const listed = catalog.components.map(
    (component) => `- ${component.name}: ${JSON.stringify(component.props)}`,
  );
  const system = [
    "You are the presentation router for one assistant turn.",
    "Reply with a single JSON object and no markdown.",
    `Protocol ${catalog.protocol} ${catalog.version}.`,
    "Native components you may emit, with their props schemas:",
    ...(listed.length > 0 ? listed : ["- (none)"]),
    "Choose exactly one surface:",
    '- "text" for prose. Put the answer in text.',
    '- "native" only when the answer is one listed component and the props validate. Set component and props.',
    '- "iframe" when the answer needs a layout or interaction the catalog cannot express. Put a complete HTML document in document, with no external network. Also set text to a one-sentence summary.',
    "Always include reason (one sentence) and text (a plain fallback).",
    "Do not emit a component name that is not listed above.",
    "Keys: surface, reason, text, component, props, document.",
  ].join("\n");
  return { system, user: request };
}

export function extractRouteJson(raw: string):
  | { ok: true; value: unknown }
  | { ok: false; error: string } {
  const trimmed = raw.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(trimmed);
  const body = fenced?.[1]?.trim() ?? trimmed;
  try {
    return { ok: true, value: JSON.parse(body) };
  } catch {
    return { ok: false, error: "model content is not JSON" };
  }
}

function stringOrEmpty(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function blank(): RouteResult {
  return {
    status: "pending",
    surface: null,
    requested: null,
    text: "",
    reason: "",
    component: null,
    props: null,
    document: null,
    degradation: null,
    errorCode: null,
    errors: [],
    requestedComponent: null,
    buffer: "",
  };
}

function pending(buffer: string): RouteResult {
  return { ...blank(), status: "pending", degradation: "partial-stream", buffer };
}

function commit(input: {
  surface: Surface;
  requested: Surface;
  text: string;
  reason: string;
  component?: string;
  props?: Record<string, unknown>;
  document?: string;
}): RouteResult {
  return {
    ...blank(),
    status: "committed",
    surface: input.surface,
    requested: input.requested,
    text: input.text,
    reason: input.reason,
    component: input.component ?? null,
    props: input.props ?? null,
    document: input.document ?? null,
    degradation: null,
  };
}

function fail(
  errorCode: RouteErrorCode,
  degradation: "unknown-component" | "invalid-props",
  input: {
    requested: Surface | null;
    requestedComponent: string | null;
    text: string;
    reason: string;
    errors?: SchemaError[];
  },
): RouteResult {
  return {
    ...blank(),
    status: "error",
    surface: null,
    requested: input.requested,
    text: input.text,
    reason: input.reason,
    degradation,
    errorCode,
    errors: input.errors ?? [],
    requestedComponent: input.requestedComponent,
  };
}

function degrade(
  degradation: Exclude<Degradation, "partial-stream">,
  input: {
    requested: Surface | null;
    requestedComponent: string | null;
    text: string;
    reason: string;
    errors?: SchemaError[];
  },
): RouteResult {
  return {
    ...blank(),
    status: "degraded",
    surface: "text",
    requested: input.requested,
    text: input.text,
    reason: input.reason,
    degradation,
    errors: input.errors ?? [],
    requestedComponent: input.requestedComponent,
  };
}
