import type { AimColor } from "../intent/types";

export type StageKindId = "status" | "diagonal" | "project" | "third";

export type StagePin = {
  color: AimColor;
  parent: string;
  toward: string;
  childLevel: number;
  /** Pointer item. Defaults to parent (predict) or toward (confirm). */
  mouseOn?: string;
};

export type StageFixture = {
  id: StageKindId;
  path: string[];
  hoveredId: string;
  pin?: StagePin;
};

export const STAGE_FIXTURES: StageFixture[] = [
  {
    id: "status",
    path: ["status"],
    hoveredId: "status",
    pin: { color: "predict", parent: "status", toward: "status-cancel", childLevel: 1 },
  },
  {
    id: "diagonal",
    path: ["status"],
    hoveredId: "assignee",
    pin: {
      color: "predict",
      parent: "status",
      toward: "status-cancel",
      childLevel: 1,
      mouseOn: "assignee",
    },
  },
  {
    id: "project",
    path: ["project"],
    hoveredId: "project",
    pin: { color: "predict", parent: "project", toward: "proj-tags", childLevel: 1 },
  },
  {
    id: "third",
    path: ["project", "proj-tags", "ptag-urgent"],
    hoveredId: "ptag-urgent",
    pin: { color: "confirm", parent: "proj-tags", toward: "ptag-urgent", childLevel: 2 },
  },
];

export const STAGE_IDS = new Set<string>(STAGE_FIXTURES.map((f) => f.id));

export function stageFixture(id: string): StageFixture {
  return STAGE_FIXTURES.find((f) => f.id === id) ?? STAGE_FIXTURES[0]!;
}
