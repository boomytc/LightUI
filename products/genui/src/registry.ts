import type { FunctionComponent } from "react";
import { Text } from "./components/Text";
import type { PropFieldSchema } from "./render-route";

export const PROTOCOL_VERSION = "v0" as const;

export type PropsSchema<K extends string = string> = {
  readonly $schema?: string;
  readonly type: "object";
  readonly additionalProperties: false;
  readonly properties: Readonly<Record<K, PropFieldSchema>>;
  readonly required: readonly K[];
};

export type RegisteredComponent<P = never> = {
  readonly name: string;
  readonly description: string;
  readonly props: PropsSchema;
  readonly component: FunctionComponent<P>;
};

type ExactPropsSchema<P, S extends PropsSchema<Extract<keyof P, string>>> =
  Exclude<keyof S["properties"], keyof P> extends never
    ? Exclude<keyof P, keyof S["properties"]> extends never
      ? S
      : never
    : never;

export function defineComponent<
  P extends Record<string, unknown>,
  const N extends string,
  const S extends PropsSchema<Extract<keyof P, string>>,
>(spec: {
  readonly name: N;
  readonly description: string;
  readonly props: ExactPropsSchema<P, S>;
  readonly component: FunctionComponent<P>;
}): RegisteredComponent<P> & { readonly name: N; readonly props: S } {
  return spec;
}

const textComponent = defineComponent({
  name: "Text",
  description:
    "Plain text block. v0 stand-in so the registry and the contract file can be checked against each other.",
  props: {
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
  },
  component: Text,
});

export const registry = [textComponent] as const satisfies readonly RegisteredComponent[];
