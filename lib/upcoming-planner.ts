import "server-only";

import { compareDateStrings, toISODate } from "./date";
import {
  getUpcomingTypeLabel,
  type PlannerUpcomingItem,
} from "./upcoming-planner-helpers";
import { createSupabaseServerClient } from "./supabase/server";
import { buildWorkspaceViewHref } from "./workspace-url-state";
import { humanizeSnakeCase } from "./workspace-view";

type BrandRow = {
  id: string;
  slug: string;
  name: string;
  status: "active" | "needs_attention" | "launching" | "archived";
  brand_color: string | null;
};

type CampaignRow = {
  id: string;
  brand_id: string;
  title: string;
};

type UpcomingRow = {
  id: string;
  brand_id: string;
  related_campaign_id: string | null;
  title: string;
  date: string;
  type:
    | "meeting"
    | "event"
    | "campaign_launch"
    | "deadline"
    | "reminder"
    | "seasonal";
  status: "scheduled" | "completed" | "canceled" | "postponed";
  notes: string | null;
};

type BrandLookup = {
  slug: string;
  name: string;
  brandColor: string;
};

export type UpcomingPlannerData = {
  today: string;
  totalUpcomingCount: number;
  items: PlannerUpcomingItem[];
};

export * from "./upcoming-planner-helpers";

function buildBrandLookup(brands: BrandRow[]) {
  return new Map<string, BrandLookup>(
    brands.map((brand) => [
      brand.id,
      {
        slug: brand.slug,
        name: brand.name,
        brandColor: brand.brand_color ?? "#0F766E",
      },
    ]),
  );
}

export async function getUpcomingPlannerData(
  baseDate: Date = new Date(),
): Promise<UpcomingPlannerData> {
  const supabase = createSupabaseServerClient();
  const [brandsResult, campaignsResult, upcomingResult] = await Promise.all([
    supabase
      .from("brands")
      .select("id, slug, name, status, brand_color")
      .neq("status", "archived")
      .order("name"),
    supabase.from("campaigns").select("id, brand_id, title").order("title"),
    supabase
      .from("upcoming_items")
      .select("id, brand_id, related_campaign_id, title, date, type, status, notes")
      .neq("status", "canceled"),
  ]);

  if (brandsResult.error) {
    throw new Error(`Failed to load planner brands: ${brandsResult.error.message}`);
  }

  if (campaignsResult.error) {
    throw new Error(`Failed to load planner campaigns: ${campaignsResult.error.message}`);
  }

  if (upcomingResult.error) {
    throw new Error(`Failed to load planner upcoming items: ${upcomingResult.error.message}`);
  }

  const brands = (brandsResult.data ?? []) as BrandRow[];
  const brandsById = buildBrandLookup(brands);
  const campaignsById = new Map(
    ((campaignsResult.data ?? []) as CampaignRow[]).map((campaign) => [
      campaign.id,
      campaign.title,
    ]),
  );
  const today = toISODate(baseDate);

  const items = ((upcomingResult.data ?? []) as UpcomingRow[])
    .filter((item) => item.status !== "completed")
    .map((item): PlannerUpcomingItem | null => {
      const brand = brandsById.get(item.brand_id);

      if (!brand) {
        return null;
      }

      const date = item.date.slice(0, 10);

      if (compareDateStrings(date, today) < 0) {
        return null;
      }

      return {
        id: item.id,
        title: item.title,
        date,
        notes: item.notes,
        typeLabel: getUpcomingTypeLabel(item.type),
        statusLabel: humanizeSnakeCase(item.status),
        brandName: brand.name,
        brandSlug: brand.slug,
        brandColor: brand.brandColor,
        campaignId: item.related_campaign_id,
        campaignTitle: item.related_campaign_id
          ? campaignsById.get(item.related_campaign_id) ?? null
          : null,
        href: buildWorkspaceViewHref(brand.slug, {
          activeCampaignId: item.related_campaign_id,
          tab: "upcoming",
          hash: "#upcoming",
        }),
      };
    })
    .filter((item): item is PlannerUpcomingItem => item !== null)
    .sort((left, right) => {
      const byDate = compareDateStrings(left.date, right.date);

      if (byDate !== 0) {
        return byDate;
      }

      return left.title.localeCompare(right.title);
    });

  return {
    today,
    totalUpcomingCount: items.length,
    items,
  };
}
