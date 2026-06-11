import { describe, expect, it } from "vitest";

import {
  buildMonthCalendarDays,
  buildUpcomingGroups,
  buildWeekCalendarDays,
  getPlannerViewItems,
  getUpcomingTypeLabel,
} from "../../lib/upcoming-planner-helpers";

const baseDate = new Date(2026, 5, 8);

const items = [
  {
    id: "1",
    title: "Launch homepage refresh",
    date: "2026-06-08",
    notes: null,
    typeLabel: "Launch",
    statusLabel: "Scheduled",
    brandName: "Acme",
    brandSlug: "acme",
    brandColor: "#0C4A6E",
    campaignId: "campaign-1",
    campaignTitle: "Summer Launch",
    href: "/brands/acme?tab=upcoming#upcoming",
  },
  {
    id: "2",
    title: "Approve final assets",
    date: "2026-06-10",
    notes: null,
    typeLabel: "Deadline",
    statusLabel: "Scheduled",
    brandName: "Acme",
    brandSlug: "acme",
    brandColor: "#0C4A6E",
    campaignId: "campaign-1",
    campaignTitle: "Summer Launch",
    href: "/brands/acme?tab=upcoming#upcoming",
  },
  {
    id: "3",
    title: "Client check-in",
    date: "2026-06-15",
    notes: null,
    typeLabel: "Meeting",
    statusLabel: "Scheduled",
    brandName: "Bravo",
    brandSlug: "bravo",
    brandColor: "#D97706",
    campaignId: null,
    campaignTitle: null,
    href: "/brands/bravo?tab=upcoming#upcoming",
  },
];

describe("upcoming planner helpers", () => {
  it("maps campaign launch types to launch", () => {
    expect(getUpcomingTypeLabel("campaign_launch")).toBe("Launch");
  });

  it("filters this week items to the current calendar week", () => {
    expect(getPlannerViewItems(items, "week", baseDate)).toHaveLength(2);
    expect(getPlannerViewItems(items, "month", baseDate)).toHaveLength(3);
  });

  it("builds seven days for the weekly calendar", () => {
    const days = buildWeekCalendarDays(items, baseDate);

    expect(days).toHaveLength(7);
    expect(days[1]?.date).toBe("2026-06-08");
    expect(days[1]?.items).toHaveLength(1);
  });

  it("builds a month grid with leading and trailing days", () => {
    const days = buildMonthCalendarDays(items, baseDate);

    expect(days.length).toBeGreaterThanOrEqual(35);
    expect(days.some((day) => day.date === "2026-06-08")).toBe(true);
  });

  it("groups items by brand and campaign", () => {
    const brandGroups = buildUpcomingGroups(items, "brand");
    const campaignGroups = buildUpcomingGroups(items, "campaign");

    expect(brandGroups[0]?.title).toBe("Acme");
    expect(brandGroups[0]?.accentColor).toBe("#0C4A6E");
    expect(brandGroups[0]?.items).toHaveLength(2);
    expect(campaignGroups.some((group) => group.title === "No campaign")).toBe(true);
  });
});
