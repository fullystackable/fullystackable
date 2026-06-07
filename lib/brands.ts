import {
  mockBrands,
  type Brand,
  type Note,
  type Task,
  type UpcomingItem,
} from "@/data/mockData";
import {
  compareDateStrings,
  differenceInCalendarDays,
  parseISODate,
} from "@/lib/date";

export type TaskWithBrand = Task & {
  brandId: string;
  brandName: string;
  brandStatus: Brand["status"];
  daysUntilDue: number;
};

export type UpcomingWithBrand = UpcomingItem & {
  brandId: string;
  brandName: string;
  brandStatus: Brand["status"];
  daysUntil: number;
};

export type NoteWithBrand = Note & {
  brandId: string;
  brandName: string;
  brandStatus: Brand["status"];
};

export type BrandHealthRow = {
  brandId: string;
  brandName: string;
  status: Brand["status"];
  openTasks: number;
  urgentTasks: number;
  upcomingItems: number;
  attentionNow: number;
  nextDate: string | null;
  urgencyScore: number;
};

const priorityRank: Record<Task["priority"], number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

const statusRank: Record<Task["status"], number> = {
  "Needs review": 0,
  "In progress": 1,
  Planned: 2,
  Done: 3,
};

const brandStatusWeight: Record<Brand["status"], number> = {
  "Needs attention": 2,
  "Launching soon": 1,
  "On track": 0,
};

export function getBrands() {
  return mockBrands;
}

export function getBrandById(brandId: string) {
  return mockBrands.find((brand) => brand.id === brandId);
}

function getOpenTasks(baseDate: Date = new Date()) {
  return mockBrands
    .flatMap((brand) =>
      brand.tasks
        .filter((task) => task.status !== "Done")
        .map((task) => ({
          ...task,
          brandId: brand.id,
          brandName: brand.name,
          brandStatus: brand.status,
          daysUntilDue: differenceInCalendarDays(task.dueDate, baseDate),
        })),
    )
    .sort((left, right) => {
      if (left.daysUntilDue !== right.daysUntilDue) {
        return left.daysUntilDue - right.daysUntilDue;
      }

      if (priorityRank[left.priority] !== priorityRank[right.priority]) {
        return priorityRank[left.priority] - priorityRank[right.priority];
      }

      if (statusRank[left.status] !== statusRank[right.status]) {
        return statusRank[left.status] - statusRank[right.status];
      }

      return brandStatusWeight[right.brandStatus] - brandStatusWeight[left.brandStatus];
    });
}

function getUpcomingItems(baseDate: Date = new Date()) {
  return mockBrands
    .flatMap((brand) =>
      brand.upcoming.map((item) => ({
        ...item,
        brandId: brand.id,
        brandName: brand.name,
        brandStatus: brand.status,
        daysUntil: differenceInCalendarDays(item.date, baseDate),
      })),
    )
    .sort((left, right) => compareDateStrings(left.date, right.date));
}

export function getDashboardStats(baseDate: Date = new Date()) {
  const openTasks = getOpenTasks(baseDate);
  const upcomingItems = getUpcomingItems(baseDate);
  const brandHealth = getBrandHealthSnapshot(baseDate);
  const attentionNow =
    openTasks.filter((task) => task.daysUntilDue <= 0).length +
    upcomingItems.filter((item) => item.daysUntil <= 0).length;
  const thisWeek =
    openTasks.filter((task) => task.daysUntilDue >= 0 && task.daysUntilDue <= 7)
      .length +
    upcomingItems.filter((item) => item.daysUntil >= 0 && item.daysUntil <= 7)
      .length;

  return {
    activeBrands: mockBrands.length,
    openTasks: openTasks.length,
    attentionNow,
    thisWeek,
    urgentTasks: openTasks.filter((task) => task.priority === "High").length,
    mostUrgentBrand: brandHealth[0] ?? null,
  };
}

export function getTodaysFocus(baseDate: Date = new Date(), limit = 6) {
  return getOpenTasks(baseDate).slice(0, limit);
}

export function getThisWeekItems(baseDate: Date = new Date()) {
  return {
    tasks: getOpenTasks(baseDate).filter(
      (task) => task.daysUntilDue >= 0 && task.daysUntilDue <= 7,
    ),
    upcoming: getUpcomingItems(baseDate).filter(
      (item) => item.daysUntil >= 0 && item.daysUntil <= 7,
    ),
  };
}

export function getBrandHealthSnapshot(baseDate: Date = new Date()) {
  return mockBrands
    .map((brand) => {
      const openTasks = brand.tasks.filter((task) => task.status !== "Done");
      const urgentTasks = openTasks.filter((task) => task.priority === "High");
      const attentionNow = openTasks.filter(
        (task) => differenceInCalendarDays(task.dueDate, baseDate) <= 1,
      ).length;
      const upcomingThisWeek = brand.upcoming.filter((item) => {
        const daysUntil = differenceInCalendarDays(item.date, baseDate);
        return daysUntil >= 0 && daysUntil <= 7;
      });
      const nextDate =
        [...openTasks.map((task) => task.dueDate), ...brand.upcoming.map((item) => item.date)]
          .sort(compareDateStrings)[0] ?? null;
      const urgencyScore =
        urgentTasks.length * 4 +
        attentionNow * 3 +
        upcomingThisWeek.length * 2 +
        brandStatusWeight[brand.status];

      return {
        brandId: brand.id,
        brandName: brand.name,
        status: brand.status,
        openTasks: openTasks.length,
        urgentTasks: urgentTasks.length,
        upcomingItems: brand.upcoming.length,
        attentionNow,
        nextDate,
        urgencyScore,
      };
    })
    .sort((left, right) => {
      if (left.urgencyScore !== right.urgencyScore) {
        return right.urgencyScore - left.urgencyScore;
      }

      if (left.nextDate && right.nextDate) {
        return compareDateStrings(left.nextDate, right.nextDate);
      }

      if (left.nextDate) {
        return -1;
      }

      if (right.nextDate) {
        return 1;
      }

      return left.brandName.localeCompare(right.brandName);
    });
}

export function getRecentNotes(limit = 6) {
  return mockBrands
    .flatMap((brand) =>
      brand.notes.map((note) => ({
        ...note,
        brandId: brand.id,
        brandName: brand.name,
        brandStatus: brand.status,
      })),
    )
    .sort(
      (left, right) =>
        parseISODate(right.createdAt).getTime() -
        parseISODate(left.createdAt).getTime(),
    )
    .slice(0, limit);
}

export function getUpcomingAcrossBrands(baseDate: Date = new Date()) {
  return getUpcomingItems(baseDate);
}

export function getStatusSummary() {
  const onTrack = mockBrands.filter((brand) => brand.status === "On track").length;
  const launchingSoon = mockBrands.filter(
    (brand) => brand.status === "Launching soon",
  ).length;
  const needsAttention = mockBrands.filter(
    (brand) => brand.status === "Needs attention",
  ).length;

  return [
    {
      label: "On track",
      count: onTrack,
      helper: "Healthy accounts with clear execution momentum.",
    },
    {
      label: "Launching soon",
      count: launchingSoon,
      helper: "Campaigns approaching launch windows and handoffs.",
    },
    {
      label: "Needs attention",
      count: needsAttention,
      helper: "Accounts with blockers, urgency, or cleanup work.",
    },
  ];
}
