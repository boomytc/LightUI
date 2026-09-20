import type { KindId } from "../lib/machines";
import { Cascader } from "./Cascader";
import { Dates } from "./Dates";
import { Range } from "./Range";
import { Ruler } from "./Ruler";
import { Stepper } from "./Stepper";

export function KindDemo({ id }: { id: KindId }) {
  switch (id) {
    case "ruler":
      return <Ruler />;
    case "range":
      return <Range />;
    case "stepper":
      return <Stepper />;
    case "cascader":
      return <Cascader />;
    case "dates":
      return <Dates />;
  }
}
