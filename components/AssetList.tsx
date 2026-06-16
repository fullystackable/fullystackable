import { deleteAsset } from "@/app/actions/workspace";
import { AssetEditForm } from "@/components/AssetEditForm";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { Badge, EmptyState } from "@/components/ui";
import { assetCategoryTones } from "@/lib/assets";
import { formatShortDate } from "@/lib/date";
import type { WorkspaceAsset, WorkspaceCampaign } from "@/lib/workspace-view";

type AssetListProps = {
  assets: WorkspaceAsset[];
  campaigns: Array<Pick<WorkspaceCampaign, "id" | "title">>;
  brandSlug?: string;
  allowDelete?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
};

function getAssetAccessCopy(asset: WorkspaceAsset) {
  if (asset.url) {
    return "Open link";
  }

  if (asset.storagePath) {
    return `Stored in app: ${asset.storagePath}`;
  }

  return "Reference-only asset";
}

export function AssetList({
  assets,
  campaigns,
  brandSlug,
  allowDelete = false,
  emptyTitle = "No assets yet",
  emptyDescription = "Creative files, reference documents, and working links will show up here when they are added.",
}: AssetListProps) {
  if (assets.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="data-list">
      {assets.map((asset) => (
        <article key={asset.id} className="data-row">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-ink">{asset.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">
                {asset.category} | {asset.type} | {asset.sourceType} | Updated{" "}
                {formatShortDate(asset.updatedAt)}
              </p>
              {asset.relatedCampaignTitle ? (
                <p className="mt-1 text-sm text-ink-muted">
                  Campaign: {asset.relatedCampaignTitle}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone={assetCategoryTones[asset.categoryValue]}>
                {asset.category}
              </Badge>
              {asset.isQuickLink ? <Badge tone="accent">Quick link</Badge> : null}
              <Badge>{asset.type}</Badge>
              <Badge>{asset.status}</Badge>
              <Badge>{asset.priority}</Badge>
            </div>
          </div>
          {allowDelete && brandSlug ? (
            <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
              <AssetEditForm
                asset={asset}
                brandSlug={brandSlug}
                campaigns={campaigns}
              />
              <form action={deleteAsset}>
                <input type="hidden" name="assetId" value={asset.id} />
                <input type="hidden" name="brandSlug" value={brandSlug} />
                <ConfirmSubmitButton
                  idleLabel="Remove"
                  confirmLabel="Remove asset"
                  confirmPrompt="Remove this asset?"
                />
              </form>
            </div>
          ) : null}
          {asset.description ? (
            <p className="mt-3 text-sm leading-6 text-ink-muted">{asset.description}</p>
          ) : null}
          {asset.notes ? (
            <p className="mt-3 text-sm leading-6 text-ink-muted">{asset.notes}</p>
          ) : null}
          {asset.url ? (
            <a
              href={asset.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex min-w-0 items-center break-all text-sm font-medium text-accent hover:text-app-sidebar"
            >
              {getAssetAccessCopy(asset)}
            </a>
          ) : asset.storagePath ? (
            <p className="mt-3 text-sm font-medium text-ink-muted">
              {getAssetAccessCopy(asset)}
            </p>
          ) : (
            <p className="mt-3 text-sm font-medium text-ink-muted">
              {getAssetAccessCopy(asset)}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
