export const ROUTE_ERROR_UNKNOWN_COMPONENT = "unknown_component" as const;
export const ROUTE_ERROR_INVALID_PROPS = "invalid_props" as const;

export const ROUTE_ERROR_CODES = [
  ROUTE_ERROR_UNKNOWN_COMPONENT,
  ROUTE_ERROR_INVALID_PROPS,
] as const;

export type RouteErrorCode = (typeof ROUTE_ERROR_CODES)[number];

export const ROUTE_ENVELOPE_IS_COMPONENT = false as const;
export const ROUTE_PARTIAL_JSON_IS_ERROR = false as const;
export const ROUTE_HOST_DISPLAY = "in-place" as const;
export const ROUTE_PARTIAL_JSON_ACTION = "wait-until-closed" as const;

export const RENDER_ROUTE_ERRORS = [
  {
    code: ROUTE_ERROR_UNKNOWN_COMPONENT,
    when: "The component name is not in the contract catalog.",
    host: ROUTE_HOST_DISPLAY,
    fallbackRoute: false as const,
    degradeToText: false as const,
  },
  {
    code: ROUTE_ERROR_INVALID_PROPS,
    when: "Props fail that component's schema.",
    host: ROUTE_HOST_DISPLAY,
    fallbackRoute: false as const,
    degradeToText: false as const,
  },
] as const;

export type ComponentPropsSchema = {
  type: "object";
  additionalProperties: boolean;
  properties: Readonly<Record<string, { readonly type: string; readonly description?: string }>>;
  required: readonly string[];
};

export type RouteComponentSchema = {
  name: string;
  props: ComponentPropsSchema;
};

export type RouteSchemaError = {
  path: string;
  code: "not-object" | "missing" | "unexpected" | "type";
  expected?: string;
  received?: string;
};

export type RouteHostError = {
  status: "error";
  errorCode: RouteErrorCode;
  display: typeof ROUTE_HOST_DISPLAY;
  surface: null;
  fallbackRoute: false;
  degradeToText: false;
  requestedComponent: string | null;
  errors: RouteSchemaError[];
};

export type NativeRouteCommit = {
  status: "commit";
  name: string;
  props: Record<string, unknown>;
};

export type ClosedJsonObject =
  | { status: "pending" }
  | { status: "closed"; value: Record<string, unknown> };

const TYPE_CHECK: Record<string, (value: unknown) => boolean> = {
  string: (value) => typeof value === "string",
  number: (value) => typeof value === "number" && Number.isFinite(value),
  integer: (value) => typeof value === "number" && Number.isInteger(value),
  boolean: (value) => typeof value === "boolean",
};

export function validateComponentProps(schema: ComponentPropsSchema, props: unknown): RouteSchemaError[] {
  if (!props || typeof props !== "object" || Array.isArray(props)) {
    return [{ path: "", code: "not-object", received: Array.isArray(props) ? "array" : typeof props }];
  }
  const record = props as Record<string, unknown>;
  const errors: RouteSchemaError[] = [];
  for (const key of schema.required) {
    if (!(key in record) || record[key] === undefined) {
      errors.push({ path: key, code: "missing" });
    }
  }
  for (const [key, value] of Object.entries(record)) {
    const field = schema.properties[key];
    if (!field) {
      if (schema.additionalProperties === false) {
        errors.push({ path: key, code: "unexpected" });
      }
      continue;
    }
    const check = TYPE_CHECK[field.type];
    if (!check || !check(value)) {
      errors.push({
        path: key,
        code: "type",
        expected: field.type,
        received: value === null ? "null" : typeof value,
      });
    }
  }
  return errors;
}

export function classifyNativeRoute(
  catalog: readonly RouteComponentSchema[],
  component: unknown,
  props: unknown,
): NativeRouteCommit | RouteHostError {
  const requestedComponent = typeof component === "string" ? component : null;
  const known = requestedComponent
    ? catalog.find((entry) => entry.name === requestedComponent)
    : undefined;
  if (!requestedComponent || !known) {
    return hostError(ROUTE_ERROR_UNKNOWN_COMPONENT, requestedComponent, []);
  }
  const errors = validateComponentProps(known.props, props);
  if (errors.length > 0) {
    return hostError(ROUTE_ERROR_INVALID_PROPS, requestedComponent, errors);
  }
  return {
    status: "commit",
    name: known.name,
    props: { ...(props as Record<string, unknown>) },
  };
}

/**
 * A partial JSON packet is not an error. Validation waits until the first
 * balanced object closes; trailing prose after that object is not part of the
 * packet and must not keep the turn pending forever.
 */
export function readClosedJsonObject(buffer: string): ClosedJsonObject {
  const candidate = closedObjectPrefix(buffer);
  if (!candidate) return { status: "pending" };
  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    return { status: "pending" };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { status: "pending" };
  }
  return { status: "closed", value: parsed as Record<string, unknown> };
}

/** The first complete top-level `{...}` in the buffer, or null while open. */
function closedObjectPrefix(buffer: string): string | null {
  const start = buffer.search(/\S/);
  if (start < 0 || buffer[start] !== "{") return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < buffer.length; i += 1) {
    const ch = buffer[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return buffer.slice(start, i + 1);
    }
  }
  return null;
}

function hostError(
  code: RouteErrorCode,
  requestedComponent: string | null,
  errors: RouteSchemaError[],
): RouteHostError {
  const spec = RENDER_ROUTE_ERRORS.find((item) => item.code === code) ?? RENDER_ROUTE_ERRORS[0];
  return {
    status: "error",
    errorCode: code,
    display: spec.host,
    surface: null,
    fallbackRoute: spec.fallbackRoute,
    degradeToText: spec.degradeToText,
    requestedComponent,
    errors,
  };
}
