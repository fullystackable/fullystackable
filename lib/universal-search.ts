import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildCampaignWorkspaceHref,
  buildWorkspaceViewHref,
} from "@/lib/workspace-url-state";
import {
  humanizeSnakeCase,
  mapBrandStatus,
  mapTaskPriority,
  mapTaskStatus,
} from "@/lib/workspace-view";

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
  asset_category: string;
  asset_type: string;
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
  contact_type: string;
  notes: string | null;
};

type NoteRow = {
  id: string;
  brand_id: string;
  title: string | null;
  body: string;
  category: string;
  created_at: string;
};

type CampaignRow = {
  id: string;
  brand_id: string;
  title: string;
  description: string | null;
  status: string;
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
  type: string;
  status: string;
  notes: string | null;
};

type BrandLookup = {
  id: string;
  slug: string;
  name: string;
  status: ReturnType<typeof mapBrandStatus>;
  website: string | null;
  referenceLinks: string | null;
};

export type SearchResultType =
  | "brands"
  | "tasks"
  | "assets"
  | "contacts"
  | "notes"
  | "campaigns"
  | "upcoming"
  | "links";

export type UniversalSearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  href: string;
  meta: string;
  badge: string;
  externalHref?: string;
  workspaceHref?: string;
};

export type UniversalSearchSection = {
  type: SearchResultType;
  title: string;
  results: UniversalSearchResult[];
};

export type UniversalSearchData = {
  query: string;
  totalResults: number;
  sections: UniversalSearchSection[];
};

const sectionOrder: Array<{ type: SearchResultType; title: string }> = [
  { type: "brands", title: "Brands" },
  { type: "tasks", title: "Tasks" },
  { type: "assets", title: "Assets" },
  { type: "contacts", title: "Contacts" },
  { type: "notes", title: "Notes" },
  { type: "campaigns", title: "Campaigns" },
  { type: "upcoming", title: "Upcoming items" },
  { type: "links", title: "Links" },
];

function includesNormalizedQuery(value: string | null | undefined, query: string) {
  return value?.toLowerCase().includes(query) ?? false;
}

function toDateOnly(value: string | null) {
  return value?.slice(0, 10) ?? null;
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

function buildBrandLookup(brands: BrandRow[]) {
  return new Map<string, BrandLookup>(
    brands.map((brand) => [
      brand.id,
      {
        id: brand.id,
        slug: brand.slug,
        name: brand.name,
        status: mapBrandStatus(brand.status),
        website: brand.website,
        referenceLinks: brand.reference_links,
      },
    ]),
  );
}

function normalizeExternalLink(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(value)) {
    return `https://${value}`;
  }

  return null;
}

function splitLines(value: string | null | undefined) {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function sortResults(results: UniversalSearchResult[]) {
  return [...results].sort((left, right) => {
    if (left.meta !== right.meta) {
      return left.meta.localeCompare(right.meta);
    }

    return left.title.localeCompare(right.title);
  });
}

export async function getUniversalSearchData(
  rawQuery: string | null | undefined,
): Promise<UniversalSearchData> {
  const query = (rawQuery ?? "").trim();
  const normalizedQuery = query.toLowerCase();

  if (!normalizedQuery) {
    return {
      query,
      totalResults: 0,
      sections: [],
    };
  }

  const supabase = createSupabaseServerClient();
  const [
    brandsResult,
    tasksResult,
    assetsResult,
    contactsResult,
    notesResult,
    campaignsResult,
    upcomingResult,
  ] = await Promise.all([
    supabase
      .from("brands")
      .select(
        "id, slug, name, description, website, status, notes, brand_voice, common_ctas, audience_notes, services_products, pricing_notes, positioning_notes, do_dont_list, reference_links",
      )
      .order("name"),
    supabase
      .from("tasks")
      .select("id, brand_id, related_campaign_id, title, due_date, status, priority, notes"),
    supabase
      .from("assets")
      .select(
        "id, brand_id, related_campaign_id, title, asset_category, asset_type, source_type, status, priority, url, storage_path, description, notes, updated_at",
      ),
    supabase
      .from("contacts")
      .select("id, brand_id, name, role, company, email, phone, contact_type, notes"),
    supabase
      .from("notes")
      .select("id, brand_id, title, body, category, created_at"),
    supabase
      .from("campaigns")
      .select(
        "id, brand_id, title, description, status, start_date, end_date, launch_date, goals, notes, content_ideas, links, results_notes",
      ),
    supabase
      .from("upcoming_items")
      .select("id, brand_id, related_campaign_id, title, date, type, status, notes"),
  ]);

  if (brandsResult.error) {
    throw new Error(`Failed to search brands: ${brandsResult.error.message}`);
  }

  if (tasksResult.error) {
    throw new Error(`Failed to search tasks: ${tasksResult.error.message}`);
  }

  if (assetsResult.error) {
    throw new Error(`Failed to search assets: ${assetsResult.error.message}`);
  }

  if (contactsResult.error) {
    throw new Error(`Failed to search contacts: ${contactsResult.error.message}`);
  }

  if (notesResult.error) {
    throw new Error(`Failed to search notes: ${notesResult.error.message}`);
  }

  if (campaignsResult.error) {
    throw new Error(`Failed to search campaigns: ${campaignsResult.error.message}`);
  }

  if (upcomingResult.error) {
    throw new Error(`Failed to search upcoming items: ${upcomingResult.error.message}`);
  }

  const brands = (brandsResult.data ?? []) as BrandRow[];
  const brandLookup = buildBrandLookup(brands);
  const campaignLookup = new Map(
    ((campaignsResult.data ?? []) as CampaignRow[]).map((campaign) => [
      campaign.id,
      campaign.title,
    ]),
  );

  const resultsByType = new Map<SearchResultType, UniversalSearchResult[]>(
    sectionOrder.map((section) => [section.type, []]),
  );

  for (const brand of brands) {
    if (
      [
        brand.name,
        brand.description,
        brand.website,
        brand.notes,
        brand.brand_voice,
        brand.common_ctas,
        brand.audience_notes,
        brand.services_products,
        brand.pricing_notes,
        brand.positioning_notes,
        brand.do_dont_list,
        brand.reference_links,
      ].some((value) => includesNormalizedQuery(value, normalizedQuery))
    ) {
      resultsByType.get("brands")?.push({
        id: brand.id,
        type: "brands",
        title: brand.name,
        description: truncateText(
          brand.description ??
            brand.notes ??
            brand.brand_voice ??
            "Brand workspace match.",
          160,
        ),
        href: `/brands/${brand.slug}`,
        meta: brand.status === "archived" ? "Archived brand" : "Brand workspace",
        badge: mapBrandStatus(brand.status),
      });
    }

    if (
      includesNormalizedQuery(brand.website, normalizedQuery) &&
      brand.website
    ) {
      resultsByType.get("links")?.push({
        id: `${brand.id}-website`,
        type: "links",
        title: `${brand.name} website`,
        description: brand.website,
        href: brand.website,
        externalHref: brand.website,
        workspaceHref: buildWorkspaceViewHref(brand.slug, {
          tab: "profile",
          hash: "#profile",
        }),
        meta: `${brand.name} | Brand website`,
        badge: "Website",
      });
    }

    for (const [index, linkLine] of splitLines(brand.reference_links).entries()) {
      const normalizedLink = normalizeExternalLink(linkLine);

      if (!normalizedLink || !includesNormalizedQuery(linkLine, normalizedQuery)) {
        continue;
      }

      resultsByType.get("links")?.push({
        id: `${brand.id}-reference-${index}`,
        type: "links",
        title: `${brand.name} reference link`,
        description: linkLine,
        href: normalizedLink,
        externalHref: normalizedLink,
        workspaceHref: buildWorkspaceViewHref(brand.slug, {
          tab: "profile",
          hash: "#profile",
        }),
        meta: `${brand.name} | Brand reference`,
        badge: "Reference",
      });
    }
  }

  for (const task of (tasksResult.data ?? []) as TaskRow[]) {
    const brand = brandLookup.get(task.brand_id);

    if (!brand) {
      continue;
    }

    if (
      [
        task.title,
        task.notes,
        task.due_date,
        mapTaskStatus(task.status),
        mapTaskPriority(task.priority),
      ].some((value) => includesNormalizedQuery(value, normalizedQuery))
    ) {
      resultsByType.get("tasks")?.push({
        id: task.id,
        type: "tasks",
        title: task.title,
        description: truncateText(
          task.notes ?? `Due ${toDateOnly(task.due_date) ?? "unscheduled"}.`,
          160,
        ),
        href: buildWorkspaceViewHref(brand.slug, {
          activeCampaignId: task.related_campaign_id,
          hash: "#tasks",
        }),
        meta: `${brand.name} | ${mapTaskStatus(task.status)} | ${mapTaskPriority(task.priority)}`,
        badge: "Task",
      });
    }
  }

  for (const asset of (assetsResult.data ?? []) as AssetRow[]) {
    const brand = brandLookup.get(asset.brand_id);

    if (!brand) {
      continue;
    }

    if (
      [
        asset.title,
        asset.description,
        asset.notes,
        asset.url,
        asset.storage_path,
        humanizeSnakeCase(asset.asset_category),
        humanizeSnakeCase(asset.asset_type),
        humanizeSnakeCase(asset.source_type),
        humanizeSnakeCase(asset.status),
        humanizeSnakeCase(asset.priority),
      ].some((value) => includesNormalizedQuery(value, normalizedQuery))
    ) {
      resultsByType.get("assets")?.push({
        id: asset.id,
        type: "assets",
        title: asset.title,
        description: truncateText(
          asset.description ?? asset.notes ?? asset.url ?? "Asset record match.",
          160,
        ),
        href: buildWorkspaceViewHref(brand.slug, {
          activeCampaignId: asset.related_campaign_id,
          tab: "assets",
          hash: "#assets",
        }),
        meta: `${brand.name} | ${humanizeSnakeCase(asset.asset_type)} | ${humanizeSnakeCase(asset.status)}`,
        badge: "Asset",
      });
    }

    if (asset.url && includesNormalizedQuery(asset.url, normalizedQuery)) {
      resultsByType.get("links")?.push({
        id: `${asset.id}-asset-link`,
        type: "links",
        title: asset.title,
        description: asset.url,
        href: asset.url,
        externalHref: asset.url,
        workspaceHref: buildWorkspaceViewHref(brand.slug, {
          activeCampaignId: asset.related_campaign_id,
          tab: "assets",
          hash: "#assets",
        }),
        meta: `${brand.name} | Asset link`,
        badge: "Asset URL",
      });
    }
  }

  for (const contact of (contactsResult.data ?? []) as ContactRow[]) {
    const brand = brandLookup.get(contact.brand_id);

    if (!brand) {
      continue;
    }

    if (
      [
        contact.name,
        contact.role,
        contact.company,
        contact.email,
        contact.phone,
        contact.notes,
        humanizeSnakeCase(contact.contact_type),
      ].some((value) => includesNormalizedQuery(value, normalizedQuery))
    ) {
      resultsByType.get("contacts")?.push({
        id: contact.id,
        type: "contacts",
        title: contact.name,
        description: truncateText(
          [
            [contact.role, contact.company].filter(Boolean).join(" | "),
            contact.email,
            contact.phone,
            contact.notes,
          ]
            .filter(Boolean)
            .join(" • ") || "Contact match.",
          160,
        ),
        href: buildWorkspaceViewHref(brand.slug, {
          tab: "contacts",
          hash: "#contacts",
        }),
        meta: `${brand.name} | ${humanizeSnakeCase(contact.contact_type)}`,
        badge: "Contact",
      });
    }
  }

  for (const note of (notesResult.data ?? []) as NoteRow[]) {
    const brand = brandLookup.get(note.brand_id);

    if (!brand) {
      continue;
    }

    if (
      [
        note.title,
        note.body,
        humanizeSnakeCase(note.category),
      ].some((value) => includesNormalizedQuery(value, normalizedQuery))
    ) {
      resultsByType.get("notes")?.push({
        id: note.id,
        type: "notes",
        title: note.title ?? "Working note",
        description: truncateText(note.body, 160),
        href: buildWorkspaceViewHref(brand.slug, {
          tab: "notes",
          hash: "#notes",
        }),
        meta: `${brand.name} | ${humanizeSnakeCase(note.category)} | ${toDateOnly(note.created_at) ?? "Recent"}`,
        badge: "Note",
      });
    }
  }

  for (const campaign of (campaignsResult.data ?? []) as CampaignRow[]) {
    const brand = brandLookup.get(campaign.brand_id);

    if (!brand) {
      continue;
    }

    if (
      [
        campaign.title,
        campaign.description,
        campaign.notes,
        campaign.content_ideas,
        campaign.links,
        campaign.results_notes,
        campaign.launch_date,
        humanizeSnakeCase(campaign.status),
        ...(campaign.goals ?? []),
      ].some((value) => includesNormalizedQuery(value, normalizedQuery))
    ) {
      resultsByType.get("campaigns")?.push({
        id: campaign.id,
        type: "campaigns",
        title: campaign.title,
        description: truncateText(
          campaign.description ??
            campaign.notes ??
            (campaign.goals?.join(", ") || "Campaign match."),
          160,
        ),
        href: buildCampaignWorkspaceHref(brand.slug, campaign.id),
        meta: `${brand.name} | ${humanizeSnakeCase(campaign.status)} | ${campaign.start_date?.slice(0, 10) ?? "No start date"}`,
        badge: "Campaign",
      });
    }
  }

  for (const item of (upcomingResult.data ?? []) as UpcomingItemRow[]) {
    const brand = brandLookup.get(item.brand_id);

    if (!brand) {
      continue;
    }

    if (
      [
        item.title,
        item.notes,
        item.date,
        humanizeSnakeCase(item.type),
        humanizeSnakeCase(item.status),
        item.related_campaign_id
          ? campaignLookup.get(item.related_campaign_id) ?? null
          : null,
      ].some((value) => includesNormalizedQuery(value, normalizedQuery))
    ) {
      resultsByType.get("upcoming")?.push({
        id: item.id,
        type: "upcoming",
        title: item.title,
        description: truncateText(
          item.notes ?? `Scheduled for ${toDateOnly(item.date) ?? item.date}.`,
          160,
        ),
        href: buildWorkspaceViewHref(brand.slug, {
          activeCampaignId: item.related_campaign_id,
          tab: "upcoming",
          hash: "#upcoming",
        }),
        meta: `${brand.name} | ${humanizeSnakeCase(item.type)} | ${humanizeSnakeCase(item.status)}`,
        badge: "Upcoming",
      });
    }
  }

  const sections = sectionOrder
    .map((section) => ({
      type: section.type,
      title: section.title,
      results: sortResults(resultsByType.get(section.type) ?? []),
    }))
    .filter((section) => section.results.length > 0);

  const totalResults = sections.reduce(
    (sum, section) => sum + section.results.length,
    0,
  );

  return {
    query,
    totalResults,
    sections,
  };
}
