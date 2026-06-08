import { deleteAsset } from "@/app/actions/workspace";
import { AssetEditForm } from "@/components/AssetEditForm";
import { Badge, EmptyState } from "@/components/ui";
import { formatShortDate } from "@/lib/date";
import type { WorkspaceAsset, WorkspaceCampaign } from "@/lib/workspace-view";

type AssetListProps = {
  assets: WorkspaceAsset[];
  campaigns: Array<Pick<WorkspaceCampaign, "id" | "title">>;
  brandSlug?: string;
  allowDelete?: boolean;
};

export function AssetList({
  assets,
  campaigns,
  brandSlug,
  allowDelete = false,
}: AssetListProps) {
  if (assets.length === 0) {
    return (
      <EmptyState
        title="No assets yet"
        description="Creative files, reference documents, and working links will show up here when they are added."
      />
    );
  }

  return (
    <div className="data-list">
      {assets.map((asset) => (
        <article key={asset.id} className="data-row">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-ink">{asset.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">
                {asset.type} | {asset.sourceType} | Updated {formatShortDate(asset.updatedAt)}
              </p>
              {asset.relatedCampaignTitle ? (
                <p className="mt-1 text-sm text-ink-muted">
                  Campaign: {asset.relatedCampaignTitle}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>{asset.type}</Badge>
              <Badge>{asset.status}</Badge>
              <Badge>{asset.priority}</Badge>
              {allowDelete && brandSlug ? (
                <>
                  <AssetEditForm
                    asset={asset}
                    brandSlug={brandSlug}
                    campaigns={campaigns}
                  />
                  <form action={deleteAsset}>
                    <input type="hidden" name="assetId" value={asset.id} />
                    <input type="hidden" name="brandSlug" value={brandSlug} />
                    <button
                      type="submit"
                      className="text-sm font-medium text-danger hover:opacity-80"
                    >
                      Remove
                    </button>
                  </form>
                </>
              ) : null}
            </div>
          </div>
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
              className="mt-3 inline-flex items-center text-sm font-medium text-accent hover:text-app-sidebar"
            >
              Open link
            </a>
          ) : asset.storagePath ? (
            <p className="mt-3 text-sm font-medium text-ink-muted">
              Stored in app: {asset.storagePath}
            </p>
          ) : (
            <p className="mt-3 text-sm font-medium text-ink-muted">
              Reference-only asset
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
