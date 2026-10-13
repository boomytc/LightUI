import type { ReactNode } from "react";
import { Text } from "@lightui/genui";
import { MOUNTED_COMPONENTS } from "../lib/machines";

export const nativeMounts = {
  Text: (props) => (typeof props.content === "string" ? <Text content={props.content} /> : null),
} satisfies Record<(typeof MOUNTED_COMPONENTS)[number], (props: Record<string, unknown>) => ReactNode>;

export function mountNative(name: string, props: Record<string, unknown>): ReactNode {
  const mount = nativeMounts[name as keyof typeof nativeMounts];
  return mount ? mount(props) : null;
}
