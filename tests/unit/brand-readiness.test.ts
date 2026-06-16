import { describe, expect, it } from "vitest";

import { buildBrandReadiness } from "../../lib/brand-readiness";

describe("buildBrandReadiness", () => {
  it("marks a brand ready when core daily-use setup is present", () => {
    const readiness = buildBrandReadiness({
      description: "Travel brand focused on launch campaigns.",
      website: "https://example.com",
      contactsCount: 1,
      referenceLinks: "https://docs.example.com/brief",
      quickLinksCount: 2,
      brandVoice: "Clear, direct, warm.",
    });

    expect(readiness.completedCount).toBe(5);
    expect(readiness.totalCount).toBe(5);
    expect(readiness.isReady).toBe(true);
    expect(readiness.missingLabels).toEqual([]);
  });

  it("surfaces missing setup areas when a workspace is still incomplete", () => {
    const readiness = buildBrandReadiness({
      description: null,
      website: null,
      contactsCount: 0,
      referenceLinks: null,
      quickLinksCount: 0,
      brandVoice: null,
      commonCtas: null,
      audienceNotes: null,
      servicesProducts: null,
      pricingNotes: null,
      positioningNotes: null,
      doDontList: null,
    });

    expect(readiness.completedCount).toBe(0);
    expect(readiness.isReady).toBe(false);
    expect(readiness.missingLabels).toEqual([
      "Brand brief",
      "Website",
      "Primary contact",
      "Voice or strategy notes",
      "Quick access links",
    ]);
  });
});
