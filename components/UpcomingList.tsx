import type { UpcomingItem } from "@/data/mockData";

type UpcomingListProps = {
  items: UpcomingItem[];
  showBrand?: boolean;
};

export function UpcomingList({ items, showBrand = false }: UpcomingListProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {item.date} • {item.type}
                {showBrand && item.brandName ? ` • ${item.brandName}` : ""}
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
              {item.owner}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
