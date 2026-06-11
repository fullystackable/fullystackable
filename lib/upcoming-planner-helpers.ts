import { compareDateStrings, formatShortDate, parseISODate, toISODate } from "./date";
import { humanizeSnakeCase } from "./workspace-view";

export type UpcomingPlannerLayout = "calendar" | "list";
export type UpcomingPlannerView = "week" | "month" | "brand" | "campaign" | "type";

export type PlannerUpcomingItem = {
  id: string;
  title: string;
  date: string;
  notes: string | null;
  typeLabel: string;
  statusLabel: string;
  brandName: string;
  brandSlug: string;
  brandColor: string;
  campaignId: string | null;
  campaignTitle: string | null;
  href: string;
};

export type PlannerGroup = {
  id: string;
  title: string;
  helper: string;
  accentColor?: string;
  items: PlannerUpcomingItem[];
};

export type PlannerCalendarDay = {
  date: string;
  label: string;
  shortLabel: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  items: PlannerUpcomingItem[];
};

export function normalizeUpcomingPlannerLayout(
  value: string | undefined,
): UpcomingPlannerLayout {
  switch (value) {
    case "list":
      return "list";
    case "calendar":
    default:
      return "calendar";
  }
}

export function normalizeUpcomingPlannerView(
  value: string | undefined,
): UpcomingPlannerView {
  switch (value) {
    case "month":
    case "brand":
    case "campaign":
    case "type":
      return value;
    case "week":
    default:
      return "week";
  }
}

export function getUpcomingTypeLabel(value: string) {
  if (value === "campaign_launch") {
    return "Launch";
  }

  return humanizeSnakeCase(value);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const current = startOfDay(date);
  return new Date(
    current.getFullYear(),
    current.getMonth(),
    current.getDate() - current.getDay(),
  );
}

function endOfWeek(date: Date) {
  const start = startOfWeek(date);
  return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatDayLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(parseISODate(value));
}

function formatShortDayLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
  }).format(parseISODate(value));
}

export function getPlannerViewItems(
  items: PlannerUpcomingItem[],
  view: UpcomingPlannerView,
  baseDate: Date = new Date(),
) {
  switch (view) {
    case "month": {
      const monthStart = startOfMonth(baseDate);
      const monthEnd = endOfMonth(baseDate);
      return items.filter((item) => {
        const itemDate = parseISODate(item.date);
        return itemDate >= monthStart && itemDate <= monthEnd;
      });
    }
    case "week": {
      const weekStart = startOfWeek(baseDate);
      const weekEnd = endOfWeek(baseDate);
      return items.filter((item) => {
        const itemDate = parseISODate(item.date);
        return itemDate >= weekStart && itemDate <= weekEnd;
      });
    }
    case "brand":
    case "campaign":
    case "type":
    default:
      return items;
  }
}

export function buildWeekCalendarDays(
  items: PlannerUpcomingItem[],
  baseDate: Date = new Date(),
): PlannerCalendarDay[] {
  const weekStart = startOfWeek(baseDate);
  const today = startOfDay(baseDate);

  return Array.from({ length: 7 }, (_, index) => {
    const day = addDays(weekStart, index);
    const isoDate = toISODate(day);

    return {
      date: isoDate,
      label: formatDayLabel(isoDate),
      shortLabel: formatShortDayLabel(isoDate),
      isToday: isSameDay(day, today),
      isCurrentMonth: true,
      items: items.filter((item) => item.date === isoDate),
    };
  });
}

export function buildMonthCalendarDays(
  items: PlannerUpcomingItem[],
  baseDate: Date = new Date(),
): PlannerCalendarDay[] {
  const firstOfMonth = startOfMonth(baseDate);
  const lastOfMonth = endOfMonth(baseDate);
  const gridStart = startOfWeek(firstOfMonth);
  const gridEnd = endOfWeek(lastOfMonth);
  const totalDays =
    Math.round((gridEnd.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const today = startOfDay(baseDate);

  return Array.from({ length: totalDays }, (_, index) => {
    const day = addDays(gridStart, index);
    const isoDate = toISODate(day);

    return {
      date: isoDate,
      label: formatDayLabel(isoDate),
      shortLabel: formatShortDayLabel(isoDate),
      isToday: isSameDay(day, today),
      isCurrentMonth: day.getMonth() === baseDate.getMonth(),
      items: items.filter((item) => item.date === isoDate),
    };
  });
}

export function buildUpcomingGroups(
  items: PlannerUpcomingItem[],
  view: UpcomingPlannerView,
): PlannerGroup[] {
  switch (view) {
    case "brand":
      return sortGroupsByTitle(
        buildGroups(items, (item) => ({
          id: item.brandSlug,
          title: item.brandName,
          helper: `${item.brandName} schedule`,
          accentColor: item.brandColor,
        })),
      );
    case "campaign":
      return sortGroupsByTitle(
        buildGroups(items, (item) => ({
          id: item.campaignId ?? "no-campaign",
          title: item.campaignTitle ?? "No campaign",
          helper: item.campaignTitle
            ? `${item.brandName} campaign`
            : `${item.brandName} items without a campaign`,
          accentColor: item.brandColor,
        })),
      );
    case "type":
      return sortGroupsByTitle(
        buildGroups(items, (item) => ({
          id: item.typeLabel.toLowerCase(),
          title: item.typeLabel,
          helper: `${item.typeLabel} planning`,
        })),
      );
    case "month":
    case "week":
    default:
      return buildGroups(items, (item) => ({
        id: item.date,
        title: formatDayLabel(item.date),
        helper: formatShortDate(item.date),
      }));
  }
}

function sortGroupsByTitle(groups: PlannerGroup[]) {
  return [...groups].sort((left, right) => left.title.localeCompare(right.title));
}

function buildGroups(
  items: PlannerUpcomingItem[],
  getGroup: (item: PlannerUpcomingItem) => {
    id: string;
    title: string;
    helper: string;
    accentColor?: string;
  },
) {
  const groups = new Map<string, PlannerGroup>();

  for (const item of items) {
    const config = getGroup(item);
    const existing = groups.get(config.id);

    if (existing) {
      existing.items.push(item);
      continue;
    }

    groups.set(config.id, {
      id: config.id,
      title: config.title,
      helper: config.helper,
      accentColor: config.accentColor,
      items: [item],
    });
  }

  return [...groups.values()].map((group) => ({
    ...group,
    items: [...group.items].sort((left, right) => {
      const byDate = compareDateStrings(left.date, right.date);

      if (byDate !== 0) {
        return byDate;
      }

      return left.title.localeCompare(right.title);
    }),
  }));
}
