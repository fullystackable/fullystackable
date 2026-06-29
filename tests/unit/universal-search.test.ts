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

  it("finds seeded brands through strategic profile fields and reference links", async () => {
    mocks.tables.brands = [
      {
        id: "brand-1",
        slug: "fun-slides",
        name: "Fun Slides",
        description:
          "Presentation-first storytelling brand focused on sales decks, founder narratives, and launch-ready visual systems.",
        website: "https://funslides.example.com",
        status: "active",
        notes: "Keep presentation narrative strategy and launch collateral in one place.",
        brand_voice:
          "Confident, polished, presentation-native, and proof-first. Sound like a strategist helping a founder tighten the narrative, not a hypey creative agency.",
        common_ctas: `Book a story session
Audit the deck
Request speaker support
See before-and-after slides`,
        audience_notes:
          "Primary buyers are founder-led B2B teams, sales leaders, and operators prepping webinars, investor updates, keynote talks, and sales enablement decks.",
        services_products: `Narrative workshops
Sales decks
Webinar landing page copy
Speaker slide systems`,
        pricing_notes:
          "Usually sold as premium strategy-plus-design sprints or monthly presentation support retainers.",
        positioning_notes:
          "Position Fun Slides as the team that turns messy ideas into executive-ready storylines.",
        do_dont_list: `Do: lead with proof, momentum, and strategic clarity.
Don't: use startup cliches, vague inspiration, or overdesigned buzzwords.`,
        reference_links: `https://docs.funslides.example.com/webinar-messaging
https://drive.funslides.example.com/speaker-template-system`,
      },
      {
        id: "brand-2",
        slug: "swack-vacations",
        name: "Swack Vacations",
        description:
          "Travel brand balancing destination campaigns, email nurture, and seasonal booking pushes across multiple offers.",
        website: "https://swackvacations.example.com",
        status: "launching",
        notes: "Seasonal launches and partner coordination are the primary workflow drivers.",
        brand_voice:
          "Warm, upbeat, and decisive. Sell the escape, but anchor every message in convenience, value stacking, and confidence to book now.",
        common_ctas: `Build my itinerary
Check package dates
See what is included
Lock in the offer`,
        audience_notes:
          "Core audience includes busy couples, friend groups, and parents planning easy getaways. They want all-inclusive clarity and low-friction booking.",
        services_products: `Seasonal package launches
Destination landing pages
Email nurture flows
Retargeting creative`,
        pricing_notes:
          "Most campaigns emphasize bundled savings, low-deposit booking windows, and value-add perks such as airport transfers or resort credits.",
        positioning_notes:
          "Swack should feel like a travel advisor with sharp campaign instincts: curated escapes, fewer decision points, and packages built for travelers who want confidence over complexity.",
        do_dont_list: `Do: lead with value stack, trip ease, and clear inclusions.
Don't: hide blackout dates, deposit terms, or partner details.`,
        reference_links: `https://partners.swackvacations.example.com/summer-escape-offers
https://docs.swackvacations.example.com/low-deposit-booking-faq`,
      },
      {
        id: "brand-3",
        slug: "hammer-and-nails",
        name: "Hammer & Nails",
        description:
          "Home services brand coordinating location pages, local campaigns, and lead conversion improvements for a growing footprint.",
        website: "https://hammerandnails.example.com",
        status: "needs_attention",
        notes: "Track location-specific fixes, SEO assets, and vendor coordination.",
        brand_voice:
          "Direct, trustworthy, and local. Sound like an experienced operator who respects the homeowner's time and explains the next step clearly.",
        common_ctas: `Book an inspection
Get a same-day quote
Check service availability
Ask about financing`,
        audience_notes:
          "Homeowners in growth markets are usually comparing two or three contractors at once. They respond to fast response times, visible proof, financing clarity, and reassurance that crews will show up when promised.",
        services_products: `Deck builds
Railing replacement
Pergola installs
Storm-season inspection campaigns`,
        pricing_notes:
          "Price messaging should support quote requests with financing options, free estimate language where accurate, and realistic scope ranges.",
        positioning_notes:
          "Hammer & Nails wins when it feels dependable, fast, and specific to the market.",
        do_dont_list: `Do: highlight response speed, trust signals, and project readiness.
Don't: overpromise timelines or use luxury-only framing.`,
        reference_links: `https://help.hammerandnails.example.com/quote-form-tracking
https://ops.hammerandnails.example.com/storm-season-inspection-playbook`,
      },
    ];
    mocks.tables.tasks = [];
    mocks.tables.assets = [];
    mocks.tables.contacts = [];
    mocks.tables.notes = [];
    mocks.tables.campaigns = [];
    mocks.tables.upcoming_items = [];

    const storySession = await getUniversalSearchData("story session");
    const storyBrand = storySession.sections
      .find((section) => section.type === "brands")
      ?.results.find((result) => result.title === "Fun Slides");

    expect(storyBrand?.href).toBe("/brands/fun-slides");
    expect(storySession.totalResults).toBeGreaterThan(0);

    const lowDeposit = await getUniversalSearchData("low-deposit booking");
    const lowDepositBrand = lowDeposit.sections
      .find((section) => section.type === "brands")
      ?.results.find((result) => result.title === "Swack Vacations");

    expect(lowDepositBrand?.meta).toBe("Brand workspace");

    const sameDayQuote = await getUniversalSearchData("same-day quote");
    const sameDayBrand = sameDayQuote.sections
      .find((section) => section.type === "brands")
      ?.results.find((result) => result.title === "Hammer & Nails");

    expect(sameDayBrand?.href).toBe("/brands/hammer-and-nails");

    const referenceLinkSearch = await getUniversalSearchData("speaker-template-system");
    const referenceLink = referenceLinkSearch.sections
      .find((section) => section.type === "links")
      ?.results.find((result) => result.externalHref?.includes("speaker-template-system"));

    expect(referenceLink?.title).toBe("Fun Slides reference link");
    expect(referenceLink?.externalHref).toBe(
      "https://drive.funslides.example.com/speaker-template-system",
    );
  });
});
