import type { WorkspaceCampaign } from "@/lib/workspace-view";

type CampaignSelectFieldProps = {
  campaigns: Array<Pick<WorkspaceCampaign, "id" | "title">>;
  defaultValue?: string;
  name?: string;
  label?: string;
};

export function CampaignSelectField({
  campaigns,
  defaultValue = "",
  name = "relatedCampaignId",
  label = "Related campaign",
}: CampaignSelectFieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-ink">{label}</span>
      <select name={name} defaultValue={defaultValue} className="app-input">
        <option value="">No campaign</option>
        {campaigns.map((campaign) => (
          <option key={campaign.id} value={campaign.id}>
            {campaign.title}
          </option>
        ))}
      </select>
    </label>
  );
}
