import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const insertMock = vi.fn();
  const fromAdminMock = vi.fn(() => ({
    insert: insertMock,
  }));
  const serverResponses = new Map<string, { data?: unknown; error: unknown }>();
  const serverFromMock = vi.fn((table: string) => {
    const response = serverResponses.get(table) ?? { data: [], error: null };
    const builder = {
      order: vi.fn(() => builder),
      limit: vi.fn(() => Promise.resolve(response)),
      in: vi.fn(() => Promise.resolve(response)),
    };

    return {
      select: vi.fn(() => builder),
    };
  });

  return {
    insertMock,
    fromAdminMock,
    serverFromMock,
    serverResponses,
  };
});

vi.mock("../../lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({
    from: mocks.fromAdminMock,
  }),
}));

vi.mock("server-only", () => ({}));

vi.mock("../../lib/supabase/server", () => ({
  createSupabaseServerClient: () => ({
    from: mocks.serverFromMock,
  }),
}));

import { createActivityLogEntry, getRecentActivityFeed } from "../../lib/activity-log";

describe("createActivityLogEntry", () => {
  beforeEach(() => {
    mocks.fromAdminMock.mockClear();
    mocks.insertMock.mockReset();
    mocks.serverFromMock.mockClear();
    mocks.serverResponses.clear();
  });

  it("skips writes when the activity_log table is not available yet", async () => {
    mocks.insertMock.mockResolvedValue({
      error: {
        code: "PGRST205",
        message:
          "Could not find the table 'public.activity_log' in the schema cache",
      },
    });

    await expect(
      createActivityLogEntry({
        brandId: "brand-1",
        entityType: "brand",
        entityLabel: "Brand",
        action: "created",
        subject: "Acme",
      }),
    ).resolves.toBeUndefined();

    expect(mocks.fromAdminMock).toHaveBeenCalledWith("activity_log");
  });

  it("still throws for unexpected write failures", async () => {
    mocks.insertMock.mockResolvedValue({
      error: {
        code: "42501",
        message: "new row violates row-level security policy",
      },
    });

    await expect(
      createActivityLogEntry({
        brandId: "brand-1",
        entityType: "brand",
        entityLabel: "Brand",
        action: "created",
      }),
    ).rejects.toThrow(
      "Failed to write activity log entry: new row violates row-level security policy",
    );
  });
});

describe("getRecentActivityFeed", () => {
  beforeEach(() => {
    mocks.fromAdminMock.mockClear();
    mocks.insertMock.mockReset();
    mocks.serverFromMock.mockClear();
    mocks.serverResponses.clear();
  });

  it("builds a believable fallback feed when the activity_log table is missing", async () => {
    mocks.serverResponses.set("activity_log", {
      error: {
        code: "PGRST205",
        message:
          "Could not find the table 'public.activity_log' in the schema cache",
      },
    });
    mocks.serverResponses.set("brands", {
      data: [
        {
          id: "brand-1",
          slug: "acme",
          name: "Acme",
          created_at: "2026-06-01T10:00:00Z",
          updated_at: "2026-06-07T10:00:00Z",
        },
      ],
      error: null,
    });
    mocks.serverResponses.set("campaigns", {
      data: [
        {
          id: "campaign-1",
          brand_id: "brand-1",
          title: "Launch Push",
          launch_date: "2026-06-20",
          created_at: "2026-06-02T10:00:00Z",
          updated_at: "2026-06-07T09:00:00Z",
        },
      ],
      error: null,
    });
    mocks.serverResponses.set("tasks", {
      data: [
        {
          id: "task-1",
          brand_id: "brand-1",
          related_campaign_id: "campaign-1",
          title: "Finalize landing page copy",
          due_date: "2026-06-08",
          status: "in_progress",
          created_at: "2026-06-05T10:00:00Z",
          updated_at: "2026-06-07T12:00:00Z",
        },
      ],
      error: null,
    });
    mocks.serverResponses.set("assets", { data: [], error: null });
    mocks.serverResponses.set("contacts", { data: [], error: null });
    mocks.serverResponses.set("notes", { data: [], error: null });
    mocks.serverResponses.set("upcoming_items", { data: [], error: null });

    await expect(getRecentActivityFeed(5)).resolves.toEqual([
      {
        id: "seed-task-task-1",
        title: "Task updated",
        subject: "Finalize landing page copy",
        details: "Due 2026-06-08",
        createdAt: "2026-06-07T12:00:00Z",
        brandName: "Acme",
        brandSlug: "acme",
        campaignTitle: "Launch Push",
        href: "/brands/acme/campaigns/campaign-1?tab=tasks#tasks",
      },
      {
        id: "seed-brand-brand-1",
        title: "Brand updated",
        subject: "Acme",
        details: null,
        createdAt: "2026-06-07T10:00:00Z",
        brandName: "Acme",
        brandSlug: "acme",
        campaignTitle: null,
        href: "/brands/acme?tab=profile#profile",
      },
      {
        id: "seed-campaign-campaign-1",
        title: "Campaign updated",
        subject: "Launch Push",
        details: "Launch 2026-06-20",
        createdAt: "2026-06-07T09:00:00Z",
        brandName: "Acme",
        brandSlug: "acme",
        campaignTitle: "Launch Push",
        href: "/brands/acme/campaigns/campaign-1",
      },
    ]);
  });

  it("uses the same fallback when the table exists but has no rows yet", async () => {
    mocks.serverResponses.set("activity_log", {
      data: [],
      error: null,
    });
    mocks.serverResponses.set("brands", {
      data: [
        {
          id: "brand-1",
          slug: "acme",
          name: "Acme",
          created_at: "2026-06-01T10:00:00Z",
          updated_at: "2026-06-07T10:00:00Z",
        },
      ],
      error: null,
    });
    mocks.serverResponses.set("campaigns", { data: [], error: null });
    mocks.serverResponses.set("tasks", { data: [], error: null });
    mocks.serverResponses.set("assets", { data: [], error: null });
    mocks.serverResponses.set("contacts", { data: [], error: null });
    mocks.serverResponses.set("notes", {
      data: [
        {
          id: "note-1",
          brand_id: "brand-1",
          title: null,
          body: "Keep the new positioning proof-first across all homepage sections.",
          created_at: "2026-06-07T11:15:00Z",
          updated_at: "2026-06-07T11:15:00Z",
        },
      ],
      error: null,
    });
    mocks.serverResponses.set("upcoming_items", { data: [], error: null });

    const items = await getRecentActivityFeed(5);

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      id: "seed-note-note-1",
      title: "Note created",
      subject: "Keep the new positioning proof-first across a...",
      brandName: "Acme",
      brandSlug: "acme",
    });
    expect(items[1]).toMatchObject({
      id: "seed-brand-brand-1",
      title: "Brand updated",
      subject: "Acme",
    });
  });

  it("prefers real activity rows when the log already has data", async () => {
    mocks.serverResponses.set("activity_log", {
      data: [
        {
          id: "log-1",
          brand_id: "brand-1",
          campaign_id: "campaign-1",
          entity_type: "task",
          entity_label: "Task",
          action: "completed",
          subject: "Finalize landing page copy",
          details: "Marked done",
          created_at: "2026-06-07T12:30:00Z",
        },
      ],
      error: null,
    });
    mocks.serverResponses.set("brands", {
      data: [
        {
          id: "brand-1",
          slug: "acme",
          name: "Acme",
        },
      ],
      error: null,
    });
    mocks.serverResponses.set("campaigns", {
      data: [
        {
          id: "campaign-1",
          brand_id: "brand-1",
          title: "Launch Push",
        },
      ],
      error: null,
    });

    const items = await getRecentActivityFeed(5);

    expect(items).toEqual([
      {
        id: "log-1",
        title: "Task completed",
        subject: "Finalize landing page copy",
        details: "Marked done",
        createdAt: "2026-06-07T12:30:00Z",
        brandName: "Acme",
        brandSlug: "acme",
        campaignTitle: "Launch Push",
        href: "/brands/acme/campaigns/campaign-1?tab=tasks#tasks",
      },
    ]);
    expect(mocks.serverFromMock).not.toHaveBeenCalledWith("notes");
    expect(mocks.serverFromMock).not.toHaveBeenCalledWith("upcoming_items");
  });
});
