import "server-only";

import {
  compareDateStrings,
  differenceInCalendarDays,
  parseISODate,
  toISODate,
} from "@/lib/date";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  humanizeSnakeCase,
  mapBrandStatus,
  mapTaskPriority,
  mapTaskStatus,
  type WorkspaceNote,
} from "@/lib/workspace-view";

type BrandRow = {
  id: string;
  slug: string;
  name: string;
  status: "active" | "needs_attention" | "launching" | "archived";
  brand_color: string | null;
};

type TaskRow = {
  id: string;
  brand_id: string;
  title: string;
  due_date: string | null;
  status: "planned" | "in_progress" | "needs_review" | "done" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  related_campaign_id: string | null;
};

type UpcomingRow = {
  id: string;
  brand_id: string;
  title: string;
  date: string;
  type: "meeting" | "event" | "campaign_launch" | "deadline" | "reminder" | "seasonal";
  status: "scheduled" | "completed" | "canceled" | "postponed";
};

type AssetRow = {
  id: string;
  brand_id: string;
  title: string;
  asset_type: string;
  updated_at: string;
};

type NoteRow = {
  id: string;
  brand_id: string;
  title: string | null;
  body: string;
  created_at: string;
};

type CampaignRow = {
  id: string;
  brand_id: string;
  title: string;
  status: "planned" | "active" | "paused" | "completed" | "archived";
  start_date: string | null;
  end_date: string | null;
};

type BrandLookup = {
  slug: string;
  name: string;
  status: ReturnType<typeof mapBrandStatus>;
  brandColor: string;
};

export type DashboardTaskWithBrand = {
  id: string;
  title: string;
  dueDate: string;
  status: ReturnType<typeof mapTaskStatus>;
  priority: ReturnType<typeof mapTaskPriority>;
  brandSlug: string;
  brandName: string;
  daysUntilDue: number;
  relatedCampaignId: string | null;
};

export type DashboardUpcomingWithBrand = {
  id: string;
  title: string;
  date: string;
  type: string;
  status: string;
  brandSlug: string;
  brandName: string;
  brandColor: string;
  daysUntil: number;
};

export type DashboardAssetWithBrand = {
  id: string;
  title: string;
  type: string;
  updatedAt: string;
  brandSlug: string;
  brandName: string;
};

export type DashboardCampaignWithBrand = {
  id: string;
  title: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  brandSlug: string;
  brandName: string;
};

export type GlobalDashboardStats = {
  activeBrands: number;
  tasksDueThisWeek: number;
  overdueTasks: number;
  upcomingItems: number;
};

export type GlobalDashboardData = {
  stats: GlobalDashboardStats;
  dueThisWeekTasks: DashboardTaskWithBrand[];
  overdueTasks: DashboardTaskWithBrand[];
  upcomingItems: DashboardUpcomingWithBrand[];
  recentAssets: DashboardAssetWithBrand[];
  recentNotes: WorkspaceNote[];
  recentCampaigns: DashboardCampaignWithBrand[];
  todayLabel: string;
};

function toDateOnly(value: string) {
  return value.slice(0, 10);
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}\u2026`;
}

function buildBrandLookup(brands: BrandRow[]) {
  return new Map<string, BrandLookup>(
    brands.map((brand) => [
      brand.id,
      {
        slug: brand.slug,
        name: brand.name,
        status: mapBrandStatus(brand.status),
        brandColor: brand.brand_color ?? "#0F766E",
      },
    ]),
  );
}

export async function getGlobalDashboardData(
  baseDate: Date = new Date(),
): Promise<GlobalDashboardData> {
  const supabase = createSupabaseServerClient();
  const [
    brandsResult,
    tasksResult,
    upcomingResult,
    assetsResult,
    notesResult,
    campaignsResult,
  ] = await Promise.all([
    supabase
      .from("brands")
      .select("id, slug, name, status, brand_color")
      .neq("status", "archived")
      .order("name"),
    supabase
      .from("tasks")
      .select("id, brand_id, title, due_date, status, priority, related_campaign_id")
      .neq("status", "archived"),
    supabase
      .from("upcoming_items")
      .select("id, brand_id, title, date, type, status")
      .neq("status", "canceled"),
    supabase
      .from("assets")
      .select("id, brand_id, title, asset_type, updated_at")
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase
      .from("notes")
      .select("id, brand_id, title, body, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("campaigns")
      .select("id, brand_id, title, status, start_date, end_date")
      .order("start_date", { ascending: false })
      .limit(6),
  ]);

  if (brandsResult.error) {
    throw new Error(`Failed to load dashboard brands: ${brandsResult.error.message}`);
  }

  if (tasksResult.error) {
    throw new Error(`Failed to load dashboard tasks: ${tasksResult.error.message}`);
  }

  if (upcomingResult.error) {
    throw new Error(
      `Failed to load dashboard upcoming items: ${upcomingResult.error.message}`,
    );
  }

  if (assetsResult.error) {
    throw new Error(`Failed to load dashboard assets: ${assetsResult.error.message}`);
  }

  if (notesResult.error) {
    throw new Error(`Failed to load dashboard notes: ${notesResult.error.message}`);
  }

  if (campaignsResult.error) {
    throw new Error(
      `Failed to load dashboard campaigns: ${campaignsResult.error.message}`,
    );
  }

  const brands = (brandsResult.data ?? []) as BrandRow[];
  const brandsById = buildBrandLookup(brands);

  const trackedTasks = ((tasksResult.data ?? []) as TaskRow[])
    .filter(
      (task) =>
        task.due_date && task.status !== "done" && task.status !== "archived",
    )
    .map((task): DashboardTaskWithBrand | null => {
      const brand = brandsById.get(task.brand_id);

      if (!brand) {
        return null;
      }

      const dueDate = toDateOnly(task.due_date!);

      return {
        id: task.id,
        title: task.title,
        dueDate,
        status: mapTaskStatus(task.status),
        priority: mapTaskPriority(task.priority),
        brandSlug: brand.slug,
        brandName: brand.name,
        daysUntilDue: differenceInCalendarDays(dueDate, baseDate),
        relatedCampaignId: task.related_campaign_id,
      };
    })
    .filter((task): task is DashboardTaskWithBrand => task !== null)
    .sort((left, right) => {
      if (left.daysUntilDue !== right.daysUntilDue) {
        return left.daysUntilDue - right.daysUntilDue;
      }

      return left.title.localeCompare(right.title);
    });

  const dueThisWeekTasks = trackedTasks.filter(
    (task) => task.daysUntilDue >= 0 && task.daysUntilDue <= 7,
  );
  const overdueTasks = trackedTasks.filter((task) => task.daysUntilDue < 0);

  const upcomingItems = ((upcomingResult.data ?? []) as UpcomingRow[])
    .map((item): DashboardUpcomingWithBrand | null => {
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
        brandColor: brand.brandColor,
        daysUntil: differenceInCalendarDays(date, baseDate),
      };
    })
    .filter((item): item is DashboardUpcomingWithBrand => item !== null)
    .filter((item) => item.daysUntil >= 0 && item.status !== "Completed")
    .sort((left, right) => compareDateStrings(left.date, right.date));

  const recentAssets = ((assetsResult.data ?? []) as AssetRow[])
    .map((asset): DashboardAssetWithBrand | null => {
      const brand = brandsById.get(asset.brand_id);

      if (!brand) {
        return null;
      }

      return {
        id: asset.id,
        title: asset.title,
        type: humanizeSnakeCase(asset.asset_type),
        updatedAt: toDateOnly(asset.updated_at),
        brandSlug: brand.slug,
        brandName: brand.name,
      };
    })
    .filter((asset): asset is DashboardAssetWithBrand => asset !== null);

  const recentNotes = ((notesResult.data ?? []) as NoteRow[])
    .map((note): WorkspaceNote | null => {
      const brand = brandsById.get(note.brand_id);

      if (!brand) {
        return null;
      }

      return {
        id: note.id,
        title: note.title,
        text: truncateText(note.body, 140),
        createdAt: toDateOnly(note.created_at),
        category: "Recent",
        pinned: false,
        brandId: note.brand_id,
        brandSlug: brand.slug,
        brandName: brand.name,
        brandStatus: brand.status,
      };
    })
    .filter((note): note is WorkspaceNote => note !== null)
    .sort(
      (left, right) =>
        parseISODate(right.createdAt).getTime() -
        parseISODate(left.createdAt).getTime(),
    );

  const recentCampaigns = ((campaignsResult.data ?? []) as CampaignRow[])
    .map((campaign): DashboardCampaignWithBrand | null => {
      const brand = brandsById.get(campaign.brand_id);

      if (!brand) {
        return null;
      }

      return {
        id: campaign.id,
        title: campaign.title,
        status: humanizeSnakeCase(campaign.status),
        startDate: campaign.start_date ? toDateOnly(campaign.start_date) : null,
        endDate: campaign.end_date ? toDateOnly(campaign.end_date) : null,
        brandSlug: brand.slug,
        brandName: brand.name,
      };
    })
    .filter((campaign): campaign is DashboardCampaignWithBrand => campaign !== null)
    .sort((left, right) => {
      if (left.startDate && right.startDate) {
        return compareDateStrings(right.startDate, left.startDate);
      }

      if (left.startDate) {
        return -1;
      }

      if (right.startDate) {
        return 1;
      }

      return left.title.localeCompare(right.title);
    });

  return {
    stats: {
      activeBrands: brands.length,
      tasksDueThisWeek: dueThisWeekTasks.length,
      overdueTasks: overdueTasks.length,
      upcomingItems: upcomingItems.length,
    },
    dueThisWeekTasks: dueThisWeekTasks.slice(0, 8),
    overdueTasks: overdueTasks.slice(0, 8),
    upcomingItems: upcomingItems.slice(0, 8),
    recentAssets,
    recentNotes,
    recentCampaigns,
    todayLabel: toISODate(baseDate),
  };
}
