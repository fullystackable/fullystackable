import type { BadgeTone } from "@/lib/design";
import type { AssetCategoryValue } from "@/lib/workspace-view";

export const assetCategoryOptions: Array<{
  value: AssetCategoryValue;
  label: string;
}> = [
  { value: "folder", label: "Folder" },
  { value: "canva", label: "Canva" },
  { value: "website_admin", label: "Website/Admin" },
  { value: "social_profile", label: "Social Profile" },
  { value: "ad_platform", label: "Ad Platform" },
  { value: "analytics", label: "Analytics" },
  { value: "crm", label: "CRM" },
  { value: "document", label: "Document" },
  { value: "creative_asset", label: "Creative Asset" },
  { value: "other", label: "Other" },
];

export const assetCategoryTones: Record<AssetCategoryValue, BadgeTone> = {
  folder: "info",
  canva: "accent",
  website_admin: "info",
  social_profile: "accent",
  ad_platform: "warning",
  analytics: "success",
  crm: "accent",
  document: "neutral",
  creative_asset: "warning",
  other: "neutral",
};
