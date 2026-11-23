export const ROUTE_ERROR_UNKNOWN_COMPONENT = "unknown_component" as const;
export const ROUTE_ERROR_INVALID_PROPS = "invalid_props" as const;

export const ROUTE_ERROR_CODES = [
  ROUTE_ERROR_UNKNOWN_COMPONENT,
  ROUTE_ERROR_INVALID_PROPS,
] as const;

export type RouteErrorCode = (typeof ROUTE_ERROR_CODES)[number];

export const ROUTE_SURFACES = ["text", "native", "iframe"] as const;
export type RouteSurface = (typeof ROUTE_SURFACES)[number];

export const ROUTE_ENVELOPE_IS_COMPONENT = false as const;
export const ROUTE_PARTIAL_JSON_IS_ERROR = false as const;
export const ROUTE_HOST_DISPLAY = "in-place" as const;
export const ROUTE_PARTIAL_JSON_ACTION = "wait-until-closed" as const;

export const ROUTE_CODE_FENCE = {
  optional: true,
  strip: true,
  languages: ["", "json"],
} as const;

export const ROUTE_ENVELOPE = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  properties: {
    surface: {
      type: "string",
      enum: ["text", "native", "iframe"],
      description: "Target surface for this turn: text, native, or iframe.",
    },
    reason: {
      type: "string",
      description: "One-sentence rationale for choosing this surface.",
    },
    text: {
      type: "string",
      description: "Plain-text response or fallback summary.",
    },
    component: {
      type: "string",
      description: "Native component name from components.json when surface is native.",
    },
    props: {
      type: "object",
      description: "Props object validated against the named component schema when surface is native.",
    },
    document: {
      type: "string",
      description: "Self-contained HTML document when surface is iframe.",
    },
  },
  required: ["surface"],
} as const;

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

export const SUPPORTED_PROP_TYPES = [
  "string",
  "number",
  "integer",
  "boolean",
  "array",
  "object",
] as const;

export type SupportedPropType = (typeof SUPPORTED_PROP_TYPES)[number];

export type PropFieldSchema = {
  readonly type: string;
  readonly description?: string;
  readonly enum?: readonly unknown[];
  readonly items?: PropFieldSchema;
  readonly properties?: Readonly<Record<string, PropFieldSchema>>;
  readonly required?: readonly string[];
  readonly additionalProperties?: boolean;
};

export type ComponentPropsSchema = {
  readonly type: "object";
  readonly additionalProperties: boolean;
  readonly properties: Readonly<Record<string, PropFieldSchema>>;
  readonly required: readonly string[];
};

export type RouteComponentSchema = {
  readonly name: string;
  readonly props: ComponentPropsSchema;
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
  | { status: "closed"; value: Record<string, unknown> }
  | { status: "malformed"; raw: string; reason: string };

const TYPE_CHECK: Readonly<Record<SupportedPropType, (value: unknown) => boolean>> = {
  string: (value) => typeof value === "string",
  number: (value) => typeof value === "number" && Number.isFinite(value),
  integer: (value) => typeof value === "number" && Number.isInteger(value),
  boolean: (value) => typeof value === "boolean",
  array: (value) => Array.isArray(value),
  object: (value) => value !== null && typeof value === "object" && !Array.isArray(value),
};

const OPENING_JSON_FENCE = /^\s*```(?:json)?(?:[ \t]*\r?\n|[ \t]+(?=\{))/i;
const PENDING_JSON_FENCE = /^\s*(?:`{1,3}|```(?:j(?:s(?:o(?:n)?)?)?)?[ \t]*)$/i;

/**
 * Strips a leading BOM and an optional Markdown ``` / ```json code fence.
 * A trailing closing ``` fence is only removed once a top-level JSON object closes,
 * so backticks inside an incomplete streamed string are never truncated.
 */
export function stripJsonCodeFence(source: string): string {
  const withoutBom = source.replace(/^\uFEFF/, "");
  const open = OPENING_JSON_FENCE.exec(withoutBom);
  if (!open) return withoutBom;
  const body = withoutBom.slice(open[0].length);
  const closed = closedObjectPrefix(body);
  if (!closed) return body;
  const start = body.search(/\S/);
  const after = body.slice(start + closed.length);
  if (/^\s*```[ \t]*\s*$/.test(after)) return body.slice(0, start + closed.length);
  return body;
}

/** True while the buffer only contains an incomplete opening ``` / ```json fence. */
export function isPendingJsonFence(source: string): boolean {
  const withoutBom = source.replace(/^\uFEFF/, "");
  return PENDING_JSON_FENCE.test(withoutBom);
}

export function validateComponentProps(schema: ComponentPropsSchema, props: unknown): RouteSchemaError[] {
  if (!isPlainObject(props)) {
    return [{ path: "", code: "not-object", received: describeValueType(props) }];
  }
  const errors: RouteSchemaError[] = [];
  validateObjectAgainstSchema(schema, props, "", errors);
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
 * packet and must not keep the turn pending forever. A balanced object whose
 * syntax fails JSON.parse resolves to `malformed` instead of remaining pending.
 */
export function readClosedJsonObject(buffer: string): ClosedJsonObject {
  const withoutBom = buffer.replace(/^\uFEFF/, "");
  if (!/\S/.test(withoutBom)) return { status: "pending" };
  if (isPendingJsonFence(withoutBom)) return { status: "pending" };

  const normalized = stripJsonCodeFence(withoutBom);
  const start = normalized.search(/\S/);
  if (start < 0) return { status: "pending" };
  if (normalized[start] !== "{") {
    return {
      status: "malformed",
      raw: normalized.trim(),
      reason: "JSON packet must start with '{'",
    };
  }

  const candidate = closedObjectPrefix(normalized);
  if (!candidate) return { status: "pending" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch (error) {
    return {
      status: "malformed",
      raw: candidate,
      reason: error instanceof Error ? error.message : "invalid JSON",
    };
  }
  if (!isPlainObject(parsed)) {
    return {
      status: "malformed",
      raw: candidate,
      reason: `JSON packet must be an object, got ${describeValueType(parsed)}`,
    };
  }
  return { status: "closed", value: parsed };
}

function validateObjectAgainstSchema(
  schema: {
    readonly additionalProperties?: boolean;
    readonly properties?: Readonly<Record<string, PropFieldSchema>>;
    readonly required?: readonly string[];
  },
  record: Record<string, unknown>,
  prefix: string,
  errors: RouteSchemaError[],
): void {
  const properties = schema.properties ?? {};
  for (const key of schema.required ?? []) {
    if (!Object.hasOwn(record, key) || record[key] === undefined) {
      errors.push({ path: joinPath(prefix, key), code: "missing" });
    }
  }
  for (const [key, value] of Object.entries(record)) {
    const path = joinPath(prefix, key);
    const field = Object.hasOwn(properties, key) ? properties[key] : undefined;
    if (!field) {
      if (schema.additionalProperties === false) {
        errors.push({ path, code: "unexpected" });
      }
      continue;
    }
    if (value === undefined) continue;
    validateFieldValue(field, value, path, errors);
  }
}

function validateFieldValue(
  field: PropFieldSchema,
  value: unknown,
  path: string,
  errors: RouteSchemaError[],
): void {
  const check = Object.hasOwn(TYPE_CHECK, field.type)
    ? TYPE_CHECK[field.type as SupportedPropType]
    : undefined;
  if (!check || !check(value)) {
    errors.push({
      path,
      code: "type",
      expected: field.type,
      received: describeValueType(value),
    });
    return;
  }
  if (field.enum && !field.enum.includes(value)) {
    errors.push({
      path,
      code: "type",
      expected: field.enum.map((item) => JSON.stringify(item)).join(" | "),
      received: JSON.stringify(value),
    });
    return;
  }
  if (field.type === "array" && field.items) {
    const items = value as unknown[];
    for (let index = 0; index < items.length; index += 1) {
      validateFieldValue(field.items, items[index], `${path}[${index}]`, errors);
    }
    return;
  }
  if (field.type === "object" && (field.properties || field.required || field.additionalProperties === false)) {
    validateObjectAgainstSchema(field, value as Record<string, unknown>, path, errors);
  }
}

function joinPath(prefix: string, key: string): string {
  return prefix ? `${prefix}.${key}` : key;
}

function describeValueType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "number") {
    if (Number.isNaN(value)) return "nan";
    if (!Number.isFinite(value)) return "infinity";
    return "number";
  }
  return typeof value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
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
