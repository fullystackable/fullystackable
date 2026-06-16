import type {
  DashboardTaskWithBrand,
  DashboardUpcomingWithBrand,
} from "@/lib/dashboard-data";
import { compareDateStrings } from "@/lib/date";
import {
  buildWorkspaceTaskHref,
  buildWorkspaceViewHref,
} from "@/lib/workspace-url-state";

export type DailyPlannerEntry =
  | {
      id: string;
      kind: "task";
      date: string;
      title: string;
      href: string;
      brandName: string;
      status: DashboardTaskWithBrand["status"];
      detail: DashboardTaskWithBrand["priority"];
    }
  | {
      id: string;
      kind: "upcoming";
      date: string;
      title: string;
      href: string;
      brandName: string;
      status: DashboardUpcomingWithBrand["status"];
      detail: DashboardUpcomingWithBrand["type"];
      brandColor: string;
    };

export type DailyPlannerGroup = {
  id: string;
  title: string;
  helper: string;
  date: string | null;
  entries: DailyPlannerEntry[];
};

type DailyPlannerSource = {
  overdueTasks: DashboardTaskWithBrand[];
  dueTodayTasks: DashboardTaskWithBrand[];
  nextThreeDaysTasks: DashboardTaskWithBrand[];
  upcomingSoon: DashboardUpcomingWithBrand[];
};

function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function buildGroupHelper(entries: DailyPlannerEntry[]) {
  const taskCount = entries.filter((entry) => entry.kind === "task").length;
  const upcomingCount = entries.length - taskCount;

  const parts: string[] = [];

  if (taskCount > 0) {
    parts.push(pluralize(taskCount, "task", "tasks"));
  }

  if (upcomingCount > 0) {
    parts.push(pluralize(upcomingCount, "upcoming item", "upcoming items"));
  }

  return parts.join(" and ");
}

function sortEntries(left: DailyPlannerEntry, right: DailyPlannerEntry) {
  if (left.kind !== right.kind) {
    return left.kind === "task" ? -1 : 1;
  }

  if (left.status !== right.status) {
    return left.status.localeCompare(right.status);
  }

  return left.title.localeCompare(right.title);
}

export function buildDailyPlannerGroups({
  overdueTasks,
  dueTodayTasks,
  nextThreeDaysTasks,
  upcomingSoon,
}: DailyPlannerSource): DailyPlannerGroup[] {
  const overdueEntries: DailyPlannerEntry[] = overdueTasks.map((task) => ({
    id: task.id,
    kind: "task",
    date: task.dueDate,
    title: task.title,
    href: buildWorkspaceTaskHref(task.brandSlug, task.relatedCampaignId),
    brandName: task.brandName,
    status: task.status,
    detail: task.priority,
  }));

  const datedEntries = new Map<string, DailyPlannerEntry[]>();

  const addEntry = (entry: DailyPlannerEntry) => {
    const current = datedEntries.get(entry.date) ?? [];
    current.push(entry);
    datedEntries.set(entry.date, current);
  };

  for (const task of dueTodayTasks) {
    addEntry({
      id: task.id,
      kind: "task",
      date: task.dueDate,
      title: task.title,
      href: buildWorkspaceTaskHref(task.brandSlug, task.relatedCampaignId),
      brandName: task.brandName,
      status: task.status,
      detail: task.priority,
    });
  }

  for (const task of nextThreeDaysTasks) {
    addEntry({
      id: task.id,
      kind: "task",
      date: task.dueDate,
      title: task.title,
      href: buildWorkspaceTaskHref(task.brandSlug, task.relatedCampaignId),
      brandName: task.brandName,
      status: task.status,
      detail: task.priority,
    });
  }

  for (const item of upcomingSoon) {
    addEntry({
      id: item.id,
      kind: "upcoming",
      date: item.date,
      title: item.title,
      href: buildWorkspaceViewHref(item.brandSlug, {
        tab: "upcoming",
        hash: "#upcoming",
      }),
      brandName: item.brandName,
      status: item.status,
      detail: item.type,
      brandColor: item.brandColor,
    });
  }

  const groups: DailyPlannerGroup[] = [];

  if (overdueEntries.length > 0) {
    groups.push({
      id: "overdue",
      title: "Overdue",
      helper: `${pluralize(overdueEntries.length, "task is", "tasks are")} already late.`,
      date: null,
      entries: overdueEntries.sort(sortEntries),
    });
  }

  const datedGroups = [...datedEntries.entries()]
    .sort(([leftDate], [rightDate]) => compareDateStrings(leftDate, rightDate))
    .map(([date, entries]) => ({
      id: date,
      title: date,
      helper: buildGroupHelper(entries),
      date,
      entries: entries.sort(sortEntries),
    }));

  return [...groups, ...datedGroups];
}
