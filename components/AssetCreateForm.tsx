"use client";

import { useActionState, useEffect, useRef } from "react";

import { createAsset } from "@/app/actions/workspace";
import { CampaignSelectField } from "@/components/CampaignSelectField";
import { SubmitButton } from "@/components/SubmitButton";
import { assetCategoryOptions } from "@/lib/assets";
import type { WorkspaceCampaign } from "@/lib/workspace-view";

const initialState = {
  success: false,
  message: "",
};

type AssetCreateFormProps = {
  brandId: string;
  brandSlug: string;
  campaigns: Array<Pick<WorkspaceCampaign, "id" | "title">>;
  defaultCampaignId?: string | null;
};

export function AssetCreateForm({
  brandId,
  brandSlug,
  campaigns,
  defaultCampaignId = null,
}: AssetCreateFormProps) {
  const [state, formAction] = useActionState(createAsset, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="brandId" value={brandId} />
      <input type="hidden" name="brandSlug" value={brandSlug} />

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Asset title</span>
        <input
          name="title"
          required
          className="app-input"
          placeholder="Summer Launch Checklist"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Category</span>
          <select
            name="assetCategory"
            defaultValue="document"
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
          <select name="assetType" defaultValue="document" className="app-input">
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
          <select name="sourceType" defaultValue="external_url" className="app-input">
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
            className="app-input"
            placeholder="https://example.com/asset"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Storage path</span>
          <input
            name="storagePath"
            className="app-input"
            placeholder="brands/fun-slides/uploads/logo.svg"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Status</span>
          <select name="status" defaultValue="active" className="app-input">
            <option value="active">Active</option>
            <option value="outdated">Outdated</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Priority</span>
          <select name="priority" defaultValue="medium" className="app-input">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>

      <CampaignSelectField
        campaigns={campaigns}
        defaultValue={defaultCampaignId ?? ""}
      />

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Description</span>
        <textarea
          name="description"
          rows={3}
          className="app-input min-h-24 resize-y"
          placeholder="What this asset is for, where it belongs, and how the team should use it."
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Notes</span>
        <textarea
          name="notes"
          rows={3}
          className="app-input min-h-24 resize-y"
          placeholder="Optional handling notes, owner context, or next-step reminders."
        />
      </label>

      <label className="flex items-start gap-3 rounded-2xl border border-app-line bg-white/70 px-4 py-3">
        <input
          type="checkbox"
          name="isQuickLink"
          value="true"
          className="mt-1 h-4 w-4 accent-[var(--app-accent)]"
        />
        <span className="min-w-0">
          <span className="block text-sm font-medium text-ink">Pin as a quick link</span>
          <span className="mt-1 block text-sm leading-6 text-ink-muted">
            Use this for high-frequency URLs like admin panels, drives, docs, and dashboards.
          </span>
        </span>
      </label>

      <p className="text-sm text-ink-muted">
        Use a URL for external assets, a storage path for upload placeholders, or neither for a simple reference record.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          This creates the asset record first, which keeps the workspace organized even before file handling exists.
        </p>
        <SubmitButton idleLabel="Add asset" pendingLabel="Adding..." />
      </div>

      {state.message ? (
        <p
          className={`text-sm ${state.success ? "text-success" : "text-danger"}`}
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
