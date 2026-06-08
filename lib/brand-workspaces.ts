import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildStatusSummary,
  humanizeSnakeCase,
  mapBrandStatus,
  mapTaskPriority,
  mapTaskStatus,
  toISODateOnly,
  type BrandStatusValue,
  type BrandDirectoryItem,
  type BrandWorkspaceData,
} from "@/lib/workspace-view";

export type BrandDirectoryStatusFilter = BrandStatusValue | "all" | "current";

export type BrandDirectoryFilters = {
  query?: string | null;
  status?: string | null;
};

type BrandRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  website: string | null;
  status: "active" | "needs_attention" | "launching" | "archived";
  notes: string | null;
};

type TaskRow = {
  id: string;
  brand_id: string;
  related_campaign_id: string | null;
  title: string;
  due_date: string | null;
  status: "planned" | "in_progress" | "needs_review" | "done" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  notes: string | null;
};

type AssetRow = {
  id: string;
  brand_id: string;
  related_campaign_id: string | null;
  title: string;
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

type ContactRow = {
  id: string;
  brand_id: string;
  name: string;
  role: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  contact_type:
    | "owner"
    | "vendor"
    | "staff"
    | "ad_rep"
    | "designer"
    | "photographer"
    | "web"
    | "agency"
    | "other";
  notes: string | null;
};

type CampaignRow = {
  id: string;
  brand_id: string;
  title: string;
  description: string | null;
  status: "planned" | "active" | "paused" | "completed" | "archived";
  start_date: string | null;
  end_date: string | null;
  goals: string[] | null;
  notes: string | null;
};

type UpcomingItemRow = {
  id: string;
  brand_id: string;
  related_campaign_id: string | null;
  title: string;
  date: string;
  type: string;
  status: string;
  notes: string | null;
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

function normalizeBrandDirectoryStatusFilter(
  value: string | null | undefined,
): BrandDirectoryStatusFilter {
  const allowedValues = new Set<BrandDirectoryStatusFilter>([
    "current",
    "all",
    "active",
    "needs_attention",
    "launching",
    "archived",
  ]);

  if (value && allowedValues.has(value as BrandDirectoryStatusFilter)) {
    return value as BrandDirectoryStatusFilter;
  }

  return "current";
}

async function fetchBrands() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("brands")
    .select("id, slug, name, description, website, status, notes")
    .order("name");

  if (error) {
    throw new Error(`Failed to load brands: ${error.message}`);
  }

  return (data ?? []) as BrandRow[];
}

export async function getBrandDirectoryPageData(
  filters: BrandDirectoryFilters = {},
) {
  const brands = await fetchBrands();
  const query = (filters.query ?? "").trim();
  const status = normalizeBrandDirectoryStatusFilter(filters.status);
  const brandIds = brands.map((brand) => brand.id);

  if (brandIds.length === 0) {
    return {
      brands: [] as BrandDirectoryItem[],
      statusSummary: buildStatusSummary([]),
      totalBrands: 0,
      currentBrandsCount: 0,
      filteredCount: 0,
      activeFilters: {
        query,
        status,
      },
      hasFilters: Boolean(query) || status !== "current",
    };
  }

  const supabase = createSupabaseServerClient();
  const [tasksResult, assetsResult] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, brand_id, status, priority")
      .in("brand_id", brandIds),
    supabase.from("assets").select("id, brand_id").in("brand_id", brandIds),
  ]);

  if (tasksResult.error) {
    throw new Error(`Failed to load task summaries: ${tasksResult.error.message}`);
  }

  if (assetsResult.error) {
    throw new Error(`Failed to load asset summaries: ${assetsResult.error.message}`);
  }

  const tasksByBrand = new Map<
    string,
    { tasksCount: number; urgentTasks: number }
  >();
  const assetsCountByBrand = new Map<string, number>();

  for (const task of (tasksResult.data ?? []) as Array<
    Pick<TaskRow, "brand_id" | "status" | "priority">
  >) {
    const current = tasksByBrand.get(task.brand_id) ?? {
      tasksCount: 0,
      urgentTasks: 0,
    };

    current.tasksCount += 1;

    if (
      task.status !== "done" &&
      task.status !== "archived" &&
      (task.priority === "high" || task.priority === "urgent")
    ) {
      current.urgentTasks += 1;
    }

    tasksByBrand.set(task.brand_id, current);
  }

  for (const asset of (assetsResult.data ?? []) as Array<
    Pick<AssetRow, "brand_id">
  >) {
    assetsCountByBrand.set(
      asset.brand_id,
      (assetsCountByBrand.get(asset.brand_id) ?? 0) + 1,
    );
  }

  const directoryItems: BrandDirectoryItem[] = brands.map((brand) => {
    const taskSummary = tasksByBrand.get(brand.id);

    return {
      id: brand.id,
      slug: brand.slug,
      name: brand.name,
      description: brand.description ?? "No description added yet.",
      descriptionValue: brand.description,
      website: brand.website,
      status: mapBrandStatus(brand.status),
      statusValue: brand.status,
      brandNotes: brand.notes,
      tasksCount: taskSummary?.tasksCount ?? 0,
      assetsCount: assetsCountByBrand.get(brand.id) ?? 0,
      urgentTasks: taskSummary?.urgentTasks ?? 0,
    };
  });

  const currentBrandItems = directoryItems.filter(
    (brand) => brand.statusValue !== "archived",
  );
  const normalizedQuery = query.toLowerCase();
  const filteredBrands = directoryItems.filter((brand) => {
    if (status === "current" && brand.statusValue === "archived") {
      return false;
    }

    if (status !== "current" && status !== "all" && brand.statusValue !== status) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      brand.name,
      brand.descriptionValue ?? "",
      brand.website ?? "",
      brand.brandNotes ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  return {
    brands: filteredBrands,
    statusSummary: buildStatusSummary(currentBrandItems),
    totalBrands: directoryItems.length,
    currentBrandsCount: currentBrandItems.length,
    filteredCount: filteredBrands.length,
    activeFilters: {
      query,
      status,
    },
    hasFilters: Boolean(query) || status !== "current",
  };
}

export async function getBrandWorkspaceBySlug(slug: string) {
  const supabase = createSupabaseServerClient();
  const brandResult = await supabase
    .from("brands")
    .select("id, slug, name, description, website, status, notes")
    .eq("slug", slug)
    .maybeSingle();

  if (brandResult.error) {
    throw new Error(`Failed to load brand workspace: ${brandResult.error.message}`);
  }

  const brand = brandResult.data as BrandRow | null;

  if (!brand) {
    return null;
  }

  const [
    tasksResult,
    assetsResult,
    contactsResult,
    campaignsResult,
    upcomingResult,
    notesResult,
  ] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("id, brand_id, related_campaign_id, title, due_date, status, priority, notes")
        .eq("brand_id", brand.id)
        .order("due_date", { ascending: true }),
      supabase
        .from("assets")
        .select(
          "id, brand_id, related_campaign_id, title, asset_type, source_type, status, priority, url, storage_path, description, notes, updated_at",
        )
        .eq("brand_id", brand.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("contacts")
        .select("id, brand_id, name, role, company, email, phone, contact_type, notes")
        .eq("brand_id", brand.id)
        .order("name"),
      supabase
        .from("campaigns")
        .select(
          "id, brand_id, title, description, status, start_date, end_date, goals, notes",
        )
        .eq("brand_id", brand.id)
        .order("start_date", { ascending: true }),
      supabase
        .from("upcoming_items")
        .select("id, brand_id, related_campaign_id, title, date, type, status, notes")
        .eq("brand_id", brand.id)
        .order("date"),
      supabase
        .from("notes")
        .select("id, brand_id, title, body, category, pinned, created_at")
        .eq("brand_id", brand.id)
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false }),
    ]);

  if (tasksResult.error) {
    throw new Error(`Failed to load tasks: ${tasksResult.error.message}`);
  }

  if (assetsResult.error) {
    throw new Error(`Failed to load assets: ${assetsResult.error.message}`);
  }

  if (contactsResult.error) {
    throw new Error(`Failed to load contacts: ${contactsResult.error.message}`);
  }

  if (campaignsResult.error) {
    throw new Error(`Failed to load campaigns: ${campaignsResult.error.message}`);
  }

  if (upcomingResult.error) {
    throw new Error(`Failed to load upcoming items: ${upcomingResult.error.message}`);
  }

  if (notesResult.error) {
    throw new Error(`Failed to load notes: ${notesResult.error.message}`);
  }

  const campaignTitles = new Map(
    ((campaignsResult.data ?? []) as CampaignRow[]).map((campaign) => [
      campaign.id,
      campaign.title,
    ]),
  );

  return {
    id: brand.id,
    slug: brand.slug,
    name: brand.name,
    description: brand.description ?? "No description added yet.",
    descriptionValue: brand.description,
    website: brand.website,
    status: mapBrandStatus(brand.status),
    statusValue: brand.status,
    brandNotes: brand.notes,
    tasks: ((tasksResult.data ?? []) as TaskRow[]).map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: task.due_date,
      status: mapTaskStatus(task.status),
      priority: mapTaskPriority(task.priority),
      notes: task.notes,
      relatedCampaignId: task.related_campaign_id,
      relatedCampaignTitle: task.related_campaign_id
        ? campaignTitles.get(task.related_campaign_id) ?? null
        : null,
    })),
    assets: ((assetsResult.data ?? []) as AssetRow[]).map((asset) => ({
      id: asset.id,
      relatedCampaignId: asset.related_campaign_id,
      relatedCampaignTitle: asset.related_campaign_id
        ? campaignTitles.get(asset.related_campaign_id) ?? null
        : null,
      title: asset.title,
      type: humanizeSnakeCase(asset.asset_type),
      typeValue: asset.asset_type as AssetRow["asset_type"],
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
    contacts: ((contactsResult.data ?? []) as ContactRow[]).map((contact) => ({
      id: contact.id,
      name: contact.name,
      role: contact.role,
      company: contact.company,
      email: contact.email,
      phone: contact.phone,
      contactType: humanizeSnakeCase(contact.contact_type),
      contactTypeValue: contact.contact_type,
      notes: contact.notes,
    })),
    campaigns: ((campaignsResult.data ?? []) as CampaignRow[]).map((campaign) => ({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      status: humanizeSnakeCase(campaign.status),
      statusValue: campaign.status,
      startDate: campaign.start_date,
      endDate: campaign.end_date,
      goals: campaign.goals ?? [],
      notes: campaign.notes,
    })),
    upcoming: ((upcomingResult.data ?? []) as UpcomingItemRow[]).map((item) => ({
      id: item.id,
      title: item.title,
      date: toISODateOnly(item.date) ?? item.date,
      type: humanizeSnakeCase(item.type),
      status: humanizeSnakeCase(item.status),
      notes: item.notes,
      relatedCampaignId: item.related_campaign_id,
      relatedCampaignTitle: item.related_campaign_id
        ? campaignTitles.get(item.related_campaign_id) ?? null
        : null,
    })),
    notes: ((notesResult.data ?? []) as NoteRow[]).map((note) => ({
      id: note.id,
      title: note.title,
      text: note.body,
      createdAt: toISODateOnly(note.created_at) ?? note.created_at,
      category: humanizeSnakeCase(note.category),
      pinned: note.pinned,
    })),
  } satisfies BrandWorkspaceData;
}
