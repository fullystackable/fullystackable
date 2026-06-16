import { describe, expect, it } from "vitest";

import { buildDailyPlannerGroups } from "@/lib/daily-planner-helpers";

describe("buildDailyPlannerGroups", () => {
  it("groups overdue work separately and combines tasks plus upcoming by date", () => {
    const groups = buildDailyPlannerGroups({
      overdueTasks: [
        {
          id: "task-overdue",
          title: "Fix homepage copy",
          dueDate: "2026-06-15",
          status: "In progress",
          priority: "High",
          brandSlug: "alpha",
          brandName: "Alpha",
          daysUntilDue: -1,
          relatedCampaignId: null,
        },
      ],
      dueTodayTasks: [
        {
          id: "task-today",
          title: "Draft launch email",
          dueDate: "2026-06-16",
          status: "Planned",
          priority: "Urgent",
          brandSlug: "alpha",
          brandName: "Alpha",
          daysUntilDue: 0,
          relatedCampaignId: null,
        },
      ],
      nextThreeDaysTasks: [
        {
          id: "task-soon",
          title: "Review ad creative",
          dueDate: "2026-06-18",
          status: "Needs review",
          priority: "Medium",
          brandSlug: "beta",
          brandName: "Beta",
          daysUntilDue: 2,
          relatedCampaignId: "campaign-1",
        },
      ],
      upcomingSoon: [
        {
          id: "upcoming-today",
          title: "Client check-in",
          date: "2026-06-16",
          type: "Meeting",
          status: "Scheduled",
          brandSlug: "alpha",
          brandName: "Alpha",
          brandColor: "#0F766E",
          daysUntil: 0,
        },
        {
          id: "upcoming-soon",
          title: "Launch day",
          date: "2026-06-18",
          type: "Campaign launch",
          status: "Scheduled",
          brandSlug: "beta",
          brandName: "Beta",
          brandColor: "#2563EB",
          daysUntil: 2,
        },
      ],
    });

    expect(groups.map((group) => group.id)).toEqual([
      "overdue",
      "2026-06-16",
      "2026-06-18",
    ]);
    expect(groups[0]?.entries).toHaveLength(1);
    expect(groups[1]?.entries.map((entry) => entry.kind)).toEqual([
      "task",
      "upcoming",
    ]);
    expect(groups[2]?.entries.map((entry) => entry.kind)).toEqual([
      "task",
      "upcoming",
    ]);
  });
});
