export type BrandStatusLabel =
  | "On track"
  | "Needs attention"
  | "Launching soon"
  | "Archived";

export type BrandStatusValue =
  | "active"
  | "needs_attention"
  | "launching"
  | "archived";

export type WorkspaceDensity = "comfortable" | "compact";
export type TaskViewFilter = "all" | "incomplete";

export type TaskStatusValue =
  | "planned"
  | "in_progress"
  | "needs_review"
  | "done"
  | "archived";

export type TaskPriorityValue = "low" | "medium" | "high" | "urgent";

export type TaskStatusLabel =
  | "In progress"
  | "Needs review"
  | "Planned"
  | "Done"
  | "Archived";

export type TaskPriorityLabel = "Low" | "Medium" | "High" | "Urgent";

export type CampaignStatusValue =
  | "planned"
  | "active"
  | "paused"
  | "completed"
  | "archived";

export type ContactTypeValue =
  | "owner"
  | "vendor"
  | "staff"
  | "ad_rep"
  | "designer"
  | "photographer"
  | "web"
  | "agency"
  | "other";

export type AssetTypeValue =
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

export type AssetSourceTypeValue = "external_url" | "upload" | "reference";

export type AssetStatusValue = "active" | "outdated" | "draft" | "archived";

export type AssetPriorityValue = "low" | "medium" | "high";

export type AssetCategoryValue =
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

export type UpcomingItemTypeValue =
  | "meeting"
  | "event"
  | "campaign_launch"
  | "deadline"
  | "reminder"
  | "seasonal";

export type UpcomingItemStatusValue =
  | "scheduled"
  | "completed"
  | "canceled"
  | "postponed";

export type NoteCategoryValue =
  | "brand_voice"
  | "audience"
  | "cta"
  | "pricing"
  | "reminder"
  | "strategy"
  | "random";

export type BrandDirectoryItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  descriptionValue: string | null;
  website: string | null;
  status: BrandStatusLabel;
  statusValue: BrandStatusValue;
  brandNotes: string | null;
  tasksCount: number;
  assetsCount: number;
  urgentTasks: number;
  searchMatchReason: string | null;
};

export type WorkspaceTask = {
  id: string;
  title: string;
  dueDate: string | null;
  status: TaskStatusLabel;
  statusValue: TaskStatusValue;
  priority: TaskPriorityLabel;
  priorityValue: TaskPriorityValue;
  notes: string | null;
  relatedCampaignId: string | null;
  relatedCampaignTitle: string | null;
};

export type WorkspaceAsset = {
  id: string;
  title: string;
  category: string;
  categoryValue: AssetCategoryValue;
  type: string;
  typeValue: AssetTypeValue;
  sourceType: string;
  sourceTypeValue: AssetSourceTypeValue;
  status: string;
  statusValue: AssetStatusValue;
  priority: string;
  priorityValue: AssetPriorityValue;
  url: string | null;
  storagePath: string | null;
  description: string | null;
  notes: string | null;
  updatedAt: string;
  relatedCampaignId: string | null;
  relatedCampaignTitle: string | null;
};

export type WorkspaceContact = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  contactType: string;
  contactTypeValue: ContactTypeValue;
  notes: string | null;
};

export type WorkspaceCampaign = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  statusValue: CampaignStatusValue;
  startDate: string | null;
  endDate: string | null;
  goals: string[];
  notes: string | null;
};

export type WorkspaceUpcomingItem = {
  id: string;
  title: string;
  date: string;
  type: string;
  typeValue: UpcomingItemTypeValue;
  status: string;
  statusValue: UpcomingItemStatusValue;
  notes: string | null;
  relatedCampaignId: string | null;
  relatedCampaignTitle: string | null;
};

export type WorkspaceNote = {
  id: string;
  title: string | null;
  text: string;
  createdAt: string;
  category: string;
  categoryValue?: NoteCategoryValue;
  pinned: boolean;
  brandId?: string;
  brandName?: string;
  brandStatus?: BrandStatusLabel;
  brandSlug?: string;
};

export type BrandWorkspaceData = {
  id: string;
  slug: string;
  name: string;
  description: string;
  descriptionValue: string | null;
  website: string | null;
  status: BrandStatusLabel;
  statusValue: BrandStatusValue;
  brandNotes: string | null;
  brandVoice: string | null;
  commonCtas: string | null;
  audienceNotes: string | null;
  servicesProducts: string | null;
  pricingNotes: string | null;
  positioningNotes: string | null;
  doDontList: string | null;
  referenceLinks: string | null;
  tasks: WorkspaceTask[];
  assets: WorkspaceAsset[];
  contacts: WorkspaceContact[];
  campaigns: WorkspaceCampaign[];
  upcoming: WorkspaceUpcomingItem[];
  notes: WorkspaceNote[];
};

export type StatusSummaryItem = {
  label: BrandStatusLabel;
  count: number;
  helper: string;
};

export function mapBrandStatus(
  status: BrandStatusValue,
): BrandStatusLabel {
  switch (status) {
    case "active":
      return "On track";
    case "needs_attention":
      return "Needs attention";
    case "launching":
      return "Launching soon";
    case "archived":
      return "Archived";
  }
}

export function mapTaskStatus(
  status: TaskStatusValue,
): TaskStatusLabel {
  switch (status) {
    case "planned":
      return "Planned";
    case "in_progress":
      return "In progress";
    case "needs_review":
      return "Needs review";
    case "done":
      return "Done";
    case "archived":
      return "Archived";
  }
}

export function mapTaskPriority(
  priority: TaskPriorityValue,
): TaskPriorityLabel {
  switch (priority) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    case "urgent":
      return "Urgent";
  }
}

export function isTaskIncompleteStatus(status: TaskStatusValue) {
  return status !== "done" && status !== "archived";
}

export function humanizeSnakeCase(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function toISODateOnly(value: string | null) {
  if (!value) {
    return null;
  }

  return value.slice(0, 10);
}

export function buildStatusSummary(
  brands: Array<Pick<BrandDirectoryItem, "status">>,
): StatusSummaryItem[] {
  const counts: Record<BrandStatusLabel, number> = {
    "On track": 0,
    "Needs attention": 0,
    "Launching soon": 0,
    Archived: 0,
  };

  for (const brand of brands) {
    counts[brand.status] += 1;
  }

  return [
    {
      label: "On track",
      count: counts["On track"],
      helper: "Healthy accounts with clear execution momentum.",
    },
    {
      label: "Launching soon",
      count: counts["Launching soon"],
      helper: "Campaigns approaching launch windows and handoffs.",
    },
    {
      label: "Needs attention",
      count: counts["Needs attention"],
      helper: "Accounts with blockers, urgency, or cleanup work.",
    },
  ];
}
