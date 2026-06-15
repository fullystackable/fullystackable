import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { humanizeSnakeCase } from "@/lib/workspace-view";
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

type SeedBrandActivityRow = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

type SeedCampaignActivityRow = {
  id: string;
  brand_id: string;
  title: string;
  launch_date: string | null;
  created_at: string;
  updated_at: string;
};

type SeedTaskActivityRow = {
  id: string;
  brand_id: string;
  related_campaign_id: string | null;
  title: string;
  due_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type SeedAssetActivityRow = {
  id: string;
  brand_id: string;
  related_campaign_id: string | null;
  title: string;
  asset_type: string;
  created_at: string;
  updated_at: string;
};

type SeedContactActivityRow = {
  id: string;
  brand_id: string;
  name: string;
  role: string | null;
  company: string | null;
  created_at: string;
  updated_at: string;
};

type SeedNoteActivityRow = {
  id: string;
  brand_id: string;
  title: string | null;
  body: string;
  created_at: string;
  updated_at: string;
};

type SeedUpcomingActivityRow = {
  id: string;
  brand_id: string;
  related_campaign_id: string | null;
  title: string;
  type: string;
  status: string;
  date: string;
  created_at: string;
  updated_at: string;
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

type ActivityLogQueryError = {
  code?: string | null;
  message: string;
};

export function isMissingActivityLogTableError(error: ActivityLogQueryError) {
  return (
    error.code === "42P01" ||
    error.message.includes("public.activity_log") ||
    error.message.includes("schema cache")
  );
}

function toDateOnly(value: string) {
  return value.slice(0, 10);
}

function toActivityTimestamp(createdAt: string, updatedAt: string) {
  return updatedAt > createdAt ? updatedAt : createdAt;
}

function getSeedActivityAction(createdAt: string, updatedAt: string) {
  return updatedAt > createdAt ? "updated" : "created";
}

function truncateActivitySubject(value: string, maxLength = 48) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

function getUpcomingActivityLabel(type: string) {
  if (type === "campaign_launch") {
    return "Launch";
  }

  return humanizeSnakeCase(type);
}

function buildBrandLookupMap(brands: BrandLookupRow[]) {
  return new Map(brands.map((brand) => [brand.id, brand]));
}

function buildCampaignLookupMap(campaigns: CampaignLookupRow[]) {
  return new Map(campaigns.map((campaign) => [campaign.id, campaign]));
}

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

function buildActivityFeedItems(
  rows: ActivityLogRow[],
  brandsById: Map<string, BrandLookupRow>,
  campaignsById: Map<string, CampaignLookupRow>,
) {
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

async function loadActivityLookupMaps(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  rows: ActivityLogRow[],
) {
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

  return {
    brandsById: buildBrandLookupMap((brandsResult.data ?? []) as BrandLookupRow[]),
    campaignsById: buildCampaignLookupMap(
      (campaignsResult.data ?? []) as CampaignLookupRow[],
    ),
  };
}

async function getFallbackRecentActivityFeed(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  limit: number,
): Promise<ActivityFeedItem[]> {
  const [
    brandsResult,
    campaignsResult,
    tasksResult,
    assetsResult,
    contactsResult,
    notesResult,
    upcomingResult,
  ] = await Promise.all([
    supabase
      .from("brands")
      .select("id, slug, name, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit),
    supabase
      .from("campaigns")
      .select("id, brand_id, title, launch_date, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit),
    supabase
      .from("tasks")
      .select("id, brand_id, related_campaign_id, title, due_date, status, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit),
    supabase
      .from("assets")
      .select("id, brand_id, related_campaign_id, title, asset_type, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit),
    supabase
      .from("contacts")
      .select("id, brand_id, name, role, company, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit),
    supabase
      .from("notes")
      .select("id, brand_id, title, body, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit),
    supabase
      .from("upcoming_items")
      .select("id, brand_id, related_campaign_id, title, type, status, date, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit),
  ]);

  if (brandsResult.error) {
    throw new Error(`Failed to load fallback activity brands: ${brandsResult.error.message}`);
  }

  if (campaignsResult.error) {
    throw new Error(
      `Failed to load fallback activity campaigns: ${campaignsResult.error.message}`,
    );
  }

  if (tasksResult.error) {
    throw new Error(`Failed to load fallback activity tasks: ${tasksResult.error.message}`);
  }

  if (assetsResult.error) {
    throw new Error(`Failed to load fallback activity assets: ${assetsResult.error.message}`);
  }

  if (contactsResult.error) {
    throw new Error(
      `Failed to load fallback activity contacts: ${contactsResult.error.message}`,
    );
  }

  if (notesResult.error) {
    throw new Error(`Failed to load fallback activity notes: ${notesResult.error.message}`);
  }

  if (upcomingResult.error) {
    throw new Error(
      `Failed to load fallback activity upcoming items: ${upcomingResult.error.message}`,
    );
  }

  const brands = (brandsResult.data ?? []) as Array<BrandLookupRow & SeedBrandActivityRow>;
  const campaigns = (campaignsResult.data ?? []) as SeedCampaignActivityRow[];
  const rows: ActivityLogRow[] = [
    ...brands.map((brand) => ({
      id: `seed-brand-${brand.id}`,
      brand_id: brand.id,
      campaign_id: null,
      entity_type: "brand" as const,
      entity_label: "Brand",
      action: getSeedActivityAction(brand.created_at, brand.updated_at),
      subject: brand.name,
      details: null,
      created_at: toActivityTimestamp(brand.created_at, brand.updated_at),
    })),
    ...campaigns.map((campaign) => ({
      id: `seed-campaign-${campaign.id}`,
      brand_id: campaign.brand_id,
      campaign_id: campaign.id,
      entity_type: "campaign" as const,
      entity_label: "Campaign",
      action: getSeedActivityAction(campaign.created_at, campaign.updated_at),
      subject: campaign.title,
      details: campaign.launch_date ? `Launch ${campaign.launch_date}` : null,
      created_at: toActivityTimestamp(campaign.created_at, campaign.updated_at),
    })),
    ...((tasksResult.data ?? []) as SeedTaskActivityRow[]).map((task) => ({
      id: `seed-task-${task.id}`,
      brand_id: task.brand_id,
      campaign_id: task.related_campaign_id,
      entity_type: "task" as const,
      entity_label: "Task",
      action:
        task.status === "done"
          ? "completed"
          : getSeedActivityAction(task.created_at, task.updated_at),
      subject: task.title,
      details: task.due_date ? `Due ${task.due_date}` : null,
      created_at: toActivityTimestamp(task.created_at, task.updated_at),
    })),
    ...((assetsResult.data ?? []) as SeedAssetActivityRow[]).map((asset) => ({
      id: `seed-asset-${asset.id}`,
      brand_id: asset.brand_id,
      campaign_id: asset.related_campaign_id,
      entity_type: "asset" as const,
      entity_label: "Asset",
      action: getSeedActivityAction(asset.created_at, asset.updated_at),
      subject: asset.title,
      details: humanizeSnakeCase(asset.asset_type),
      created_at: toActivityTimestamp(asset.created_at, asset.updated_at),
    })),
    ...((contactsResult.data ?? []) as SeedContactActivityRow[]).map((contact) => ({
      id: `seed-contact-${contact.id}`,
      brand_id: contact.brand_id,
      campaign_id: null,
      entity_type: "contact" as const,
      entity_label: "Contact",
      action: getSeedActivityAction(contact.created_at, contact.updated_at),
      subject: contact.name,
      details: [contact.role, contact.company].filter(Boolean).join(" | ") || null,
      created_at: toActivityTimestamp(contact.created_at, contact.updated_at),
    })),
    ...((notesResult.data ?? []) as SeedNoteActivityRow[]).map((note) => ({
      id: `seed-note-${note.id}`,
      brand_id: note.brand_id,
      campaign_id: null,
      entity_type: "note" as const,
      entity_label: "Note",
      action: getSeedActivityAction(note.created_at, note.updated_at),
      subject: note.title || truncateActivitySubject(note.body),
      details: null,
      created_at: toActivityTimestamp(note.created_at, note.updated_at),
    })),
    ...((upcomingResult.data ?? []) as SeedUpcomingActivityRow[]).map((item) => ({
      id: `seed-upcoming-${item.id}`,
      brand_id: item.brand_id,
      campaign_id: item.related_campaign_id,
      entity_type: "upcoming_item" as const,
      entity_label: getUpcomingActivityLabel(item.type),
      action:
        item.status === "completed"
          ? "completed"
          : getSeedActivityAction(item.created_at, item.updated_at),
      subject: item.title,
      details: toDateOnly(item.date),
      created_at: toActivityTimestamp(item.created_at, item.updated_at),
    })),
  ]
    .sort((left, right) => right.created_at.localeCompare(left.created_at))
    .slice(0, limit);

  return buildActivityFeedItems(
    rows,
    buildBrandLookupMap(brands),
    buildCampaignLookupMap(
      campaigns.map((campaign) => ({
        id: campaign.id,
        brand_id: campaign.brand_id,
        title: campaign.title,
      })),
    ),
  );
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
    if (isMissingActivityLogTableError(error)) {
      return;
    }

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
    if (isMissingActivityLogTableError(error)) {
      return getFallbackRecentActivityFeed(supabase, limit);
    }

    throw new Error(`Failed to load activity feed: ${error.message}`);
  }

  const rows = (data ?? []) as ActivityLogRow[];
  if (rows.length === 0) {
    return getFallbackRecentActivityFeed(supabase, limit);
  }

  const { brandsById, campaignsById } = await loadActivityLookupMaps(supabase, rows);
  return buildActivityFeedItems(rows, brandsById, campaignsById);
}
