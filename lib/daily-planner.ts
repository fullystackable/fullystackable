import "server-only";

import type { DashboardPinnedBrand } from "@/lib/dashboard-data";
import { getGlobalDashboardData } from "@/lib/dashboard-data";
import {
  buildDailyPlannerGroups,
  type DailyPlannerGroup,
} from "@/lib/daily-planner-helpers";

export type DailyPlannerData = {
  todayLabel: string;
  overdueCount: number;
  dueTodayCount: number;
  nextThreeDaysCount: number;
  upcomingSoonCount: number;
  groups: DailyPlannerGroup[];
  pinnedBrands: DashboardPinnedBrand[];
};

export async function getDailyPlannerData(
  baseDate: Date = new Date(),
): Promise<DailyPlannerData> {
  const dashboardData = await getGlobalDashboardData(baseDate);

  return {
    todayLabel: dashboardData.todayLabel,
    overdueCount: dashboardData.overdueTasks.length,
    dueTodayCount: dashboardData.dueTodayTasks.length,
    nextThreeDaysCount: dashboardData.nextThreeDaysTasks.length,
    upcomingSoonCount: dashboardData.upcomingSoon.length,
    groups: buildDailyPlannerGroups({
      overdueTasks: dashboardData.overdueTasks,
      dueTodayTasks: dashboardData.dueTodayTasks,
      nextThreeDaysTasks: dashboardData.nextThreeDaysTasks,
      upcomingSoon: dashboardData.upcomingSoon,
    }),
    pinnedBrands: dashboardData.pinnedBrands,
  };
}
