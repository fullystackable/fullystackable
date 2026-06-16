"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type GlobalSearchFormProps = {
  compact?: boolean;
};

export function GlobalSearchForm({ compact = false }: GlobalSearchFormProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = pathname === "/search" ? (searchParams.get("q") ?? "") : "";
  const hasQuery = currentQuery.trim().length > 0;
  const placeholder = compact
    ? "Search brands, tasks, assets, contacts, notes, campaigns, upcoming, or links"
    : "Search brands, tasks, assets, contacts, notes, campaigns, upcoming, links";

  return (
    <form action="/search" className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
      <label className="sr-only" htmlFor="global-search-input">
        Universal search
      </label>
      <input
        id="global-search-input"
        name="q"
        defaultValue={currentQuery}
        className={`app-input ${
          compact ? "h-11 min-w-0 text-sm" : "h-11 min-w-0 text-sm"
        }`}
        placeholder={placeholder}
      />
      <button
        type="submit"
        className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-full bg-app-sidebar px-4 text-sm font-medium text-white hover:bg-app-sidebar-muted sm:w-auto"
      >
        Search
      </button>
      {pathname === "/search" && hasQuery ? (
        <Link
          href="/search"
          className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-full border border-app-line px-4 text-sm font-medium text-ink hover:bg-app-soft sm:w-auto"
        >
          Clear
        </Link>
      ) : null}
    </form>
  );
}
