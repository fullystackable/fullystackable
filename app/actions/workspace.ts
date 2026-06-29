"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createActivityLogEntry } from "@/lib/activity-log";
import { normalizeBrandColor } from "@/lib/brand-colors";
import {
  getBrandWorkspaceSupportTablesPendingMessage,
  isMissingBrandWorkspaceSupportTableError,
} from "@/lib/supabase-schema";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { humanizeSnakeCase } from "@/lib/workspace-view";

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

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "true" || formData.get(key) === "on";
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

function slugifyFileStem(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeMarkdownFileName(fileName: string, label: string) {
  const trimmedFileName = fileName.trim();

  if (trimmedFileName) {
    return /\.md$/i.test(trimmedFileName) ? trimmedFileName : `${trimmedFileName}.md`;
  }

  const fallbackStem = slugifyFileStem(label) || "database-info";
  return `${fallbackStem}.md`;
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

function revalidateActivityViews() {
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/today");
  revalidatePath("/activity");
}

async function writeActivitySafe(
  input: Parameters<typeof createActivityLogEntry>[0],
) {
  try {
    await createActivityLogEntry(input);
  } catch (error) {
    console.error("Failed to write activity log entry.", error);
  }
}

function getUpcomingActivityLabel(type: string) {
  if (type === "campaign_launch") {
    return "Launch";
  }

  return humanizeSnakeCase(type);
}

function getBrandWorkspaceSupportActionErrorMessage(
  error: { code?: string | null; message: string } | null,
  fallbackMessage: string,
) {
  if (error && isMissingBrandWorkspaceSupportTableError(error)) {
    return getBrandWorkspaceSupportTablesPendingMessage();
  }

  return fallbackMessage;
}

export async function createBrand(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = getString(formData, "name");
  const website = getString(formData, "website");
  const description = getString(formData, "description");
  const brandColor = normalizeBrandColor(getString(formData, "brandColor"));

  if (!name) {
    return {
      success: false,
      message: "Brand name is required.",
    };
  }

  const slug = await ensureUniqueBrandSlug(name);
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("brands")
    .insert({
      name,
      slug,
      brand_color: brandColor,
      description: description || null,
      website: website || null,
      status: "active",
    })
    .select("id")
    .single();

  if (error) {
    return {
      success: false,
      message: `Could not create brand: ${error.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/brands");
  revalidateActivityViews();
  await writeActivitySafe({
    brandId: data?.id ?? null,
    entityType: "brand",
    entityLabel: "Brand",
    action: "created",
    subject: name,
  });

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
  const brandColor = normalizeBrandColor(getString(formData, "brandColor"));
  const status = getString(formData, "status") || "active";
  const notes = getString(formData, "notes");
  const brandVoice = getString(formData, "brandVoice");
  const commonCtas = getString(formData, "commonCtas");
  const audienceNotes = getString(formData, "audienceNotes");
  const servicesProducts = getString(formData, "servicesProducts");
  const pricingNotes = getString(formData, "pricingNotes");
  const positioningNotes = getString(formData, "positioningNotes");
  const doDontList = getString(formData, "doDontList");
  const referenceLinks = getString(formData, "referenceLinks");

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
      brand_color: brandColor,
      website: website || null,
      description: description || null,
      status,
      notes: notes || null,
      brand_voice: brandVoice || null,
      common_ctas: commonCtas || null,
      audience_notes: audienceNotes || null,
      services_products: servicesProducts || null,
      pricing_notes: pricingNotes || null,
      positioning_notes: positioningNotes || null,
      do_dont_list: doDontList || null,
      reference_links: referenceLinks || null,
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
  revalidateActivityViews();
  await writeActivitySafe({
    brandId,
    entityType: "brand",
    entityLabel: "Brand",
    action: "edited",
    subject: name,
  });

  return {
    success: true,
    message: "Brand updated.",
  };
}

export async function toggleBrandPinned(formData: FormData) {
  const brandId = getString(formData, "brandId");
  const isPinned = getString(formData, "isPinned") === "true";

  if (!brandId) {
    throw new Error("Brand id is required.");
  }

  const supabase = createSupabaseAdminClient();
  const brandResult = await supabase
    .from("brands")
    .select("name")
    .eq("id", brandId)
    .maybeSingle();

  const brandName =
    !brandResult.error && brandResult.data
      ? (brandResult.data.name as string)
      : "Brand";

  let nextPinnedRank: number | null = null;

  if (!isPinned) {
    const rankResult = await supabase
      .from("brands")
      .select("pinned_rank")
      .eq("is_pinned", true)
      .order("pinned_rank", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    if (rankResult.error) {
      throw new Error(`Could not determine next pin order: ${rankResult.error.message}`);
    }

    nextPinnedRank = ((rankResult.data?.pinned_rank as number | null) ?? 0) + 1;
  }

  const { error } = await supabase
    .from("brands")
    .update({
      is_pinned: !isPinned,
      pinned_rank: isPinned ? null : nextPinnedRank,
    })
    .eq("id", brandId);

  if (error) {
    throw new Error(`Could not update brand pin state: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/brands");
  revalidatePath("/search");
  revalidateActivityViews();
  await writeActivitySafe({
    brandId,
    entityType: "brand",
    entityLabel: "Brand",
    action: isPinned ? "unpinned" : "pinned",
    subject: brandName,
  });
}

export async function deleteBrand(formData: FormData) {
  const brandId = getString(formData, "brandId");

  if (!brandId) {
    throw new Error("Brand id is required.");
  }

  const supabase = createSupabaseAdminClient();
  const brandResult = await supabase
    .from("brands")
    .select("name")
    .eq("id", brandId)
    .maybeSingle();
  const brandName =
    !brandResult.error && brandResult.data ? (brandResult.data.name as string) : "Brand";

  await writeActivitySafe({
    brandId,
    entityType: "brand",
    entityLabel: "Brand",
    action: "deleted",
    subject: brandName,
  });

  const { error } = await supabase.from("brands").delete().eq("id", brandId);

  if (error) {
    throw new Error(`Could not delete brand: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/brands");
  revalidateActivityViews();
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
  revalidateActivityViews();
  await writeActivitySafe({
    brandId,
    campaignId: relatedCampaignId || null,
    entityType: "task",
    entityLabel: "Task",
    action: "created",
    subject: title,
    details: dueDate ? `Due ${dueDate}` : null,
  });

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
  const taskResult = await supabase
    .from("tasks")
    .select("brand_id, related_campaign_id, title")
    .eq("id", taskId)
    .maybeSingle();
  const taskData = !taskResult.error ? taskResult.data : null;

  await writeActivitySafe({
    brandId: taskData?.brand_id ?? null,
    campaignId: taskData?.related_campaign_id ?? null,
    entityType: "task",
    entityLabel: "Task",
    action: "deleted",
    subject: (taskData?.title as string | undefined) ?? "Task",
  });

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    throw new Error(`Could not delete task: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);
  revalidateActivityViews();
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
  const existingTaskResult = await supabase
    .from("tasks")
    .select("brand_id, related_campaign_id")
    .eq("id", taskId)
    .maybeSingle();
  const existingTaskData = !existingTaskResult.error ? existingTaskResult.data : null;
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
  revalidateActivityViews();
  await writeActivitySafe({
    brandId: existingTaskData?.brand_id ?? null,
    campaignId: relatedCampaignId || existingTaskData?.related_campaign_id || null,
    entityType: "task",
    entityLabel: "Task",
    action: "updated",
    subject: title,
    details: dueDate ? `Due ${dueDate}` : null,
  });

  return {
    success: true,
    message: "Task updated.",
  };
}

export async function updateTaskStatus(formData: FormData) {
  const taskId = getString(formData, "taskId");
  const brandSlug = getString(formData, "brandSlug");
  const status = getString(formData, "status") || "planned";

  if (!taskId || !brandSlug) {
    throw new Error("Task context is missing.");
  }

  if (
    !["planned", "in_progress", "needs_review", "done", "archived"].includes(
      status,
    )
  ) {
    throw new Error("Task status is invalid.");
  }

  const supabase = createSupabaseAdminClient();
  const existingTaskResult = await supabase
    .from("tasks")
    .select("brand_id, related_campaign_id, title")
    .eq("id", taskId)
    .maybeSingle();
  const existingTaskData = !existingTaskResult.error ? existingTaskResult.data : null;
  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId);

  if (error) {
    throw new Error(`Could not update task status: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);
  revalidateActivityViews();
  await writeActivitySafe({
    brandId: existingTaskData?.brand_id ?? null,
    campaignId: existingTaskData?.related_campaign_id ?? null,
    entityType: "task",
    entityLabel: "Task",
    action: status === "done" ? "completed" : "updated",
    subject: (existingTaskData?.title as string | undefined) ?? "Task",
    details: `Marked ${humanizeSnakeCase(status)}`,
  });
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
  const pinned = getBoolean(formData, "pinned");

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
  revalidateActivityViews();
  await writeActivitySafe({
    brandId,
    entityType: "note",
    entityLabel: "Note",
    action: "created",
    subject: title || body.slice(0, 48),
  });

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
  const noteResult = await supabase
    .from("notes")
    .select("brand_id, title, body")
    .eq("id", noteId)
    .maybeSingle();
  const noteData = !noteResult.error ? noteResult.data : null;

  await writeActivitySafe({
    brandId: noteData?.brand_id ?? null,
    entityType: "note",
    entityLabel: "Note",
    action: "deleted",
    subject:
      (noteData?.title as string | undefined) ??
      ((noteData?.body as string | undefined)?.slice(0, 48) ?? "Note"),
  });

  const { error } = await supabase.from("notes").delete().eq("id", noteId);

  if (error) {
    throw new Error(`Could not delete note: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);
  revalidateActivityViews();
}

export async function toggleNotePinned(formData: FormData) {
  const noteId = getString(formData, "noteId");
  const brandSlug = getString(formData, "brandSlug");
  const isPinned = getString(formData, "isPinned") === "true";

  if (!noteId || !brandSlug) {
    throw new Error("Note context is missing.");
  }

  const supabase = createSupabaseAdminClient();
  const noteResult = await supabase
    .from("notes")
    .select("brand_id, title, body")
    .eq("id", noteId)
    .maybeSingle();
  const noteData = !noteResult.error ? noteResult.data : null;

  const { error } = await supabase
    .from("notes")
    .update({
      pinned: !isPinned,
    })
    .eq("id", noteId);

  if (error) {
    throw new Error(`Could not update note pin state: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);
  revalidateActivityViews();
  await writeActivitySafe({
    brandId: noteData?.brand_id ?? null,
    entityType: "note",
    entityLabel: "Note",
    action: !isPinned ? "pinned" : "unpinned",
    subject:
      (noteData?.title as string | undefined) ??
      ((noteData?.body as string | undefined)?.slice(0, 48) ?? "Note"),
  });
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
  const pinned = getBoolean(formData, "pinned");

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
  const existingNoteResult = await supabase
    .from("notes")
    .select("brand_id")
    .eq("id", noteId)
    .maybeSingle();
  const existingNoteData = !existingNoteResult.error ? existingNoteResult.data : null;
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
  revalidateActivityViews();
  await writeActivitySafe({
    brandId: existingNoteData?.brand_id ?? null,
    entityType: "note",
    entityLabel: "Note",
    action: "updated",
    subject: title || body.slice(0, 48),
  });

  return {
    success: true,
    message: "Note updated.",
  };
}

export async function createPrompt(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const brandId = getString(formData, "brandId");
  const brandSlug = getString(formData, "brandSlug");
  const label = getString(formData, "label");
  const prompt = getString(formData, "prompt");

  if (!brandId || !brandSlug) {
    return {
      success: false,
      message: "Brand context is missing.",
    };
  }

  if (!label) {
    return {
      success: false,
      message: "Prompt label is required.",
    };
  }

  if (!prompt) {
    return {
      success: false,
      message: "Prompt body is required.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("brand_prompts").insert({
    brand_id: brandId,
    label,
    prompt,
  });

  if (error) {
    return {
      success: false,
      message: getBrandWorkspaceSupportActionErrorMessage(
        error,
        `Could not create prompt: ${error.message}`,
      ),
    };
  }

  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);
  revalidatePath("/search");
  revalidateActivityViews();
  await writeActivitySafe({
    brandId,
    entityType: "prompt",
    entityLabel: "Prompt",
    action: "created",
    subject: label,
  });

  return {
    success: true,
    message: "Prompt added.",
  };
}

export async function updatePrompt(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const promptId = getString(formData, "promptId");
  const brandSlug = getString(formData, "brandSlug");
  const label = getString(formData, "label");
  const prompt = getString(formData, "prompt");

  if (!promptId || !brandSlug) {
    return {
      success: false,
      message: "Prompt context is missing.",
    };
  }

  if (!label) {
    return {
      success: false,
      message: "Prompt label is required.",
    };
  }

  if (!prompt) {
    return {
      success: false,
      message: "Prompt body is required.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const existingPromptResult = await supabase
    .from("brand_prompts")
    .select("brand_id")
    .eq("id", promptId)
    .maybeSingle();
  const existingPromptData = !existingPromptResult.error ? existingPromptResult.data : null;
  const { error } = await supabase
    .from("brand_prompts")
    .update({
      label,
      prompt,
    })
    .eq("id", promptId);

  if (error) {
    return {
      success: false,
      message: getBrandWorkspaceSupportActionErrorMessage(
        error,
        `Could not update prompt: ${error.message}`,
      ),
    };
  }

  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);
  revalidatePath("/search");
  revalidateActivityViews();
  await writeActivitySafe({
    brandId: existingPromptData?.brand_id ?? null,
    entityType: "prompt",
    entityLabel: "Prompt",
    action: "updated",
    subject: label,
  });

  return {
    success: true,
    message: "Prompt updated.",
  };
}

export async function deletePrompt(formData: FormData) {
  const promptId = getString(formData, "promptId");
  const brandSlug = getString(formData, "brandSlug");

  if (!promptId || !brandSlug) {
    throw new Error("Prompt id and brand slug are required.");
  }

  const supabase = createSupabaseAdminClient();
  const promptResult = await supabase
    .from("brand_prompts")
    .select("brand_id, label")
    .eq("id", promptId)
    .maybeSingle();
  const promptData = !promptResult.error ? promptResult.data : null;

  await writeActivitySafe({
    brandId: promptData?.brand_id ?? null,
    entityType: "prompt",
    entityLabel: "Prompt",
    action: "deleted",
    subject: (promptData?.label as string | undefined) ?? "Prompt",
  });

  const { error } = await supabase.from("brand_prompts").delete().eq("id", promptId);

  if (error) {
    throw new Error(
      getBrandWorkspaceSupportActionErrorMessage(
        error,
        `Could not delete prompt: ${error.message}`,
      ),
    );
  }

  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);
  revalidatePath("/search");
  revalidateActivityViews();
}

export async function createDatabaseFile(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const brandId = getString(formData, "brandId");
  const brandSlug = getString(formData, "brandSlug");
  const label = getString(formData, "label");
  const fileName = normalizeMarkdownFileName(getString(formData, "fileName"), label);
  const markdownContent = getString(formData, "markdownContent");

  if (!brandId || !brandSlug) {
    return {
      success: false,
      message: "Brand context is missing.",
    };
  }

  if (!label) {
    return {
      success: false,
      message: "Database info label is required.",
    };
  }

  if (!markdownContent) {
    return {
      success: false,
      message: "Markdown content is required.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("brand_database_files").insert({
    brand_id: brandId,
    label,
    file_name: fileName,
    markdown_content: markdownContent,
  });

  if (error) {
    return {
      success: false,
      message: getBrandWorkspaceSupportActionErrorMessage(
        error,
        `Could not create database info entry: ${error.message}`,
      ),
    };
  }

  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);
  revalidatePath("/search");
  revalidateActivityViews();
  await writeActivitySafe({
    brandId,
    entityType: "database_file",
    entityLabel: "Database Info",
    action: "created",
    subject: label,
    details: fileName,
  });

  return {
    success: true,
    message: "Database info entry added.",
  };
}

export async function updateDatabaseFile(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const databaseFileId = getString(formData, "databaseFileId");
  const brandSlug = getString(formData, "brandSlug");
  const label = getString(formData, "label");
  const fileName = normalizeMarkdownFileName(getString(formData, "fileName"), label);
  const markdownContent = getString(formData, "markdownContent");

  if (!databaseFileId || !brandSlug) {
    return {
      success: false,
      message: "Database info context is missing.",
    };
  }

  if (!label) {
    return {
      success: false,
      message: "Database info label is required.",
    };
  }

  if (!markdownContent) {
    return {
      success: false,
      message: "Markdown content is required.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const existingFileResult = await supabase
    .from("brand_database_files")
    .select("brand_id")
    .eq("id", databaseFileId)
    .maybeSingle();
  const existingFileData = !existingFileResult.error ? existingFileResult.data : null;
  const { error } = await supabase
    .from("brand_database_files")
    .update({
      label,
      file_name: fileName,
      markdown_content: markdownContent,
    })
    .eq("id", databaseFileId);

  if (error) {
    return {
      success: false,
      message: getBrandWorkspaceSupportActionErrorMessage(
        error,
        `Could not update database info entry: ${error.message}`,
      ),
    };
  }

  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);
  revalidatePath("/search");
  revalidateActivityViews();
  await writeActivitySafe({
    brandId: existingFileData?.brand_id ?? null,
    entityType: "database_file",
    entityLabel: "Database Info",
    action: "updated",
    subject: label,
    details: fileName,
  });

  return {
    success: true,
    message: "Database info entry updated.",
  };
}

export async function deleteDatabaseFile(formData: FormData) {
  const databaseFileId = getString(formData, "databaseFileId");
  const brandSlug = getString(formData, "brandSlug");

  if (!databaseFileId || !brandSlug) {
    throw new Error("Database info id and brand slug are required.");
  }

  const supabase = createSupabaseAdminClient();
  const fileResult = await supabase
    .from("brand_database_files")
    .select("brand_id, label, file_name")
    .eq("id", databaseFileId)
    .maybeSingle();
  const fileData = !fileResult.error ? fileResult.data : null;

  await writeActivitySafe({
    brandId: fileData?.brand_id ?? null,
    entityType: "database_file",
    entityLabel: "Database Info",
    action: "deleted",
    subject: (fileData?.label as string | undefined) ?? "Database Info",
    details: (fileData?.file_name as string | undefined) ?? null,
  });

  const { error } = await supabase
    .from("brand_database_files")
    .delete()
    .eq("id", databaseFileId);

  if (error) {
    throw new Error(
      getBrandWorkspaceSupportActionErrorMessage(
        error,
        `Could not delete database info entry: ${error.message}`,
      ),
    );
  }

  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);
  revalidatePath("/search");
  revalidateActivityViews();
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
  revalidateActivityViews();
  await writeActivitySafe({
    brandId,
    entityType: "contact",
    entityLabel: "Contact",
    action: "created",
    subject: name,
    details: role || company || null,
  });

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
  const existingContactResult = await supabase
    .from("contacts")
    .select("brand_id")
    .eq("id", contactId)
    .maybeSingle();
  const existingContactData = !existingContactResult.error
    ? existingContactResult.data
    : null;
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
  revalidateActivityViews();
  await writeActivitySafe({
    brandId: existingContactData?.brand_id ?? null,
    entityType: "contact",
    entityLabel: "Contact",
    action: "updated",
    subject: name,
    details: role || company || null,
  });

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
  const contactResult = await supabase
    .from("contacts")
    .select("brand_id, name")
    .eq("id", contactId)
    .maybeSingle();
  const contactData = !contactResult.error ? contactResult.data : null;

  await writeActivitySafe({
    brandId: contactData?.brand_id ?? null,
    entityType: "contact",
    entityLabel: "Contact",
    action: "deleted",
    subject: (contactData?.name as string | undefined) ?? "Contact",
  });

  const { error } = await supabase.from("contacts").delete().eq("id", contactId);

  if (error) {
    throw new Error(`Could not delete contact: ${error.message}`);
  }

  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);
  revalidateActivityViews();
}

export async function createAsset(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const brandId = getString(formData, "brandId");
  const brandSlug = getString(formData, "brandSlug");
  const relatedCampaignId = getString(formData, "relatedCampaignId");
  const title = getString(formData, "title");
  const assetCategory = getString(formData, "assetCategory") || "other";
  const assetType = getString(formData, "assetType") || "other";
  const sourceType = getString(formData, "sourceType") || "reference";
  const url = getString(formData, "url");
  const storagePath = getString(formData, "storagePath");
  const description = getString(formData, "description");
  const status = getString(formData, "status") || "active";
  const priority = getString(formData, "priority") || "medium";
  const notes = getString(formData, "notes");
  const isQuickLink = getBoolean(formData, "isQuickLink");

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

  if (
    ![
      "folder",
      "canva",
      "website_admin",
      "social_profile",
      "ad_platform",
      "analytics",
      "crm",
      "document",
      "creative_asset",
      "other",
    ].includes(assetCategory)
  ) {
    return {
      success: false,
      message: "Asset category is invalid.",
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

  if (isQuickLink && (!url || sourceType !== "external_url")) {
    return {
      success: false,
      message: "Quick links need to use an external URL.",
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
    asset_category: assetCategory,
    asset_type: assetType,
    source_type: sourceType,
    is_quick_link: isQuickLink,
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
  revalidateActivityViews();
  await writeActivitySafe({
    brandId,
    campaignId: relatedCampaignId || null,
    entityType: "asset",
    entityLabel: "Asset",
    action: "created",
    subject: title,
    details: humanizeSnakeCase(assetType),
  });

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
  const assetCategory = getString(formData, "assetCategory") || "other";
  const assetType = getString(formData, "assetType") || "other";
  const sourceType = getString(formData, "sourceType") || "reference";
  const url = getString(formData, "url");
  const storagePath = getString(formData, "storagePath");
  const description = getString(formData, "description");
  const status = getString(formData, "status") || "active";
  const priority = getString(formData, "priority") || "medium";
  const notes = getString(formData, "notes");
  const isQuickLink = getBoolean(formData, "isQuickLink");

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

  if (
    ![
      "folder",
      "canva",
      "website_admin",
      "social_profile",
      "ad_platform",
      "analytics",
      "crm",
      "document",
      "creative_asset",
      "other",
    ].includes(assetCategory)
  ) {
    return {
      success: false,
      message: "Asset category is invalid.",
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

  if (isQuickLink && (!url || sourceType !== "external_url")) {
    return {
      success: false,
      message: "Quick links need to use an external URL.",
    };
  }

  const normalizedLocation = normalizeAssetLocationFields(
    sourceType,
    url,
    storagePath,
  );

  const supabase = createSupabaseAdminClient();
  const existingAssetResult = await supabase
    .from("assets")
    .select("brand_id, related_campaign_id")
    .eq("id", assetId)
    .maybeSingle();
  const existingAssetData = !existingAssetResult.error ? existingAssetResult.data : null;
  const { error } = await supabase
    .from("assets")
    .update({
      related_campaign_id: relatedCampaignId || null,
      title,
      asset_category: assetCategory,
      asset_type: assetType,
      source_type: sourceType,
      is_quick_link: isQuickLink,
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
  revalidateActivityViews();
  await writeActivitySafe({
    brandId: existingAssetData?.brand_id ?? null,
    campaignId: relatedCampaignId || existingAssetData?.related_campaign_id || null,
    entityType: "asset",
    entityLabel: "Asset",
    action: "updated",
    subject: title,
    details: humanizeSnakeCase(assetType),
  });

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
  const assetResult = await supabase
    .from("assets")
    .select("brand_id, related_campaign_id, title")
    .eq("id", assetId)
    .maybeSingle();
  const assetData = !assetResult.error ? assetResult.data : null;

  await writeActivitySafe({
    brandId: assetData?.brand_id ?? null,
    campaignId: assetData?.related_campaign_id ?? null,
    entityType: "asset",
    entityLabel: "Asset",
    action: "deleted",
    subject: (assetData?.title as string | undefined) ?? "Asset",
  });

  const { error } = await supabase.from("assets").delete().eq("id", assetId);

  if (error) {
    throw new Error(`Could not delete asset: ${error.message}`);
  }

  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);
  revalidateActivityViews();
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
  revalidateActivityViews();
  await writeActivitySafe({
    brandId,
    campaignId: relatedCampaignId || null,
    entityType: "upcoming_item",
    entityLabel: getUpcomingActivityLabel(type),
    action: "created",
    subject: title,
    details: date,
  });

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
  const upcomingResult = await supabase
    .from("upcoming_items")
    .select("brand_id, related_campaign_id, title, type")
    .eq("id", upcomingItemId)
    .maybeSingle();
  const upcomingData = !upcomingResult.error ? upcomingResult.data : null;

  await writeActivitySafe({
    brandId: upcomingData?.brand_id ?? null,
    campaignId: upcomingData?.related_campaign_id ?? null,
    entityType: "upcoming_item",
    entityLabel: getUpcomingActivityLabel(
      (upcomingData?.type as string | undefined) ?? "reminder",
    ),
    action: "deleted",
    subject: (upcomingData?.title as string | undefined) ?? "Scheduled item",
  });

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
  revalidateActivityViews();
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
  const existingUpcomingResult = await supabase
    .from("upcoming_items")
    .select("brand_id, related_campaign_id")
    .eq("id", upcomingItemId)
    .maybeSingle();
  const existingUpcomingData = !existingUpcomingResult.error
    ? existingUpcomingResult.data
    : null;
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
  revalidateActivityViews();
  await writeActivitySafe({
    brandId: existingUpcomingData?.brand_id ?? null,
    campaignId:
      relatedCampaignId || existingUpcomingData?.related_campaign_id || null,
    entityType: "upcoming_item",
    entityLabel: getUpcomingActivityLabel(type),
    action: status === "completed" ? "completed" : "updated",
    subject: title,
    details: `Status ${humanizeSnakeCase(status)}${date ? ` | ${date}` : ""}`,
  });

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
  const launchDate = getString(formData, "launchDate");
  const goals = getString(formData, "goals");
  const notes = getString(formData, "notes");
  const contentIdeas = getString(formData, "contentIdeas");
  const links = getString(formData, "links");
  const resultsNotes = getString(formData, "resultsNotes");

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
  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      brand_id: brandId,
      title,
      description: description || null,
      status,
      start_date: startDate || null,
      end_date: endDate || null,
      launch_date: launchDate || null,
      goals: parsedGoals,
      notes: notes || null,
      content_ideas: contentIdeas || null,
      links: links || null,
      results_notes: resultsNotes || null,
    })
    .select("id")
    .single();

  if (error) {
    return {
      success: false,
      message: `Could not create campaign: ${error.message}`,
    };
  }

  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);
  revalidateActivityViews();
  await writeActivitySafe({
    brandId,
    campaignId: data?.id ?? null,
    entityType: "campaign",
    entityLabel: "Campaign",
    action: "created",
    subject: title,
    details: launchDate ? `Launch ${launchDate}` : null,
  });

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
  const launchDate = getString(formData, "launchDate");
  const goals = getString(formData, "goals");
  const notes = getString(formData, "notes");
  const contentIdeas = getString(formData, "contentIdeas");
  const links = getString(formData, "links");
  const resultsNotes = getString(formData, "resultsNotes");

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
  const existingCampaignResult = await supabase
    .from("campaigns")
    .select("brand_id")
    .eq("id", campaignId)
    .maybeSingle();
  const existingCampaignData = !existingCampaignResult.error
    ? existingCampaignResult.data
    : null;
  const { error } = await supabase
    .from("campaigns")
    .update({
      title,
      description: description || null,
      status,
      start_date: startDate || null,
      end_date: endDate || null,
      launch_date: launchDate || null,
      goals: goals ? parseGoals(goals) : [],
      notes: notes || null,
      content_ideas: contentIdeas || null,
      links: links || null,
      results_notes: resultsNotes || null,
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
  revalidateActivityViews();
  await writeActivitySafe({
    brandId: existingCampaignData?.brand_id ?? null,
    campaignId,
    entityType: "campaign",
    entityLabel: "Campaign",
    action: "updated",
    subject: title,
    details: launchDate ? `Launch ${launchDate}` : null,
  });

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
  const campaignResult = await supabase
    .from("campaigns")
    .select("brand_id, title")
    .eq("id", campaignId)
    .maybeSingle();
  const campaignData = !campaignResult.error ? campaignResult.data : null;

  await writeActivitySafe({
    brandId: campaignData?.brand_id ?? null,
    campaignId,
    entityType: "campaign",
    entityLabel: "Campaign",
    action: "deleted",
    subject: (campaignData?.title as string | undefined) ?? "Campaign",
  });

  const { error } = await supabase.from("campaigns").delete().eq("id", campaignId);

  if (error) {
    throw new Error(`Could not delete campaign: ${error.message}`);
  }

  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);
  revalidateActivityViews();
}

export async function completeCampaignObjective(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const campaignId = getString(formData, "campaignId");
  const brandSlug = getString(formData, "brandSlug");

  if (!campaignId || !brandSlug) {
    return {
      success: false,
      message: "Campaign context is missing.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const campaignResult = await supabase
    .from("campaigns")
    .select("brand_id, title")
    .eq("id", campaignId)
    .maybeSingle();
  const campaignData = !campaignResult.error ? campaignResult.data : null;
  const { error } = await supabase
    .from("campaigns")
    .update({
      status: "completed",
      end_date: getString(formData, "completedOn") || null,
    })
    .eq("id", campaignId);

  if (error) {
    return {
      success: false,
      message: `Could not complete campaign objective: ${error.message}`,
    };
  }

  revalidatePath("/brands");
  revalidatePath(`/brands/${brandSlug}`);
  revalidateActivityViews();
  await writeActivitySafe({
    brandId: campaignData?.brand_id ?? null,
    campaignId,
    entityType: "campaign",
    entityLabel: "Campaign",
    action: "completed",
    subject: (campaignData?.title as string | undefined) ?? "Campaign",
  });

  return {
    success: true,
    message: "Objective marked complete.",
  };
}
