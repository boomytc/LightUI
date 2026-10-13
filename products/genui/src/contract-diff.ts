export type NamedComponent = {
  name: string;
  description: string;
  props: unknown;
};

export function diffComponents(
  registryEntries: readonly NamedComponent[],
  contractComponents: readonly NamedComponent[],
): string[] {
  const errors: string[] = [];
  collectNames(registryEntries, "registry", errors);
  const contractNames = collectNames(contractComponents, "contract", errors);

  for (const component of contractComponents) {
    if (!/^[A-Z][A-Za-z0-9]*$/.test(component.name)) {
      errors.push(`component name ${component.name} must be PascalCase`);
    }
    errors.push(...schemaErrors(`contract ${component.name}`, component.props));
    const entry = registryEntries.find((item) => item.name === component.name);
    if (!entry) {
      errors.push(`contract component ${component.name} is missing from the registry`);
      continue;
    }
    if (entry.description !== component.description) {
      errors.push(`description mismatch for ${component.name}`);
    }
    if (!sameJson(entry.props, component.props)) {
      errors.push(
        `props schema mismatch for ${component.name}: registry ${JSON.stringify(entry.props)} contract ${JSON.stringify(component.props)}`,
      );
    }
  }

  for (const entry of registryEntries) {
    errors.push(...schemaErrors(`registry ${entry.name}`, entry.props));
    if (!contractNames.has(entry.name)) {
      errors.push(`registry component ${entry.name} is missing from the contract`);
    }
  }

  return errors;
}

function collectNames(
  components: readonly NamedComponent[],
  side: string,
  errors: string[],
): Set<string> {
  const names = new Set<string>();
  for (const component of components) {
    if (names.has(component.name)) errors.push(`duplicate ${side} component ${component.name}`);
    names.add(component.name);
  }
  return names;
}

function schemaErrors(label: string, props: unknown): string[] {
  if (!isRecord(props)) return [`${label} props must be an object`];
  const errors: string[] = [];
  if (props.type !== "object") errors.push(`${label} props.type must be object`);
  if (props.additionalProperties !== false) {
    errors.push(`${label} props.additionalProperties must be false`);
  }
  if (!isRecord(props.properties)) {
    errors.push(`${label} props.properties must be an object`);
    return errors;
  }
  if (!Array.isArray(props.required) || !props.required.every((item) => typeof item === "string")) {
    errors.push(`${label} props.required must be a string array`);
    return errors;
  }
  for (const key of props.required) {
    if (!(key in props.properties)) {
      errors.push(`${label} required prop ${key} is missing from properties`);
    }
  }
  return errors;
}

function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(canonicalize(a)) === JSON.stringify(canonicalize(b));
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, inner]) => [key, canonicalize(inner)]),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
