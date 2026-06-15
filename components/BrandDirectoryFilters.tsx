import Link from "next/link";

import { Badge } from "@/components/ui";
import type { BrandDirectoryStatusFilter } from "@/lib/brand-workspaces";

type BrandDirectoryFiltersProps = {
  query: string;
  status: BrandDirectoryStatusFilter;
  filteredCount: number;
  totalBrands: number;
  currentBrandsCount: number;
  hasFilters: boolean;
};

export function BrandDirectoryFilters({
  query,
  status,
  filteredCount,
  totalBrands,
  currentBrandsCount,
  hasFilters,
}: BrandDirectoryFiltersProps) {
  return (
    <div className="mt-6 space-y-4">
      <form action="/brands" className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_260px_auto]">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Search brands</span>
          <input
            name="q"
            defaultValue={query}
            className="app-input"
            placeholder="Search brands, contacts, campaigns, assets, or notes"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Status</span>
          <select name="status" defaultValue={status} className="app-input">
            <option value="current">Current brands</option>
            <option value="all">All brands</option>
            <option value="active">On track</option>
            <option value="needs_attention">Needs attention</option>
            <option value="launching">Launching soon</option>
            <option value="archived">Archived</option>
          </select>
        </label>

        <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row sm:flex-wrap sm:items-end xl:col-span-1">
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-app-sidebar px-4 py-2 text-sm font-medium text-white hover:bg-app-sidebar-muted"
          >
            Apply filters
          </button>
          {hasFilters ? (
            <Link
              href="/brands"
              className="inline-flex min-h-11 items-center rounded-full border border-app-line px-4 py-2 text-sm font-medium text-ink hover:bg-app-soft"
            >
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <Badge>{filteredCount} shown</Badge>
        <Badge>{currentBrandsCount} current</Badge>
        <Badge>{totalBrands} total</Badge>
      </div>
    </div>
  );
}
