import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { GlobalDashboard } from "@/components/GlobalDashboard";
import type { GlobalDashboardData } from "@/lib/dashboard-data";

const dashboardData: GlobalDashboardData = {
  stats: {
    activeBrands: 2,
    tasksDueThisWeek: 1,
    overdueTasks: 0,
    upcomingItems: 1,
  },
  dueThisWeekTasks: [],
  overdueTasks: [],
  upcomingItems: [],
  recentActivity: [],
  recentAssets: [],
  recentNotes: [],
  recentCampaigns: [],
  todayLabel: "2026-06-15",
};

describe("GlobalDashboard", () => {
  it("assigns unique section ids for dashboard anchor navigation", () => {
    const markup = renderToStaticMarkup(
      createElement(GlobalDashboard, { data: dashboardData }),
    );

    const sectionIds = Array.from(
      markup.matchAll(/<section id="([^"]+)"/g),
      ([, id]) => id,
    );

    expect(sectionIds).toEqual([
      "tasks",
      "upcoming",
      "assets",
      "activity",
      "notes",
      "campaigns",
    ]);
  });
});
