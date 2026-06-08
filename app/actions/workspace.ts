"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ActionState = {
  success: boolean;
  message: string;
};

function slugifyBrandName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

async function ensureUniqueBrandSlug(name: string) {
  const baseSlug = slugifyBrandName(name);

  if (!baseSlug) {
    throw new Error("Brand name must contain at least one letter or number.");
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("brands")
    .select("slug")
    .like("slug", `${baseSlug}%`);

  if (error) {
    throw new Error(`Failed to validate brand slug: ${error.message}`);
  }

  const existingSlugs = new Set((data ?? []).map((row) => row.slug as string));

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let index = 2;

  while (existingSlugs.has(`${baseSlug}-${index}`)) {
    index += 1;
  }

  return `${baseSlug}-${index}`;
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function toTimestampAtMidday(date: string) {
  return `${date}T15:00:00Z`;
}

function parseGoals(value: string) {
  return value
    .split(",")
    .map((goal) => goal.trim())
    .filter(Boolean);
}

function normalizeAssetLocationFields(
  sourceType: string,
  url: string,
  storagePath: string,
) {
  if (sourceType === "external_url") {
    return {
      url: url || null,
      storagePath: null,
    };
  }

  if (sourceType === "upload") {
    return {
      url: null,
      storagePath: storagePath || null,
    };
  }

  return {
    url: url || null,
    storagePath: storagePath || null,
  };
}

export async function createBrand(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = getString(formData, "name");
  const website = getString(formData, "website");
  const description = getString(formData, "description");

  if (!name) {
    return {
      success: false,
      message: "Brand name is required.",
    };
  }

  const slug = await ensureUniqueBrandSlug(name);
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("brands").insert({
    name,
    slug,
    description: description || null,
    website: website || null,
    status: "active",
  });

  if (error) {
    return {
      success: false,
      message: `Could not create brand: ${error.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/brands");

  return {
    success: true,
    message: "Brand created.",
  };
}

export async function updateBrand(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const brandId = getString(formData, "brandId");
  const brandSlug = getString(formData, "brandSlug");
  const name = getString(formData, "name");
  const website = getString(formData, "website");
  const description = getString(formData, "description");
  const status = getString(formData, "status") || "active";
  const notes = getString(formData, "notes");

  if (!brandId || !brandSlug) {
    return {
      success: false,
      message: "Brand context is missing.",
    };
  }

  if (!name) {
    return {
      success: false,
      message: "Brand name is required.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("brands")
    .update({
      name,
      website: website || null,
      description: description || null,
      status,
      notes: notes || null,
    })
    .eq("id", brandId);

  if (error) {
    return {
      success: false,
      message: `Could not update brand: ${error.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);

  return {
    success: true,
    message: "Brand updated.",
  };
}

export async function deleteBrand(formData: FormData) {
  const brandId = getString(formData, "brandId");

  if (!brandId) {
    throw new Error("Brand id is required.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("brands").delete().eq("id", brandId);

  if (error) {
    throw new Error(`Could not delete brand: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/brands");
  redirect("/brands");
}

export async function createTask(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const brandId = getString(formData, "brandId");
  const brandSlug = getString(formData, "brandSlug");
  const relatedCampaignId = getString(formData, "relatedCampaignId");
  const title = getString(formData, "title");
  const dueDate = getString(formData, "dueDate");
  const priority = getString(formData, "priority") || "medium";
  const notes = getString(formData, "notes");

  if (!brandId || !brandSlug) {
    return {
      success: false,
      message: "Brand context is missing.",
    };
  }

  if (!title) {
    return {
      success: false,
      message: "Task title is required.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("tasks").insert({
    brand_id: brandId,
    related_campaign_id: relatedCampaignId || null,
    title,
    due_date: dueDate || null,
    status: "planned",
    priority,
    notes: notes || null,
  });

  if (error) {
    return {
      success: false,
      message: `Could not create task: ${error.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);

  return {
    success: true,
    message: "Task added.",
  };
}

export async function deleteTask(formData: FormData) {
  const taskId = getString(formData, "taskId");
  const brandSlug = getString(formData, "brandSlug");

  if (!taskId || !brandSlug) {
    throw new Error("Task id and brand slug are required.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    throw new Error(`Could not delete task: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);
}

export async function updateTask(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const taskId = getString(formData, "taskId");
  const brandSlug = getString(formData, "brandSlug");
  const relatedCampaignId = getString(formData, "relatedCampaignId");
  const title = getString(formData, "title");
  const dueDate = getString(formData, "dueDate");
  const status = getString(formData, "status") || "planned";
  const priority = getString(formData, "priority") || "medium";
  const notes = getString(formData, "notes");

  if (!taskId || !brandSlug) {
    return {
      success: false,
      message: "Task context is missing.",
    };
  }

  if (!title) {
    return {
      success: false,
      message: "Task title is required.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      related_campaign_id: relatedCampaignId || null,
      title,
      due_date: dueDate || null,
      status,
      priority,
      notes: notes || null,
    })
    .eq("id", taskId);

  if (error) {
    return {
      success: false,
      message: `Could not update task: ${error.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);

  return {
    success: true,
    message: "Task updated.",
  };
}

export async function createNote(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const brandId = getString(formData, "brandId");
  const brandSlug = getString(formData, "brandSlug");
  const title = getString(formData, "title");
  const body = getString(formData, "body");
  const category = getString(formData, "category") || "random";
  const pinned = formData.get("pinned") === "on";

  if (!brandId || !brandSlug) {
    return {
      success: false,
      message: "Brand context is missing.",
    };
  }

  if (!body) {
    return {
      success: false,
      message: "Note body is required.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("notes").insert({
    brand_id: brandId,
    title: title || null,
    body,
    category,
    pinned,
  });

  if (error) {
    return {
      success: false,
      message: `Could not create note: ${error.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);

  return {
    success: true,
    message: "Note added.",
  };
}

export async function deleteNote(formData: FormData) {
  const noteId = getString(formData, "noteId");
  const brandSlug = getString(formData, "brandSlug");

  if (!noteId || !brandSlug) {
    throw new Error("Note id and brand slug are required.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("notes").delete().eq("id", noteId);

  if (error) {
    throw new Error(`Could not delete note: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);
}

export async function updateNote(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const noteId = getString(formData, "noteId");
  const brandSlug = getString(formData, "brandSlug");
  const title = getString(formData, "title");
  const body = getString(formData, "body");
  const category = getString(formData, "category") || "random";
  const pinned = formData.get("pinned") === "on";

  if (!noteId || !brandSlug) {
    return {
      success: false,
      message: "Note context is missing.",
    };
  }

  if (!body) {
    return {
      success: false,
      message: "Note body is required.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("notes")
    .update({
      title: title || null,
      body,
      category,
      pinned,
    })
    .eq("id", noteId);

  if (error) {
    return {
      success: false,
      message: `Could not update note: ${error.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);

  return {
    success: true,
    message: "Note updated.",
  };
}

export async function createContact(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const brandId = getString(formData, "brandId");
  const brandSlug = getString(formData, "brandSlug");
  const name = getString(formData, "name");
  const role = getString(formData, "role");
  const company = getString(formData, "company");
  const email = getString(formData, "email");
  const phone = getString(formData, "phone");
  const contactType = getString(formData, "contactType") || "other";
  const notes = getString(formData, "notes");

  if (!brandId || !brandSlug) {
    return {
      success: false,
      message: "Brand context is missing.",
    };
  }

  if (!name) {
    return {
      success: false,
      message: "Contact name is required.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("contacts").insert({
    brand_id: brandId,
    name,
    role: role || null,
    company: company || null,
    email: email || null,
    phone: phone || null,
    contact_type: contactType,
    notes: notes || null,
  });

  if (error) {
    return {
      success: false,
      message: `Could not create contact: ${error.message}`,
    };
  }

  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);

  return {
    success: true,
    message: "Contact added.",
  };
}

export async function updateContact(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const contactId = getString(formData, "contactId");
  const brandSlug = getString(formData, "brandSlug");
  const name = getString(formData, "name");
  const role = getString(formData, "role");
  const company = getString(formData, "company");
  const email = getString(formData, "email");
  const phone = getString(formData, "phone");
  const contactType = getString(formData, "contactType") || "other";
  const notes = getString(formData, "notes");

  if (!contactId || !brandSlug) {
    return {
      success: false,
      message: "Contact context is missing.",
    };
  }

  if (!name) {
    return {
      success: false,
      message: "Contact name is required.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("contacts")
    .update({
      name,
      role: role || null,
      company: company || null,
      email: email || null,
      phone: phone || null,
      contact_type: contactType,
      notes: notes || null,
    })
    .eq("id", contactId);

  if (error) {
    return {
      success: false,
      message: `Could not update contact: ${error.message}`,
    };
  }

  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);

  return {
    success: true,
    message: "Contact updated.",
  };
}

export async function deleteContact(formData: FormData) {
  const contactId = getString(formData, "contactId");
  const brandSlug = getString(formData, "brandSlug");

  if (!contactId || !brandSlug) {
    throw new Error("Contact id and brand slug are required.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("contacts").delete().eq("id", contactId);

  if (error) {
    throw new Error(`Could not delete contact: ${error.message}`);
  }

  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);
}

export async function createAsset(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const brandId = getString(formData, "brandId");
  const brandSlug = getString(formData, "brandSlug");
  const relatedCampaignId = getString(formData, "relatedCampaignId");
  const title = getString(formData, "title");
  const assetType = getString(formData, "assetType") || "other";
  const sourceType = getString(formData, "sourceType") || "reference";
  const url = getString(formData, "url");
  const storagePath = getString(formData, "storagePath");
  const description = getString(formData, "description");
  const status = getString(formData, "status") || "active";
  const priority = getString(formData, "priority") || "medium";
  const notes = getString(formData, "notes");

  if (!brandId || !brandSlug) {
    return {
      success: false,
      message: "Brand context is missing.",
    };
  }

  if (!title) {
    return {
      success: false,
      message: "Asset title is required.",
    };
  }

  if (sourceType === "external_url" && !url) {
    return {
      success: false,
      message: "External assets need a URL.",
    };
  }

  if (sourceType === "upload" && !storagePath) {
    return {
      success: false,
      message: "Upload-style assets need a storage path placeholder.",
    };
  }

  const normalizedLocation = normalizeAssetLocationFields(
    sourceType,
    url,
    storagePath,
  );

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("assets").insert({
    brand_id: brandId,
    related_campaign_id: relatedCampaignId || null,
    title,
    asset_type: assetType,
    source_type: sourceType,
    url: normalizedLocation.url,
    storage_path: normalizedLocation.storagePath,
    description: description || null,
    status,
    priority,
    notes: notes || null,
  });

  if (error) {
    return {
      success: false,
      message: `Could not create asset: ${error.message}`,
    };
  }

  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);

  return {
    success: true,
    message: "Asset added.",
  };
}

export async function updateAsset(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const assetId = getString(formData, "assetId");
  const brandSlug = getString(formData, "brandSlug");
  const relatedCampaignId = getString(formData, "relatedCampaignId");
  const title = getString(formData, "title");
  const assetType = getString(formData, "assetType") || "other";
  const sourceType = getString(formData, "sourceType") || "reference";
  const url = getString(formData, "url");
  const storagePath = getString(formData, "storagePath");
  const description = getString(formData, "description");
  const status = getString(formData, "status") || "active";
  const priority = getString(formData, "priority") || "medium";
  const notes = getString(formData, "notes");

  if (!assetId || !brandSlug) {
    return {
      success: false,
      message: "Asset context is missing.",
    };
  }

  if (!title) {
    return {
      success: false,
      message: "Asset title is required.",
    };
  }

  if (sourceType === "external_url" && !url) {
    return {
      success: false,
      message: "External assets need a URL.",
    };
  }

  if (sourceType === "upload" && !storagePath) {
    return {
      success: false,
      message: "Upload-style assets need a storage path placeholder.",
    };
  }

  const normalizedLocation = normalizeAssetLocationFields(
    sourceType,
    url,
    storagePath,
  );

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("assets")
    .update({
      related_campaign_id: relatedCampaignId || null,
      title,
      asset_type: assetType,
      source_type: sourceType,
      url: normalizedLocation.url,
      storage_path: normalizedLocation.storagePath,
      description: description || null,
      status,
      priority,
      notes: notes || null,
    })
    .eq("id", assetId);

  if (error) {
    return {
      success: false,
      message: `Could not update asset: ${error.message}`,
    };
  }

  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);

  return {
    success: true,
    message: "Asset updated.",
  };
}

export async function deleteAsset(formData: FormData) {
  const assetId = getString(formData, "assetId");
  const brandSlug = getString(formData, "brandSlug");

  if (!assetId || !brandSlug) {
    throw new Error("Asset id and brand slug are required.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("assets").delete().eq("id", assetId);

  if (error) {
    throw new Error(`Could not delete asset: ${error.message}`);
  }

  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);
}

export async function createUpcomingItem(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const brandId = getString(formData, "brandId");
  const brandSlug = getString(formData, "brandSlug");
  const relatedCampaignId = getString(formData, "relatedCampaignId");
  const title = getString(formData, "title");
  const date = getString(formData, "date");
  const type = getString(formData, "type") || "reminder";
  const status = getString(formData, "status") || "scheduled";
  const notes = getString(formData, "notes");

  if (!brandId || !brandSlug) {
    return {
      success: false,
      message: "Brand context is missing.",
    };
  }

  if (!title) {
    return {
      success: false,
      message: "Upcoming item title is required.",
    };
  }

  if (!date) {
    return {
      success: false,
      message: "A date is required.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("upcoming_items").insert({
    brand_id: brandId,
    related_campaign_id: relatedCampaignId || null,
    title,
    date: toTimestampAtMidday(date),
    type,
    status,
    notes: notes || null,
  });

  if (error) {
    return {
      success: false,
      message: `Could not create upcoming item: ${error.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);

  return {
    success: true,
    message: "Upcoming item added.",
  };
}

export async function deleteUpcomingItem(formData: FormData) {
  const upcomingItemId = getString(formData, "upcomingItemId");
  const brandSlug = getString(formData, "brandSlug");

  if (!upcomingItemId || !brandSlug) {
    throw new Error("Upcoming item id and brand slug are required.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("upcoming_items")
    .delete()
    .eq("id", upcomingItemId);

  if (error) {
    throw new Error(`Could not delete upcoming item: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);
}

export async function updateUpcomingItem(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const upcomingItemId = getString(formData, "upcomingItemId");
  const brandSlug = getString(formData, "brandSlug");
  const relatedCampaignId = getString(formData, "relatedCampaignId");
  const title = getString(formData, "title");
  const date = getString(formData, "date");
  const type = getString(formData, "type") || "reminder";
  const status = getString(formData, "status") || "scheduled";
  const notes = getString(formData, "notes");

  if (!upcomingItemId || !brandSlug) {
    return {
      success: false,
      message: "Upcoming item context is missing.",
    };
  }

  if (!title) {
    return {
      success: false,
      message: "Upcoming item title is required.",
    };
  }

  if (!date) {
    return {
      success: false,
      message: "A date is required.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("upcoming_items")
    .update({
      related_campaign_id: relatedCampaignId || null,
      title,
      date: toTimestampAtMidday(date),
      type,
      status,
      notes: notes || null,
    })
    .eq("id", upcomingItemId);

  if (error) {
    return {
      success: false,
      message: `Could not update upcoming item: ${error.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);

  return {
    success: true,
    message: "Upcoming item updated.",
  };
}

export async function createCampaign(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const brandId = getString(formData, "brandId");
  const brandSlug = getString(formData, "brandSlug");
  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const status = getString(formData, "status") || "planned";
  const startDate = getString(formData, "startDate");
  const endDate = getString(formData, "endDate");
  const goals = getString(formData, "goals");
  const notes = getString(formData, "notes");

  if (!brandId || !brandSlug) {
    return {
      success: false,
      message: "Brand context is missing.",
    };
  }

  if (!title) {
    return {
      success: false,
      message: "Campaign title is required.",
    };
  }

  if (startDate && endDate && endDate < startDate) {
    return {
      success: false,
      message: "End date cannot be earlier than the start date.",
    };
  }

  const parsedGoals = goals ? parseGoals(goals) : [];

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("campaigns").insert({
    brand_id: brandId,
    title,
    description: description || null,
    status,
    start_date: startDate || null,
    end_date: endDate || null,
    goals: parsedGoals,
    notes: notes || null,
  });

  if (error) {
    return {
      success: false,
      message: `Could not create campaign: ${error.message}`,
    };
  }

  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);

  return {
    success: true,
    message: "Campaign added.",
  };
}

export async function updateCampaign(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const campaignId = getString(formData, "campaignId");
  const brandSlug = getString(formData, "brandSlug");
  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const status = getString(formData, "status") || "planned";
  const startDate = getString(formData, "startDate");
  const endDate = getString(formData, "endDate");
  const goals = getString(formData, "goals");
  const notes = getString(formData, "notes");

  if (!campaignId || !brandSlug) {
    return {
      success: false,
      message: "Campaign context is missing.",
    };
  }

  if (!title) {
    return {
      success: false,
      message: "Campaign title is required.",
    };
  }

  if (startDate && endDate && endDate < startDate) {
    return {
      success: false,
      message: "End date cannot be earlier than the start date.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("campaigns")
    .update({
      title,
      description: description || null,
      status,
      start_date: startDate || null,
      end_date: endDate || null,
      goals: goals ? parseGoals(goals) : [],
      notes: notes || null,
    })
    .eq("id", campaignId);

  if (error) {
    return {
      success: false,
      message: `Could not update campaign: ${error.message}`,
    };
  }

  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);

  return {
    success: true,
    message: "Campaign updated.",
  };
}

export async function deleteCampaign(formData: FormData) {
  const campaignId = getString(formData, "campaignId");
  const brandSlug = getString(formData, "brandSlug");

  if (!campaignId || !brandSlug) {
    throw new Error("Campaign id and brand slug are required.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("campaigns").delete().eq("id", campaignId);

  if (error) {
    throw new Error(`Could not delete campaign: ${error.message}`);
  }

  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);
}
