export type BrandStatusLabel =
  | "On track"
  | "Needs attention"
  | "Launching soon"
  | "Archived";

export type TaskStatusLabel =
  | "In progress"
  | "Needs review"
  | "Planned"
  | "Done"
  | "Archived";

export type TaskPriorityLabel = "Low" | "Medium" | "High" | "Urgent";

export type BrandDirectoryItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  website: string | null;
  status: BrandStatusLabel;
  tasksCount: number;
  assetsCount: number;
  urgentTasks: number;
};

export type WorkspaceTask = {
  id: string;
  title: string;
  dueDate: string | null;
  status: TaskStatusLabel;
  priority: TaskPriorityLabel;
  notes: string | null;
};

export type WorkspaceAsset = {
  id: string;
  title: string;
  type: string;
  sourceType: string;
  status: string;
  url: string | null;
  storagePath: string | null;
  description: string | null;
  updatedAt: string;
};

export type WorkspaceContact = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  contactType: string;
  notes: string | null;
};

export type WorkspaceCampaign = {
  id: string;
  title: string;
  description: string | null;
  status: string;
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
  status: string;
  notes: string | null;
};

export type WorkspaceNote = {
  id: string;
  title: string | null;
  text: string;
  createdAt: string;
  category: string;
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
  website: string | null;
  status: BrandStatusLabel;
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
  status: "active" | "needs_attention" | "launching" | "archived",
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
  status: "planned" | "in_progress" | "needs_review" | "done" | "archived",
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
  priority: "low" | "medium" | "high" | "urgent",
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
