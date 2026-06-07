import type { Asset } from "@/data/mockData";

type AssetListProps = {
  assets: Asset[];
};

export function AssetList({ assets }: AssetListProps) {
  return (
    <div className="space-y-3">
      {assets.map((asset) => (
        <article
          key={asset.id}
          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-950">{asset.name}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {asset.type} • Updated {asset.updatedAt}
              </p>
            </div>
            <a
              href={asset.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-100"
            >
              Open link
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
