"use client";

import { useState } from "react";

import { updateAsset } from "@/app/actions/workspace";
import { CampaignSelectField } from "@/components/CampaignSelectField";
import { SubmitButton } from "@/components/SubmitButton";
import { assetCategoryOptions } from "@/lib/assets";
import type { WorkspaceAsset, WorkspaceCampaign } from "@/lib/workspace-view";

const initialState = {
  success: false,
  message: "",
};

type AssetEditFormProps = {
  asset: WorkspaceAsset;
  brandSlug: string;
  campaigns: Array<Pick<WorkspaceCampaign, "id" | "title">>;
};

export function AssetEditForm({
  asset,
  brandSlug,
  campaigns,
}: AssetEditFormProps) {
  const [isEditing, setIsEditing] = useState(true);
  const [message, setMessage] = useState("");
  const [wasSuccessful, setWasSuccessful] = useState(false);

  if (!isEditing) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-sm font-medium text-ink-muted hover:text-ink"
        >
          Edit
        </button>
        {wasSuccessful && message ? (
          <p
            className="order-last basis-full text-sm text-success"
            aria-live="polite"
          >
            {message}
          </p>
        ) : null}
      </>
    );
  }

  async function handleSubmit(formData: FormData) {
    const result = await updateAsset(initialState, formData);
    setMessage(result.message);
    setWasSuccessful(result.success);

    if (result.success) {
      setIsEditing(false);
    }
  }

  return (
    <form
      action={handleSubmit}
      className="order-last mt-4 w-full basis-full space-y-4 rounded-2xl border border-app-line bg-white/90 p-4"
    >
      <input type="hidden" name="assetId" value={asset.id} />
      <input type="hidden" name="brandSlug" value={brandSlug} />

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Asset title</span>
        <input
          name="title"
          required
          defaultValue={asset.title}
          className="app-input"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Category</span>
          <select
            name="assetCategory"
            defaultValue={asset.categoryValue}
            className="app-input"
          >
            {assetCategoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Asset detail type</span>
          <select
            name="assetType"
            defaultValue={asset.typeValue}
            className="app-input"
          >
            <option value="logo">Logo</option>
            <option value="brand_guidelines">Brand Guidelines</option>
            <option value="canva_design">Canva Design</option>
            <option value="photo_folder">Photo Folder</option>
            <option value="video_folder">Video Folder</option>
            <option value="ad_creative">Ad Creative</option>
            <option value="print_file">Print File</option>
            <option value="website_link">Website Link</option>
            <option value="social_profile">Social Profile</option>
            <option value="google_drive_folder">Google Drive Folder</option>
            <option value="dropbox_folder">Dropbox Folder</option>
            <option value="document">Document</option>
            <option value="spreadsheet">Spreadsheet</option>
            <option value="pdf">PDF</option>
            <option value="contract">Contract</option>
            <option value="vendor_file">Vendor File</option>
            <option value="campaign_asset">Campaign Asset</option>
            <option value="other">Other</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Source mode</span>
          <select
            name="sourceType"
            defaultValue={asset.sourceTypeValue}
            className="app-input"
          >
            <option value="external_url">External link</option>
            <option value="upload">Upload placeholder</option>
            <option value="reference">Reference record</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">URL</span>
          <input
            name="url"
            type="url"
            defaultValue={asset.url ?? ""}
            className="app-input"
            placeholder="https://example.com/asset"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Storage path</span>
          <input
            name="storagePath"
            defaultValue={asset.storagePath ?? ""}
            className="app-input"
            placeholder="brands/fun-slides/uploads/logo.svg"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Status</span>
          <select
            name="status"
            defaultValue={asset.statusValue}
            className="app-input"
          >
            <option value="active">Active</option>
            <option value="outdated">Outdated</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Priority</span>
          <select
            name="priority"
            defaultValue={asset.priorityValue}
            className="app-input"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>

      <CampaignSelectField
        campaigns={campaigns}
        defaultValue={asset.relatedCampaignId ?? ""}
      />

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Description</span>
        <textarea
          name="description"
          rows={3}
          defaultValue={asset.description ?? ""}
          className="app-input min-h-24 resize-y"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Notes</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={asset.notes ?? ""}
          className="app-input min-h-24 resize-y"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="text-sm font-medium text-ink-muted hover:text-ink"
        >
          Cancel
        </button>
        <SubmitButton idleLabel="Save asset" pendingLabel="Saving..." />
      </div>

      {message && !wasSuccessful ? (
        <p
          className="text-sm text-danger"
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
