import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  humanizeSnakeCase,
  mapBrandStatus,
  mapTaskPriority,
  mapTaskStatus,
  type CampaignWorkspaceData,
} from "@/lib/workspace-view";

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
  description: string | null;
  status: "planned" | "active" | "paused" | "completed" | "archived";
  start_date: string | null;
  end_date: string | null;
  launch_date: string | null;
  goals: string[] | null;
  notes: string | null;
  content_ideas: string | null;
  links: string | null;
  results_notes: string | null;
};

type TaskRow = {
  id: string;
  related_campaign_id: string | null;
  title: string;
  due_date: string | null;
  status: "planned" | "in_progress" | "needs_review" | "done" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  notes: string | null;
};

type AssetRow = {
  id: string;
  related_campaign_id: string | null;
  title: string;
  asset_category:
    | "folder"
    | "canva"
    | "website_admin"
    | "social_profile"
    | "ad_platform"
    | "analytics"
    | "crm"
    | "document"
    | "creative_asset"
    | "other";
  asset_type:
    | "logo"
    | "brand_guidelines"
    | "canva_design"
    | "photo_folder"
    | "video_folder"
    | "ad_creative"
    | "print_file"
    | "website_link"
    | "social_profile"
    | "google_drive_folder"
    | "dropbox_folder"
    | "document"
    | "spreadsheet"
    | "pdf"
    | "contract"
    | "vendor_file"
    | "campaign_asset"
    | "other";
  source_type: "external_url" | "upload" | "reference";
  status: "active" | "outdated" | "draft" | "archived";
  priority: "low" | "medium" | "high";
  url: string | null;
  storage_path: string | null;
  description: string | null;
  notes: string | null;
  updated_at: string;
};

type UpcomingItemRow = {
  id: string;
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

function toISODateOnly(value: string | null) {
  return value ? value.slice(0, 10) : null;
}

export async function getCampaignWorkspaceById(
  brandSlug: string,
  campaignId: string,
) {
  const supabase = createSupabaseServerClient();
  const brandResult = await supabase
    .from("brands")
    .select("id, slug, name, status, brand_color")
    .eq("slug", brandSlug)
    .maybeSingle();

  if (brandResult.error) {
    throw new Error(`Failed to load campaign brand: ${brandResult.error.message}`);
  }

  const brand = brandResult.data as BrandRow | null;

  if (!brand) {
    return null;
  }

  const [campaignResult, tasksResult, assetsResult, upcomingResult, campaignsResult] =
    await Promise.all([
      supabase
        .from("campaigns")
        .select(
          "id, brand_id, title, description, status, start_date, end_date, launch_date, goals, notes, content_ideas, links, results_notes",
        )
        .eq("id", campaignId)
        .eq("brand_id", brand.id)
        .maybeSingle(),
      supabase
        .from("tasks")
        .select("id, related_campaign_id, title, due_date, status, priority, notes")
        .eq("brand_id", brand.id)
        .eq("related_campaign_id", campaignId)
        .order("due_date", { ascending: true }),
      supabase
        .from("assets")
        .select(
          "id, related_campaign_id, title, asset_category, asset_type, source_type, status, priority, url, storage_path, description, notes, updated_at",
        )
        .eq("brand_id", brand.id)
        .eq("related_campaign_id", campaignId)
        .order("updated_at", { ascending: false }),
      supabase
        .from("upcoming_items")
        .select("id, related_campaign_id, title, date, type, status, notes")
        .eq("brand_id", brand.id)
        .eq("related_campaign_id", campaignId)
        .order("date", { ascending: true }),
      supabase
        .from("campaigns")
        .select(
          "id, brand_id, title, description, status, start_date, end_date, launch_date, goals, notes, content_ideas, links, results_notes",
        )
        .eq("brand_id", brand.id)
        .order("start_date", { ascending: true }),
    ]);

  if (campaignResult.error) {
    throw new Error(`Failed to load campaign: ${campaignResult.error.message}`);
  }

  if (tasksResult.error) {
    throw new Error(`Failed to load campaign tasks: ${tasksResult.error.message}`);
  }

  if (assetsResult.error) {
    throw new Error(`Failed to load campaign assets: ${assetsResult.error.message}`);
  }

  if (upcomingResult.error) {
    throw new Error(`Failed to load campaign deadlines: ${upcomingResult.error.message}`);
  }

  if (campaignsResult.error) {
    throw new Error(`Failed to load brand campaigns: ${campaignsResult.error.message}`);
  }

  const campaign = campaignResult.data as CampaignRow | null;

  if (!campaign) {
    return null;
  }

  const brandCampaigns = ((campaignsResult.data ?? []) as CampaignRow[]).map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    status: humanizeSnakeCase(item.status),
    statusValue: item.status,
    startDate: toISODateOnly(item.start_date),
    endDate: toISODateOnly(item.end_date),
    launchDate: toISODateOnly(item.launch_date),
    goals: item.goals ?? [],
    notes: item.notes,
    contentIdeas: item.content_ideas,
    links: item.links,
    resultsNotes: item.results_notes,
  }));

  return {
    id: campaign.id,
    brandId: brand.id,
    brandSlug: brand.slug,
    brandName: brand.name,
    brandStatus: mapBrandStatus(brand.status),
    brandColor: brand.brand_color ?? "#0F766E",
    title: campaign.title,
    description: campaign.description,
    status: humanizeSnakeCase(campaign.status),
    statusValue: campaign.status,
    startDate: toISODateOnly(campaign.start_date),
    endDate: toISODateOnly(campaign.end_date),
    launchDate: toISODateOnly(campaign.launch_date),
    goals: campaign.goals ?? [],
    notes: campaign.notes,
    contentIdeas: campaign.content_ideas,
    links: campaign.links,
    resultsNotes: campaign.results_notes,
    brandCampaigns,
    tasks: ((tasksResult.data ?? []) as TaskRow[]).map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: toISODateOnly(task.due_date),
      status: mapTaskStatus(task.status),
      statusValue: task.status,
      priority: mapTaskPriority(task.priority),
      priorityValue: task.priority,
      notes: task.notes,
      relatedCampaignId: task.related_campaign_id,
      relatedCampaignTitle: campaign.title,
    })),
    assets: ((assetsResult.data ?? []) as AssetRow[]).map((asset) => ({
      id: asset.id,
      relatedCampaignId: asset.related_campaign_id,
      relatedCampaignTitle: campaign.title,
      title: asset.title,
      category: humanizeSnakeCase(asset.asset_category),
      categoryValue: asset.asset_category,
      type: humanizeSnakeCase(asset.asset_type),
      typeValue: asset.asset_type,
      sourceType: humanizeSnakeCase(asset.source_type),
      sourceTypeValue: asset.source_type,
      status: humanizeSnakeCase(asset.status),
      statusValue: asset.status,
      priority: humanizeSnakeCase(asset.priority),
      priorityValue: asset.priority,
      url: asset.url,
      storagePath: asset.storage_path,
      description: asset.description,
      notes: asset.notes,
      updatedAt: toISODateOnly(asset.updated_at) ?? asset.updated_at,
    })),
    upcoming: ((upcomingResult.data ?? []) as UpcomingItemRow[]).map((item) => ({
      id: item.id,
      title: item.title,
      date: toISODateOnly(item.date) ?? item.date,
      type: humanizeSnakeCase(item.type),
      typeValue: item.type,
      status: humanizeSnakeCase(item.status),
      statusValue: item.status,
      notes: item.notes,
      relatedCampaignId: item.related_campaign_id,
      relatedCampaignTitle: campaign.title,
    })),
  } satisfies CampaignWorkspaceData;
}
