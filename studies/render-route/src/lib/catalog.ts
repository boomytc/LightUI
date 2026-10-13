import { PROTOCOL_VERSION, registry } from "@lightui/genui";
import type { Catalog } from "./machines";

export function catalogFromRegistry(): Catalog {
  return {
    protocol: "lightui.genui",
    version: PROTOCOL_VERSION,
    components: registry.map((entry) => ({
      name: entry.name,
      description: entry.description,
      props: {
        type: "object",
        additionalProperties: entry.props.additionalProperties,
        properties: Object.fromEntries(
          Object.entries(entry.props.properties).map(([key, field]) => [
            key,
            { type: field.type, description: field.description },
          ]),
        ),
        required: [...entry.props.required],
      },
    })),
  };
}
