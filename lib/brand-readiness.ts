export type BrandReadinessItem = {
  id: string;
  label: string;
  complete: boolean;
};

export type BrandReadiness = {
  completedCount: number;
  totalCount: number;
  items: BrandReadinessItem[];
  missingLabels: string[];
  isReady: boolean;
};

type BrandReadinessInput = {
  description: string | null;
  website: string | null;
  contactsCount: number;
  referenceLinks: string | null;
  quickLinksCount: number;
  brandVoice?: string | null;
  commonCtas?: string | null;
  audienceNotes?: string | null;
  servicesProducts?: string | null;
  pricingNotes?: string | null;
  positioningNotes?: string | null;
  doDontList?: string | null;
};

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

export function buildBrandReadiness(
  input: BrandReadinessInput,
): BrandReadiness {
  const hasStrategyContext =
    hasText(input.brandVoice) ||
    hasText(input.commonCtas) ||
    hasText(input.audienceNotes) ||
    hasText(input.servicesProducts) ||
    hasText(input.pricingNotes) ||
    hasText(input.positioningNotes) ||
    hasText(input.doDontList);
  const hasQuickAccess =
    hasText(input.referenceLinks) ||
    hasText(input.website) ||
    input.quickLinksCount > 0;

  const items: BrandReadinessItem[] = [
    {
      id: "description",
      label: "Brand brief",
      complete: hasText(input.description),
    },
    {
      id: "website",
      label: "Website",
      complete: hasText(input.website),
    },
    {
      id: "contact",
      label: "Primary contact",
      complete: input.contactsCount > 0,
    },
    {
      id: "strategy",
      label: "Voice or strategy notes",
      complete: hasStrategyContext,
    },
    {
      id: "quick-access",
      label: "Quick access links",
      complete: hasQuickAccess,
    },
  ];

  const completedCount = items.filter((item) => item.complete).length;

  return {
    completedCount,
    totalCount: items.length,
    items,
    missingLabels: items
      .filter((item) => !item.complete)
      .map((item) => item.label),
    isReady: completedCount === items.length,
  };
}
