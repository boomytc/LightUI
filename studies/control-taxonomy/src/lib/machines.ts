export type Demand = "fill" | "choose";
export type Length = "short" | "long";
export type Cardinality = "one" | "many";
export type FindMode = "compare" | "scan" | "search";

export type ControlId =
  | "text-field"
  | "textarea"
  | "select"
  | "combobox"
  | "radio"
  | "checkbox";

export type Answers = {
  demand?: Demand;
  length?: Length;
  cardinality?: Cardinality;
  find?: FindMode;
};

export type Step = "demand" | "length" | "cardinality" | "find" | "result";

export function nextStep(answers: Answers): Step {
  if (!answers.demand) return "demand";
  if (answers.demand === "fill") {
    return answers.length ? "result" : "length";
  }
  if (!answers.cardinality) return "cardinality";
  if (answers.cardinality === "many") return "result";
  return answers.find ? "result" : "find";
}

export function chooseControl(answers: Answers): ControlId | null {
  if (nextStep(answers) !== "result") return null;
  if (answers.demand === "fill") {
    return answers.length === "long" ? "textarea" : "text-field";
  }
  if (answers.cardinality === "many") return "checkbox";
  if (answers.find === "compare") return "radio";
  if (answers.find === "search") return "combobox";
  return "select";
}

export function answersFor(id: ControlId): Answers {
  switch (id) {
    case "text-field":
      return { demand: "fill", length: "short" };
    case "textarea":
      return { demand: "fill", length: "long" };
    case "checkbox":
      return { demand: "choose", cardinality: "many" };
    case "radio":
      return { demand: "choose", cardinality: "one", find: "compare" };
    case "select":
      return { demand: "choose", cardinality: "one", find: "scan" };
    case "combobox":
      return { demand: "choose", cardinality: "one", find: "search" };
  }
}

export function withDemand(demand: Demand): Answers {
  return { demand };
}

export function withLength(length: Length): Answers {
  return { demand: "fill", length };
}

export function withCardinality(cardinality: Cardinality): Answers {
  return { demand: "choose", cardinality };
}

export function withFind(find: FindMode): Answers {
  return { demand: "choose", cardinality: "one", find };
}

export type Member = {
  id: string;
  name: string;
  email: string;
};

export function filterMembers(members: readonly Member[], query: string): Member[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...members];
  return members.filter(
    (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
  );
}

export function toggleCapped(selected: readonly string[], id: string, max: number): string[] {
  if (selected.includes(id)) return selected.filter((item) => item !== id);
  if (selected.length >= max) return [...selected];
  return [...selected, id];
}

export function isCapped(selected: readonly string[], id: string, max: number): boolean {
  return !selected.includes(id) && selected.length >= max;
}
