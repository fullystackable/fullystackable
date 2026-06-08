import "server-only";

import {
  compareDateStrings,
  differenceInCalendarDays,
  parseISODate,
  toISODate,
} from "@/lib/date";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  mapBrandStatus,
  mapTaskPriority,
  mapTaskStatus,
  type BrandStatusLabel,
  type TaskPriorityLabel,
  type TaskStatusLabel,
  type WorkspaceNote,
} from "@/lib/workspace-view";

type BrandRow = {
  id: string;
  slug: string;
  name: string;
  status: "active" | "needs_attention" | "launching" | "archived";
};

type TaskRow = {
  id: string;
  brand_id: string;
  title: string;
  due_date: string | null;
  status: "planned" | "in_progress" | "needs_review" | "done" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
};

type UpcomingRow = {
  id: string;
  brand_id: string;
  title: string;
  date: string;
  type: string;
  status: "scheduled" | "completed" | "canceled" | "postponed";
};

type NoteRow = {
  id: string;
  brand_id: string;
  title: string | null;
  body: string;
  created_at: string;
};

export type DashboardTaskWithBrand = {
  id: string;
  title: string;
  dueDate: string;
  status: TaskStatusLabel;
  priority: TaskPriorityLabel;
  brandSlug: string;
  brandName: string;
  brandStatus: BrandStatusLabel;
  daysUntilDue: number;
};

export type DashboardUpcomingWithBrand = {
  id: string;
  title: string;
  date: string;
  type: string;
  status: string;
  brandSlug: string;
  brandName: string;
  brandStatus: BrandStatusLabel;
  daysUntil: number;
};

export type DashboardBrandHealthRow = {
  brandId: string;
  brandSlug: string;
  brandName: string;
  status: BrandStatusLabel;
  openTasks: number;
  urgentTasks: number;
  upcomingItems: number;
  attentionNow: number;
  nextDate: string | null;
  urgencyScore: number;
};

export type DashboardStats = {
  activeBrands: number;
  openTasks: number;
  attentionNow: number;
  thisWeek: number;
  urgentTasks: number;
  mostUrgentBrand: DashboardBrandHealthRow | null;
};

type DashboardData = {
  stats: DashboardStats;
  todaysFocus: DashboardTaskWithBrand[];
  thisWeek: {
    tasks: DashboardTaskWithBrand[];
    upcoming: DashboardUpcomingWithBrand[];
  };
  brandHealth: DashboardBrandHealthRow[];
  recentNotes: WorkspaceNote[];
  todayLabel: string;
};

const priorityRank: Record<TaskPriorityLabel, number> = {
  Urgent: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

const statusRank: Record<TaskStatusLabel, number> = {
  "Needs review": 0,
  "In progress": 1,
  Planned: 2,
  Done: 3,
  Archived: 4,
};

const brandStatusWeight: Record<BrandStatusLabel, number> = {
  "Needs attention": 2,
  "Launching soon": 1,
  "On track": 0,
  Archived: -1,
};

function toDateOnly(value: string) {
  return value.slice(0, 10);
}

function humanizeSnakeCase(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function getDashboardPageData(baseDate: Date = new Date()) {
  const supabase = createSupabaseServerClient();
  const [brandsResult, tasksResult, upcomingResult, notesResult] = await Promise.all([
    supabase
      .from("brands")
      .select("id, slug, name, status")
      .neq("status", "archived")
      .order("name"),
    supabase
      .from("tasks")
      .select("id, brand_id, title, due_date, status, priority")
      .neq("status", "archived"),
    supabase
      .from("upcoming_items")
      .select("id, brand_id, title, date, type, status")
      .neq("status", "canceled"),
    supabase
      .from("notes")
      .select("id, brand_id, title, body, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  if (brandsResult.error) {
    throw new Error(`Failed to load dashboard brands: ${brandsResult.error.message}`);
  }

  if (tasksResult.error) {
    throw new Error(`Failed to load dashboard tasks: ${tasksResult.error.message}`);
  }

  if (upcomingResult.error) {
    throw new Error(`Failed to load dashboard upcoming items: ${upcomingResult.error.message}`);
  }

  if (notesResult.error) {
    throw new Error(`Failed to load dashboard notes: ${notesResult.error.message}`);
  }

  const brands = (brandsResult.data ?? []) as BrandRow[];
  const brandsById = new Map(
    brands.map((brand) => [
      brand.id,
      {
        slug: brand.slug,
        name: brand.name,
        status: mapBrandStatus(brand.status),
      },
    ]),
  );

  const openTasks = ((tasksResult.data ?? []) as TaskRow[])
    .filter((task) => task.due_date && task.status !== "done")
    .map((task) => {
      const brand = brandsById.get(task.brand_id);

      if (!brand) {
        return null;
      }

      const dueDate = task.due_date!;

      return {
        id: task.id,
        title: task.title,
        dueDate,
        status: mapTaskStatus(task.status),
        priority: mapTaskPriority(task.priority),
        brandSlug: brand.slug,
        brandName: brand.name,
        brandStatus: brand.status,
        daysUntilDue: differenceInCalendarDays(dueDate, baseDate),
      } satisfies DashboardTaskWithBrand;
    })
    .filter((task): task is DashboardTaskWithBrand => Boolean(task))
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

  const upcomingItems = ((upcomingResult.data ?? []) as UpcomingRow[])
    .map((item) => {
      const brand = brandsById.get(item.brand_id);

      if (!brand) {
        return null;
      }

      const date = toDateOnly(item.date);

      return {
        id: item.id,
        title: item.title,
        date,
        type: humanizeSnakeCase(item.type),
        status: humanizeSnakeCase(item.status),
        brandSlug: brand.slug,
        brandName: brand.name,
        brandStatus: brand.status,
        daysUntil: differenceInCalendarDays(date, baseDate),
      } satisfies DashboardUpcomingWithBrand;
    })
    .filter((item): item is DashboardUpcomingWithBrand => Boolean(item))
    .sort((left, right) => compareDateStrings(left.date, right.date));

  const brandHealth = brands
    .map((brand) => {
      const mappedStatus = mapBrandStatus(brand.status);
      const brandTasks = openTasks.filter((task) => task.brandSlug === brand.slug);
      const urgentTasks = brandTasks.filter(
        (task) => task.priority === "High" || task.priority === "Urgent",
      );
      const attentionNow = brandTasks.filter((task) => task.daysUntilDue <= 1).length;
      const brandUpcoming = upcomingItems.filter((item) => item.brandSlug === brand.slug);
      const upcomingThisWeek = brandUpcoming.filter(
        (item) => item.daysUntil >= 0 && item.daysUntil <= 7,
      );
      const nextDate =
        [
          ...brandTasks.map((task) => task.dueDate),
          ...brandUpcoming.map((item) => item.date),
        ].sort(compareDateStrings)[0] ?? null;
      const urgencyScore =
        urgentTasks.length * 4 +
        attentionNow * 3 +
        upcomingThisWeek.length * 2 +
        brandStatusWeight[mappedStatus];

      return {
        brandId: brand.id,
        brandSlug: brand.slug,
        brandName: brand.name,
        status: mappedStatus,
        openTasks: brandTasks.length,
        urgentTasks: urgentTasks.length,
        upcomingItems: brandUpcoming.length,
        attentionNow,
        nextDate,
        urgencyScore,
      } satisfies DashboardBrandHealthRow;
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

  const recentNotes: WorkspaceNote[] = ((notesResult.data ?? []) as NoteRow[])
    .map((note): WorkspaceNote | null => {
      const brand = brandsById.get(note.brand_id);

      if (!brand) {
        return null;
      }

      return {
        id: note.id,
        title: note.title,
        text: note.body,
        createdAt: toDateOnly(note.created_at),
        category: "Recent",
        pinned: false,
        brandId: note.brand_id,
        brandSlug: brand.slug,
        brandName: brand.name,
        brandStatus: brand.status,
      } satisfies WorkspaceNote;
    })
    .filter((note): note is WorkspaceNote => note !== null)
    .sort(
      (left, right) =>
        parseISODate(right.createdAt).getTime() - parseISODate(left.createdAt).getTime(),
    )
    .slice(0, 6);

  const stats: DashboardStats = {
    activeBrands: brands.length,
    openTasks: openTasks.length,
    attentionNow:
      openTasks.filter((task) => task.daysUntilDue <= 0).length +
      upcomingItems.filter((item) => item.daysUntil <= 0).length,
    thisWeek:
      openTasks.filter((task) => task.daysUntilDue >= 0 && task.daysUntilDue <= 7)
        .length +
      upcomingItems.filter((item) => item.daysUntil >= 0 && item.daysUntil <= 7)
        .length,
    urgentTasks: openTasks.filter(
      (task) => task.priority === "High" || task.priority === "Urgent",
    ).length,
    mostUrgentBrand: brandHealth[0] ?? null,
  };

  return {
    stats,
    todaysFocus: openTasks.slice(0, 6),
    thisWeek: {
      tasks: openTasks.filter((task) => task.daysUntilDue >= 0 && task.daysUntilDue <= 7),
      upcoming: upcomingItems.filter((item) => item.daysUntil >= 0 && item.daysUntil <= 7),
    },
    brandHealth,
    recentNotes,
    todayLabel: toISODate(baseDate),
  } satisfies DashboardData;
}
