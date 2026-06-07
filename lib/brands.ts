import { mockBrands } from "@/data/mockData";

export function getBrands() {
  return mockBrands;
}

export function getBrandById(brandId: string) {
  return mockBrands.find((brand) => brand.id === brandId);
}

export function getDashboardStats() {
  const activeBrands = mockBrands.length;
  const openTasks = mockBrands.reduce(
    (total, brand) =>
      total + brand.tasks.filter((task) => task.status !== "Done").length,
    0,
  );
  const upcomingItems = mockBrands.reduce(
    (total, brand) => total + brand.upcoming.length,
    0,
  );

  return {
    activeBrands,
    openTasks,
    upcomingItems,
  };
}

export function getUpcomingAcrossBrands() {
  return mockBrands.flatMap((brand) =>
    brand.upcoming.map((item) => ({
      ...item,
      brandName: brand.name,
    })),
  );
}

export function getStatusSummary() {
  const onTrack = mockBrands.filter((brand) => brand.status === "On track").length;
  const launchingSoon = mockBrands.filter(
    (brand) => brand.status === "Launching soon",
  ).length;
  const needsAttention = mockBrands.filter(
    (brand) => brand.status === "Needs attention",
  ).length;

  return [
    {
      label: "On track",
      count: onTrack,
      helper: "Healthy accounts with clear execution momentum.",
    },
    {
      label: "Launching soon",
      count: launchingSoon,
      helper: "Campaigns approaching launch windows and handoffs.",
    },
    {
      label: "Needs attention",
      count: needsAttention,
      helper: "Accounts with blockers, urgency, or cleanup work.",
    },
  ];
}
