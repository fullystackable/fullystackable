import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildCampaignWorkspaceHref,
  buildWorkspaceViewHref,
} from "@/lib/workspace-url-state";

export type ActivityEntityType =
  | "brand"
  | "task"
  | "asset"
  | "contact"
  | "note"
  | "campaign"
  | "upcoming_item";

type ActivityLogRow = {
  id: string;
  brand_id: string | null;
  campaign_id: string | null;
  entity_type: ActivityEntityType;
  entity_label: string;
  action: string;
  subject: string | null;
  details: string | null;
  created_at: string;
};

type BrandLookupRow = {
  id: string;
  slug: string;
  name: string;
};

type CampaignLookupRow = {
  id: string;
  brand_id: string;
  title: string;
};

export type ActivityFeedItem = {
  id: string;
  title: string;
  subject: string | null;
  details: string | null;
  createdAt: string;
  brandName: string | null;
  brandSlug: string | null;
  campaignTitle: string | null;
  href: string | null;
};

export type CreateActivityLogInput = {
  brandId?: string | null;
  campaignId?: string | null;
  entityType: ActivityEntityType;
  entityLabel: string;
  action: string;
  subject?: string | null;
  details?: string | null;
};

function buildActivityHref(
  row: ActivityLogRow,
  brand: BrandLookupRow | null,
  campaign: CampaignLookupRow | null,
) {
  if (!brand) {
    return null;
  }

  switch (row.entity_type) {
    case "campaign":
      return campaign
        ? buildCampaignWorkspaceHref(brand.slug, campaign.id)
        : buildWorkspaceViewHref(brand.slug, {
            hash: "#campaigns",
          });
    case "task":
      return campaign
        ? buildCampaignWorkspaceHref(brand.slug, campaign.id, {
            tab: "tasks",
            hash: "#tasks",
          })
        : buildWorkspaceViewHref(brand.slug, {
            tab: "tasks",
            hash: "#tasks",
          });
    case "asset":
      return campaign
        ? buildCampaignWorkspaceHref(brand.slug, campaign.id, {
            tab: "assets",
            hash: "#assets",
          })
        : buildWorkspaceViewHref(brand.slug, {
            tab: "assets",
            hash: "#assets",
          });
    case "upcoming_item":
      return campaign
        ? buildCampaignWorkspaceHref(brand.slug, campaign.id, {
            tab: "deadlines",
            hash: "#deadlines",
          })
        : buildWorkspaceViewHref(brand.slug, {
            tab: "upcoming",
            hash: "#upcoming",
          });
    case "contact":
      return buildWorkspaceViewHref(brand.slug, {
        tab: "contacts",
        hash: "#contacts",
      });
    case "note":
      return buildWorkspaceViewHref(brand.slug, {
        tab: "notes",
        hash: "#notes",
      });
    case "brand":
    default:
      return buildWorkspaceViewHref(brand.slug, {
        tab: "profile",
        hash: "#profile",
      });
  }
}

export async function createActivityLogEntry({
  brandId = null,
  campaignId = null,
  entityType,
  entityLabel,
  action,
  subject = null,
  details = null,
}: CreateActivityLogInput) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("activity_log").insert({
    brand_id: brandId,
    campaign_id: campaignId,
    entity_type: entityType,
    entity_label: entityLabel,
    action,
    subject: subject || null,
    details: details || null,
  });

  if (error) {
    throw new Error(`Failed to write activity log entry: ${error.message}`);
  }
}

export async function getRecentActivityFeed(limit = 20): Promise<ActivityFeedItem[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("activity_log")
    .select(
      "id, brand_id, campaign_id, entity_type, entity_label, action, subject, details, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    const isMissingActivityLogTable =
      error.code === "42P01" ||
      error.message.includes("public.activity_log") ||
      error.message.includes("schema cache");

    if (isMissingActivityLogTable) {
      return [];
    }

    throw new Error(`Failed to load activity feed: ${error.message}`);
  }

  const rows = (data ?? []) as ActivityLogRow[];
  const brandIds = [...new Set(rows.map((row) => row.brand_id).filter(Boolean))];
  const campaignIds = [...new Set(rows.map((row) => row.campaign_id).filter(Boolean))];

  const [brandsResult, campaignsResult] = await Promise.all([
    brandIds.length > 0
      ? supabase.from("brands").select("id, slug, name").in("id", brandIds)
      : Promise.resolve({ data: [], error: null }),
    campaignIds.length > 0
      ? supabase.from("campaigns").select("id, brand_id, title").in("id", campaignIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (brandsResult.error) {
    throw new Error(`Failed to load activity brands: ${brandsResult.error.message}`);
  }

  if (campaignsResult.error) {
    throw new Error(`Failed to load activity campaigns: ${campaignsResult.error.message}`);
  }

  const brandsById = new Map(
    ((brandsResult.data ?? []) as BrandLookupRow[]).map((brand) => [brand.id, brand]),
  );
  const campaignsById = new Map(
    ((campaignsResult.data ?? []) as CampaignLookupRow[]).map((campaign) => [
      campaign.id,
      campaign,
    ]),
  );

  return rows.map((row) => {
    const brand = row.brand_id ? brandsById.get(row.brand_id) ?? null : null;
    const campaign = row.campaign_id
      ? campaignsById.get(row.campaign_id) ?? null
      : null;

    return {
      id: row.id,
      title: `${row.entity_label} ${row.action}`,
      subject: row.subject,
      details: row.details,
      createdAt: row.created_at,
      brandName: brand?.name ?? null,
      brandSlug: brand?.slug ?? null,
      campaignTitle: campaign?.title ?? null,
      href: buildActivityHref(row, brand, campaign),
    };
  });
}
