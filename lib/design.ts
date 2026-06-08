import type {
  BrandStatusLabel,
  TaskPriorityLabel,
  TaskStatusLabel,
} from "@/lib/workspace-view";

export type BadgeTone =
  | "neutral"
  | "sidebar"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info";

export const brandStatusTones: Record<BrandStatusLabel, BadgeTone> = {
  "On track": "success",
  "Needs attention": "warning",
  "Launching soon": "accent",
  Archived: "neutral",
};

export const taskPriorityTones: Record<TaskPriorityLabel, BadgeTone> = {
  Urgent: "danger",
  High: "danger",
  Medium: "warning",
  Low: "neutral",
};

export const taskStatusTones: Record<TaskStatusLabel, BadgeTone> = {
  "In progress": "accent",
  "Needs review": "warning",
  Planned: "neutral",
  Done: "success",
  Archived: "neutral",
};

export function getDueDateTone(daysUntil: number): BadgeTone {
  if (daysUntil < 0) {
    return "danger";
  }

  if (daysUntil === 0) {
    return "warning";
  }

  if (daysUntil <= 2) {
    return "accent";
  }

  return "neutral";
}
