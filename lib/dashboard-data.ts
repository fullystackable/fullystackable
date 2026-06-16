import "server-only";

import type { BrandReadiness } from "@/lib/brand-readiness";
import { buildBrandReadiness } from "@/lib/brand-readiness";
import { getRecentActivityFeed, type ActivityFeedItem } from "@/lib/activity-log";
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
  type WorkspaceQuickLink,
} from "@/lib/workspace-view";

type BrandRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  website: string | null;
  status: "active" | "needs_attention" | "launching" | "archived";
  brand_color: string | null;
  is_pinned: boolean;
  pinned_rank: number | null;
  brand_voice: string | null;
  common_ctas: string | null;
  audience_notes: string | null;
  services_products: string | null;
  pricing_notes: string | null;
  positioning_notes: string | null;
  do_dont_list: string | null;
  reference_links: string | null;
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
  related_campaign_id: string | null;
  title: string;
  asset_type: string;
  url: string | null;
  is_quick_link: boolean;
  updated_at: string;
};

type ContactRow = {
  brand_id: string;
};

type NoteRow = {
  id: string;
  brand_id: string;
  title: string | null;
  body: string;
  category: string;
  pinned: boolean;
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

export type DashboardPinnedBrand = {
  id: string;
  name: string;
  slug: string;
  brandColor: string;
  status: ReturnType<typeof mapBrandStatus>;
  openTasksCount: number;
  overdueTasksCount: number;
  quickLinks: WorkspaceQuickLink[];
  readiness: BrandReadiness;
  spotlightNote: WorkspaceNote | null;
  nextUpcoming: DashboardUpcomingWithBrand | null;
};

export type GlobalDashboardStats = {
  activeBrands: number;
  pinnedBrands: number;
  tasksDueThisWeek: number;
  overdueTasks: number;
  upcomingItems: number;
};

export type GlobalDashboardData = {
  stats: GlobalDashboardStats;
  dueTodayTasks: DashboardTaskWithBrand[];
  nextThreeDaysTasks: DashboardTaskWithBrand[];
  upcomingSoon: DashboardUpcomingWithBrand[];
  pinnedBrands: DashboardPinnedBrand[];
  dueThisWeekTasks: DashboardTaskWithBrand[];
  overdueTasks: DashboardTaskWithBrand[];
  upcomingItems: DashboardUpcomingWithBrand[];
  recentActivity: ActivityFeedItem[];
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
  const recentActivityPromise = getRecentActivityFeed(8);
  const supabase = createSupabaseServerClient();
  const [
    brandsResult,
    tasksResult,
    upcomingResult,
    assetsResult,
    contactsResult,
    notesResult,
    campaignsResult,
  ] = await Promise.all([
    supabase
      .from("brands")
      .select(
        "id, slug, name, description, website, status, brand_color, is_pinned, pinned_rank, brand_voice, common_ctas, audience_notes, services_products, pricing_notes, positioning_notes, do_dont_list, reference_links",
      )
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
      .select("id, brand_id, related_campaign_id, title, asset_type, url, is_quick_link, updated_at"),
    supabase.from("contacts").select("brand_id"),
    supabase
      .from("notes")
      .select("id, brand_id, title, body, category, pinned, created_at")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("campaigns")
      .select("id, brand_id, title, status, start_date, end_date")
      .order("start_date", { ascending: false }),
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

  if (contactsResult.error) {
    throw new Error(`Failed to load dashboard contacts: ${contactsResult.error.message}`);
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
  const campaigns = (campaignsResult.data ?? []) as CampaignRow[];
  const campaignTitleById = new Map(campaigns.map((campaign) => [campaign.id, campaign.title]));
  const contactsCountByBrand = new Map<string, number>();

  for (const contact of (contactsResult.data ?? []) as ContactRow[]) {
    contactsCountByBrand.set(
      contact.brand_id,
      (contactsCountByBrand.get(contact.brand_id) ?? 0) + 1,
    );
  }

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
  const dueTodayTasks = trackedTasks.filter((task) => task.daysUntilDue === 0);
  const nextThreeDaysTasks = trackedTasks.filter(
    (task) => task.daysUntilDue >= 1 && task.daysUntilDue <= 3,
  );

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

  const upcomingSoon = upcomingItems.filter((item) => item.daysUntil <= 3);

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
    .filter((asset): asset is DashboardAssetWithBrand => asset !== null)
    .sort((left, right) => compareDateStrings(right.updatedAt, left.updatedAt))
    .slice(0, 6);

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
        category: humanizeSnakeCase(note.category),
        categoryValue: note.category as WorkspaceNote["categoryValue"],
        pinned: note.pinned,
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
    )
    .slice(0, 6);

  const spotlightNoteByBrand = new Map<string, WorkspaceNote>();

  for (const note of ((notesResult.data ?? []) as NoteRow[])) {
    if (!note.pinned || spotlightNoteByBrand.has(note.brand_id)) {
      continue;
    }

    const brand = brandsById.get(note.brand_id);

    if (!brand) {
      continue;
    }

    spotlightNoteByBrand.set(note.brand_id, {
      id: note.id,
      title: note.title,
      text: truncateText(note.body, 160),
      createdAt: toDateOnly(note.created_at),
      category: humanizeSnakeCase(note.category),
      categoryValue: note.category as WorkspaceNote["categoryValue"],
      pinned: note.pinned,
      brandId: note.brand_id,
      brandSlug: brand.slug,
      brandName: brand.name,
      brandStatus: brand.status,
    });
  }

  const recentCampaigns = campaigns
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
    })
    .slice(0, 6);

  const openTasksCountByBrand = new Map<string, number>();
  const overdueTasksCountByBrand = new Map<string, number>();

  for (const task of trackedTasks) {
    openTasksCountByBrand.set(
      task.brandSlug,
      (openTasksCountByBrand.get(task.brandSlug) ?? 0) + 1,
    );

    if (task.daysUntilDue < 0) {
      overdueTasksCountByBrand.set(
        task.brandSlug,
        (overdueTasksCountByBrand.get(task.brandSlug) ?? 0) + 1,
      );
    }
  }

  const quickLinksByBrand = new Map<string, WorkspaceQuickLink[]>();

  for (const asset of (assetsResult.data ?? []) as AssetRow[]) {
    const brand = brandsById.get(asset.brand_id);

    if (!brand || !asset.is_quick_link || !asset.url) {
      continue;
    }

    const current = quickLinksByBrand.get(brand.slug) ?? [];
    current.push({
      id: asset.id,
      title: asset.title,
      url: asset.url,
      type: humanizeSnakeCase(asset.asset_type),
      relatedCampaignTitle: asset.related_campaign_id
        ? campaignTitleById.get(asset.related_campaign_id) ?? null
        : null,
    });
    quickLinksByBrand.set(brand.slug, current);
  }

  for (const [brandSlug, links] of quickLinksByBrand) {
    quickLinksByBrand.set(
      brandSlug,
      links.sort((left, right) => left.title.localeCompare(right.title)).slice(0, 4),
    );
  }

  const nextUpcomingByBrand = new Map<string, DashboardUpcomingWithBrand>();

  for (const item of upcomingItems) {
    if (!nextUpcomingByBrand.has(item.brandSlug)) {
      nextUpcomingByBrand.set(item.brandSlug, item);
    }
  }

  const pinnedBrands = brands
    .filter((brand) => brand.is_pinned)
    .sort((left, right) => {
      const leftRank = left.pinned_rank ?? Number.MAX_SAFE_INTEGER;
      const rightRank = right.pinned_rank ?? Number.MAX_SAFE_INTEGER;

      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      return left.name.localeCompare(right.name);
    })
    .map((brand): DashboardPinnedBrand => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      brandColor: brand.brand_color ?? "#0F766E",
      status: mapBrandStatus(brand.status),
      openTasksCount: openTasksCountByBrand.get(brand.slug) ?? 0,
      overdueTasksCount: overdueTasksCountByBrand.get(brand.slug) ?? 0,
      quickLinks: quickLinksByBrand.get(brand.slug) ?? [],
      readiness: buildBrandReadiness({
        description: brand.description,
        website: brand.website,
        contactsCount: contactsCountByBrand.get(brand.id) ?? 0,
        referenceLinks: brand.reference_links,
        quickLinksCount: (quickLinksByBrand.get(brand.slug) ?? []).length,
        brandVoice: brand.brand_voice,
        commonCtas: brand.common_ctas,
        audienceNotes: brand.audience_notes,
        servicesProducts: brand.services_products,
        pricingNotes: brand.pricing_notes,
        positioningNotes: brand.positioning_notes,
        doDontList: brand.do_dont_list,
      }),
      spotlightNote: spotlightNoteByBrand.get(brand.id) ?? null,
      nextUpcoming: nextUpcomingByBrand.get(brand.slug) ?? null,
    }));

  return {
    stats: {
      activeBrands: brands.length,
      pinnedBrands: pinnedBrands.length,
      tasksDueThisWeek: dueThisWeekTasks.length,
      overdueTasks: overdueTasks.length,
      upcomingItems: upcomingItems.length,
    },
    dueTodayTasks: dueTodayTasks.slice(0, 6),
    nextThreeDaysTasks: nextThreeDaysTasks.slice(0, 6),
    upcomingSoon: upcomingSoon.slice(0, 6),
    pinnedBrands,
    dueThisWeekTasks: dueThisWeekTasks.slice(0, 8),
    overdueTasks: overdueTasks.slice(0, 8),
    upcomingItems: upcomingItems.slice(0, 8),
    recentActivity: await recentActivityPromise,
    recentAssets,
    recentNotes,
    recentCampaigns,
    todayLabel: toISODate(baseDate),
  };
}
