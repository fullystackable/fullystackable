import { describe, expect, it } from "vitest";

import {
  differenceInCalendarDays,
  getRelativeDateLabel,
  getTaskDueDateLabel,
} from "../../lib/date";
import {
  buildCampaignWorkspaceHref,
  buildCampaignClearHref,
  buildWorkspaceResetHref,
  buildWorkspaceTaskHref,
} from "../../lib/workspace-url-state";

const baseDate = new Date(2026, 5, 8);

describe("getTaskDueDateLabel", () => {
  it("returns no due date for null values", () => {
    expect(getTaskDueDateLabel(null, baseDate)).toBe("No due date");
  });

  it("labels overdue tasks", () => {
    expect(getTaskDueDateLabel("2026-06-07", baseDate)).toBe("Overdue");
  });

  it("labels tasks due today", () => {
    expect(getTaskDueDateLabel("2026-06-08", baseDate)).toBe("Due today");
  });

  it("labels tasks due within the week", () => {
    expect(getTaskDueDateLabel("2026-06-12", baseDate)).toBe("Due this week");
  });

  it("labels later tasks as upcoming", () => {
    expect(getTaskDueDateLabel("2026-06-20", baseDate)).toBe("Upcoming");
  });
});

describe("getRelativeDateLabel", () => {
  it("describes the relative day offset", () => {
    expect(getRelativeDateLabel("2026-06-06", baseDate)).toBe("Overdue 2d");
    expect(getRelativeDateLabel("2026-06-08", baseDate)).toBe("Today");
    expect(getRelativeDateLabel("2026-06-09", baseDate)).toBe("Tomorrow");
    expect(getRelativeDateLabel("2026-06-13", baseDate)).toBe("In 5d");
  });
});

describe("differenceInCalendarDays", () => {
  it("compares date-only values against the provided base date", () => {
    expect(differenceInCalendarDays("2026-06-11", baseDate)).toBe(3);
  });
});

describe("workspace URL state helpers", () => {
  it("preserves campaign focus when resetting sort controls", () => {
    expect(buildWorkspaceResetHref("acme", "campaign-123")).toBe(
      "/brands/acme?campaign=campaign-123",
    );
    expect(buildWorkspaceResetHref("acme", null)).toBe("/brands/acme");
    expect(buildWorkspaceResetHref("acme", "campaign-123", "notes")).toBe(
      "/brands/acme?campaign=campaign-123&tab=notes",
    );
  });

  it("keeps non-default workspace state when clearing campaign focus", () => {
    expect(
      buildCampaignClearHref(
        "acme",
        "priority_desc",
        "incomplete",
        "type",
        "status",
        "compact",
      ),
    ).toBe(
      "/brands/acme?taskSort=priority_desc&taskView=incomplete&assetSort=type&upcomingSort=status&density=compact",
    );
    expect(
      buildCampaignClearHref(
        "acme",
        "priority_desc",
        "incomplete",
        "type",
        "status",
        "compact",
        "assets",
      ),
    ).toBe(
      "/brands/acme?taskSort=priority_desc&taskView=incomplete&assetSort=type&upcomingSort=status&density=compact&tab=assets",
    );
  });

  it("drops default values from the clear href", () => {
    expect(
      buildCampaignClearHref(
        "acme",
        "due_asc",
        "all",
        "updated_desc",
        "date_asc",
        "comfortable",
      ),
    ).toBe("/brands/acme");
  });

  it("opens task links in the incomplete tasks view", () => {
    expect(buildWorkspaceTaskHref("acme", null)).toBe(
      "/brands/acme?taskView=incomplete#tasks",
    );
  });

  it("preserves campaign focus in task links", () => {
    expect(buildWorkspaceTaskHref("acme", "campaign-123")).toBe(
      "/brands/acme?campaign=campaign-123&taskView=incomplete#tasks",
    );
  });

  it("builds campaign workspace links with compact default state", () => {
    expect(buildCampaignWorkspaceHref("acme", "campaign-123")).toBe(
      "/brands/acme/campaigns/campaign-123",
    );
    expect(
      buildCampaignWorkspaceHref("acme", "campaign-123", {
        tab: "assets",
        hash: "#assets",
      }),
    ).toBe("/brands/acme/campaigns/campaign-123?tab=assets#assets");
  });
});
