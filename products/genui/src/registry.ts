import type { ComponentType } from "react";
import { Text, type TextProps } from "./components/Text";

export const PROTOCOL_VERSION = "v0" as const;

export type PropsSchema = {
  $schema?: string;
  type: "object";
  additionalProperties: false;
  properties: Record<string, { type: string; description?: string }>;
  required: readonly string[];
};

export type RegisteredComponent = {
  name: string;
  description: string;
  props: PropsSchema;
  component: ComponentType<TextProps>;
};

const textProps = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  properties: {
    content: {
      type: "string",
      description: "Visible text.",
    },
  },
  required: ["content"],
} as const satisfies PropsSchema;

type TextSchemaKeys = keyof typeof textProps.properties;
type TextPropsAligned = keyof TextProps extends TextSchemaKeys
  ? TextSchemaKeys extends keyof TextProps
    ? true
    : never
  : never;
const textPropsAligned: TextPropsAligned = true;
void textPropsAligned;

export const registry = [
  {
    name: "Text",
    description:
      "Plain text block. v0 stand-in so the registry and the contract file can be checked against each other.",
    props: textProps,
    component: Text,
  },
] as const satisfies readonly RegisteredComponent[];
