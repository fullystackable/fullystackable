import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  tables: {} as Record<string, unknown[]>,
}));

vi.mock("server-only", () => ({}));

vi.mock("../../lib/supabase/server", () => ({
  createSupabaseServerClient: () => ({
    from: (table: string) => ({
      select: () => {
        const result = {
          data: mocks.tables[table] ?? [],
          error: null,
        };

        if (table === "brands") {
          return {
            order: vi.fn().mockResolvedValue(result),
          };
        }

        return Promise.resolve(result);
      },
    }),
  }),
}));

import { getUniversalSearchData } from "../../lib/universal-search";

describe("getUniversalSearchData", () => {
  beforeEach(() => {
    for (const key of Object.keys(mocks.tables)) {
      delete mocks.tables[key];
    }
  });

  it("formats contact descriptions with a clean bullet separator", async () => {
    mocks.tables.brands = [
      {
        id: "brand-1",
        slug: "acme",
        name: "Acme",
        description: null,
        website: null,
        status: "active",
        notes: null,
        brand_voice: null,
        common_ctas: null,
        audience_notes: null,
        services_products: null,
        pricing_notes: null,
        positioning_notes: null,
        do_dont_list: null,
        reference_links: null,
      },
    ];
    mocks.tables.tasks = [];
    mocks.tables.assets = [];
    mocks.tables.contacts = [
      {
        id: "contact-1",
        brand_id: "brand-1",
        name: "Alice Johnson",
        role: "Founder",
        company: "Acme",
        email: "alice@acme.test",
        phone: "555-1234",
        contact_type: "owner",
        notes: "Primary day-to-day contact",
      },
    ];
    mocks.tables.notes = [];
    mocks.tables.campaigns = [];
    mocks.tables.upcoming_items = [];

    const data = await getUniversalSearchData("alice");
    const contactSection = data.sections.find((section) => section.type === "contacts");

    expect(contactSection?.results).toHaveLength(1);
    expect(contactSection?.results[0]?.description).toBe(
      "Founder | Acme \u2022 alice@acme.test \u2022 555-1234 \u2022 Primary day-to-day contact",
    );
    expect(contactSection?.results[0]?.description).toContain("\u2022");
  });
});
