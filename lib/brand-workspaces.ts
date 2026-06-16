import "server-only";

import { buildBrandReadiness } from "@/lib/brand-readiness";
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
  brand_voice: string | null;
  common_ctas: string | null;
  audience_notes: string | null;
  services_products: string | null;
  pricing_notes: string | null;
  positioning_notes: string | null;
  do_dont_list: string | null;
  reference_links: string | null;
  brand_color: string | null;
  is_pinned: boolean;
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
  is_quick_link: boolean;
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
  launch_date: string | null;
  goals: string[] | null;
  notes: string | null;
  content_ideas: string | null;
  links: string | null;
  results_notes: string | null;
};

type UpcomingItemRow = {
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

type NoteRow = {
  id: string;
  brand_id: string;
  title: string | null;
  body: string;
  category:
    | "brand_voice"
    | "audience"
    | "cta"
    | "pricing"
    | "reminder"
    | "strategy"
    | "random";
  pinned: boolean;
  created_at: string;
};

type ContactSearchRow = Pick<ContactRow, "brand_id" | "name" | "email">;

type CampaignSearchRow = Pick<CampaignRow, "brand_id" | "title">;

type AssetSearchRow = Pick<AssetRow, "brand_id" | "title" | "url">;

type NoteSearchRow = Pick<NoteRow, "brand_id" | "body">;

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

function brandMatchesStatus(
  brandStatus: BrandStatusValue,
  filter: BrandDirectoryStatusFilter,
) {
  if (filter === "all") {
    return true;
  }

  if (filter === "current") {
    return brandStatus !== "archived";
  }

  return brandStatus === filter;
}

function includesNormalizedQuery(
  value: string | null | undefined,
  query: string,
) {
  return value?.toLowerCase().includes(query) ?? false;
}

function getBrandFieldMatchReason(brand: BrandRow, query: string) {
  if (includesNormalizedQuery(brand.name, query)) {
    return "Matched brand name";
  }

  if (includesNormalizedQuery(brand.description, query)) {
    return "Matched description";
  }

  if (includesNormalizedQuery(brand.notes, query)) {
    return "Matched brand notes";
  }

  if (includesNormalizedQuery(brand.website, query)) {
    return "Matched website";
  }

  return null;
}

function addSearchMatchReason(
  matchReasons: Map<string, string>,
  brandId: string,
  reason: string,
) {
  if (!matchReasons.has(brandId)) {
    matchReasons.set(brandId, reason);
  }
}

async function getRelatedBrandSearchMatches(
  brandIds: string[],
  normalizedQuery: string,
) {
  if (!normalizedQuery || brandIds.length === 0) {
    return new Map<string, string>();
  }

  const supabase = createSupabaseServerClient();
  const [contactsResult, campaignsResult, assetsResult, notesResult] =
    await Promise.all([
      supabase
        .from("contacts")
        .select("brand_id, name, email")
        .in("brand_id", brandIds),
      supabase.from("campaigns").select("brand_id, title").in("brand_id", brandIds),
      supabase.from("assets").select("brand_id, title, url").in("brand_id", brandIds),
      supabase.from("notes").select("brand_id, body").in("brand_id", brandIds),
    ]);

  if (contactsResult.error) {
    throw new Error(`Failed to search contacts: ${contactsResult.error.message}`);
  }

  if (campaignsResult.error) {
    throw new Error(`Failed to search campaigns: ${campaignsResult.error.message}`);
  }

  if (assetsResult.error) {
    throw new Error(`Failed to search assets: ${assetsResult.error.message}`);
  }

  if (notesResult.error) {
    throw new Error(`Failed to search notes: ${notesResult.error.message}`);
  }

  const matchReasons = new Map<string, string>();

  for (const contact of (contactsResult.data ?? []) as ContactSearchRow[]) {
    if (
      includesNormalizedQuery(contact.name, normalizedQuery) ||
      includesNormalizedQuery(contact.email, normalizedQuery)
    ) {
      addSearchMatchReason(matchReasons, contact.brand_id, "Matched contact");
    }
  }

  for (const campaign of (campaignsResult.data ?? []) as CampaignSearchRow[]) {
    if (includesNormalizedQuery(campaign.title, normalizedQuery)) {
      addSearchMatchReason(matchReasons, campaign.brand_id, "Matched campaign");
    }
  }

  for (const asset of (assetsResult.data ?? []) as AssetSearchRow[]) {
    if (
      includesNormalizedQuery(asset.title, normalizedQuery) ||
      includesNormalizedQuery(asset.url, normalizedQuery)
    ) {
      addSearchMatchReason(matchReasons, asset.brand_id, "Matched asset");
    }
  }

  for (const note of (notesResult.data ?? []) as NoteSearchRow[]) {
    if (includesNormalizedQuery(note.body, normalizedQuery)) {
      addSearchMatchReason(matchReasons, note.brand_id, "Matched note");
    }
  }

  return matchReasons;
}

async function fetchBrands() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("brands")
    .select(
      "id, slug, name, description, website, status, notes, brand_voice, common_ctas, audience_notes, services_products, pricing_notes, positioning_notes, do_dont_list, reference_links, brand_color, is_pinned",
    )
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
  const normalizedQuery = query.toLowerCase();
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
  const [tasksResult, assetsResult, campaignsResult, contactsResult] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, brand_id, status, priority")
      .in("brand_id", brandIds),
    supabase
      .from("assets")
      .select(
        "id, brand_id, related_campaign_id, title, asset_type, source_type, url, storage_path, is_quick_link",
      )
      .in("brand_id", brandIds),
    supabase
      .from("campaigns")
      .select("id, brand_id, title, status")
      .in("brand_id", brandIds)
      .order("title"),
    supabase.from("contacts").select("brand_id").in("brand_id", brandIds),
  ]);

  if (tasksResult.error) {
    throw new Error(`Failed to load task summaries: ${tasksResult.error.message}`);
  }

  if (assetsResult.error) {
    throw new Error(`Failed to load asset summaries: ${assetsResult.error.message}`);
  }

  if (campaignsResult.error) {
    throw new Error(`Failed to load campaign summaries: ${campaignsResult.error.message}`);
  }

  if (contactsResult.error) {
    throw new Error(`Failed to load contact summaries: ${contactsResult.error.message}`);
  }

  const tasksByBrand = new Map<
    string,
    { tasksCount: number; urgentTasks: number }
  >();
  const assetsCountByBrand = new Map<string, number>();
  const contactsCountByBrand = new Map<string, number>();
  const campaignsByBrand = new Map<
    string,
    Array<{
      id: string;
      title: string;
      status: string;
      statusValue: CampaignRow["status"];
    }>
  >();
  const quickLinksByBrand = new Map<
    string,
    Array<{
      id: string;
      title: string;
      url: string;
      type: string;
      relatedCampaignTitle: string | null;
    }>
  >();

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

  const campaignTitleById = new Map(
    ((campaignsResult.data ?? []) as Array<
      Pick<CampaignRow, "id" | "title">
    >).map((campaign) => [campaign.id, campaign.title]),
  );

  for (const asset of (assetsResult.data ?? []) as Array<
    Pick<
      AssetRow,
      | "id"
      | "brand_id"
      | "related_campaign_id"
      | "title"
      | "asset_type"
      | "source_type"
      | "url"
      | "is_quick_link"
    >
  >) {
    assetsCountByBrand.set(
      asset.brand_id,
      (assetsCountByBrand.get(asset.brand_id) ?? 0) + 1,
    );

    if (asset.is_quick_link && asset.source_type === "external_url" && asset.url) {
      const current = quickLinksByBrand.get(asset.brand_id) ?? [];
      current.push({
        id: asset.id,
        title: asset.title,
        url: asset.url,
        type: humanizeSnakeCase(asset.asset_type),
        relatedCampaignTitle: asset.related_campaign_id
          ? campaignTitleById.get(asset.related_campaign_id) ?? null
          : null,
      });
      quickLinksByBrand.set(asset.brand_id, current);
    }
  }

  for (const campaign of (campaignsResult.data ?? []) as Array<
    Pick<CampaignRow, "id" | "brand_id" | "title" | "status">
  >) {
    const current = campaignsByBrand.get(campaign.brand_id) ?? [];

    current.push({
      id: campaign.id,
      title: campaign.title,
      status: humanizeSnakeCase(campaign.status),
      statusValue: campaign.status,
    });

    campaignsByBrand.set(campaign.brand_id, current);
  }

  for (const contact of (contactsResult.data ?? []) as Array<
    Pick<ContactRow, "brand_id">
  >) {
    contactsCountByBrand.set(
      contact.brand_id,
      (contactsCountByBrand.get(contact.brand_id) ?? 0) + 1,
    );
  }

  const directoryItems: BrandDirectoryItem[] = brands.map((brand) => {
    const taskSummary = tasksByBrand.get(brand.id);
    const quickLinks = (quickLinksByBrand.get(brand.id) ?? [])
      .sort((left, right) => left.title.localeCompare(right.title))
      .slice(0, 4);

    return {
      id: brand.id,
      slug: brand.slug,
      name: brand.name,
      brandColor: brand.brand_color ?? "#0F766E",
      isPinned: brand.is_pinned,
      description: brand.description ?? "No description added yet.",
      descriptionValue: brand.description,
      website: brand.website,
      status: mapBrandStatus(brand.status),
      statusValue: brand.status,
      brandNotes: brand.notes,
      tasksCount: taskSummary?.tasksCount ?? 0,
      assetsCount: assetsCountByBrand.get(brand.id) ?? 0,
      urgentTasks: taskSummary?.urgentTasks ?? 0,
      searchMatchReason: null,
      quickLinks,
      readiness: buildBrandReadiness({
        description: brand.description,
        website: brand.website,
        contactsCount: contactsCountByBrand.get(brand.id) ?? 0,
        referenceLinks: brand.reference_links,
        quickLinksCount: quickLinks.length,
        brandVoice: brand.brand_voice,
        commonCtas: brand.common_ctas,
        audienceNotes: brand.audience_notes,
        servicesProducts: brand.services_products,
        pricingNotes: brand.pricing_notes,
        positioningNotes: brand.positioning_notes,
        doDontList: brand.do_dont_list,
      }),
      campaigns: campaignsByBrand.get(brand.id) ?? [],
    };
  });

  const currentBrandItems = directoryItems.filter(
    (brand) => brand.statusValue !== "archived",
  );
  const statusScopedBrands = brands.filter((brand) =>
    brandMatchesStatus(brand.status, status),
  );
  const searchMatchReasons = new Map<string, string>();

  if (normalizedQuery) {
    for (const brand of statusScopedBrands) {
      const reason = getBrandFieldMatchReason(brand, normalizedQuery);

      if (reason) {
        addSearchMatchReason(searchMatchReasons, brand.id, reason);
      }
    }

    const relatedSearchMatches = await getRelatedBrandSearchMatches(
      statusScopedBrands.map((brand) => brand.id),
      normalizedQuery,
    );

    for (const [brandId, reason] of relatedSearchMatches) {
      addSearchMatchReason(searchMatchReasons, brandId, reason);
    }
  }

  const filteredBrands = directoryItems
    .filter((brand) => brandMatchesStatus(brand.statusValue, status))
    .filter((brand) => {
      if (!normalizedQuery) {
        return true;
      }

      return searchMatchReasons.has(brand.id);
    })
    .map((brand) => ({
      ...brand,
      searchMatchReason: searchMatchReasons.get(brand.id) ?? null,
    }))
    .sort((left, right) => {
      if (left.isPinned !== right.isPinned) {
        return left.isPinned ? -1 : 1;
      }

      return left.name.localeCompare(right.name);
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
    .select(
      "id, slug, name, description, website, status, notes, brand_voice, common_ctas, audience_notes, services_products, pricing_notes, positioning_notes, do_dont_list, reference_links, brand_color, is_pinned",
    )
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
          "id, brand_id, related_campaign_id, title, asset_category, asset_type, source_type, status, priority, url, storage_path, description, notes, updated_at, is_quick_link",
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
          "id, brand_id, title, description, status, start_date, end_date, launch_date, goals, notes, content_ideas, links, results_notes",
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

  const mappedAssets = ((assetsResult.data ?? []) as AssetRow[]).map((asset) => ({
    id: asset.id,
    relatedCampaignId: asset.related_campaign_id,
    relatedCampaignTitle: asset.related_campaign_id
      ? campaignTitles.get(asset.related_campaign_id) ?? null
      : null,
    title: asset.title,
    category: humanizeSnakeCase(asset.asset_category),
    categoryValue: asset.asset_category,
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
    isQuickLink: asset.is_quick_link,
  }));
  const quickLinks = mappedAssets
    .filter((asset) => asset.isQuickLink && asset.url)
    .map((asset) => ({
      id: asset.id,
      title: asset.title,
      url: asset.url!,
      type: asset.type,
      relatedCampaignTitle: asset.relatedCampaignTitle,
    }))
    .sort((left, right) => left.title.localeCompare(right.title));
  const contactsCount = ((contactsResult.data ?? []) as ContactRow[]).length;

  return {
    id: brand.id,
    slug: brand.slug,
    name: brand.name,
    brandColor: brand.brand_color ?? "#0F766E",
    isPinned: brand.is_pinned,
    description: brand.description ?? "No description added yet.",
    descriptionValue: brand.description,
    website: brand.website,
    status: mapBrandStatus(brand.status),
    statusValue: brand.status,
    brandNotes: brand.notes,
    brandVoice: brand.brand_voice,
    commonCtas: brand.common_ctas,
    audienceNotes: brand.audience_notes,
    servicesProducts: brand.services_products,
    pricingNotes: brand.pricing_notes,
    positioningNotes: brand.positioning_notes,
    doDontList: brand.do_dont_list,
    referenceLinks: brand.reference_links,
    quickLinks,
    readiness: buildBrandReadiness({
      description: brand.description,
      website: brand.website,
      contactsCount,
      referenceLinks: brand.reference_links,
      quickLinksCount: quickLinks.length,
      brandVoice: brand.brand_voice,
      commonCtas: brand.common_ctas,
      audienceNotes: brand.audience_notes,
      servicesProducts: brand.services_products,
      pricingNotes: brand.pricing_notes,
      positioningNotes: brand.positioning_notes,
      doDontList: brand.do_dont_list,
    }),
    tasks: ((tasksResult.data ?? []) as TaskRow[]).map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: task.due_date,
      status: mapTaskStatus(task.status),
      statusValue: task.status,
      priority: mapTaskPriority(task.priority),
      priorityValue: task.priority,
      notes: task.notes,
      relatedCampaignId: task.related_campaign_id,
      relatedCampaignTitle: task.related_campaign_id
        ? campaignTitles.get(task.related_campaign_id) ?? null
        : null,
    })),
    assets: mappedAssets,
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
      launchDate: campaign.launch_date,
      goals: campaign.goals ?? [],
      notes: campaign.notes,
      contentIdeas: campaign.content_ideas,
      links: campaign.links,
      resultsNotes: campaign.results_notes,
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
      categoryValue: note.category,
      pinned: note.pinned,
    })),
  } satisfies BrandWorkspaceData;
}
