import Link from "next/link";

import { BrandColorBadge } from "@/components/BrandColorBadge";
import { BrandQuickActions } from "@/components/BrandQuickActions";
import { Badge, Card } from "@/components/ui";
import { brandStatusTones } from "@/lib/design";
import type { BrandDirectoryItem } from "@/lib/workspace-view";

type BrandCardProps = {
  brand: BrandDirectoryItem;
};

export function BrandCard({ brand }: BrandCardProps) {
  return (
    <Card className="transition hover:-translate-y-0.5 hover:shadow-app-soft">
      <div
        role="group"
        aria-label={`Brand card for ${brand.name}`}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
              Brand
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
              {brand.name}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <BrandColorBadge color={brand.brandColor} label="Planner color" />
            <Badge tone={brandStatusTones[brand.status]}>{brand.status}</Badge>
          </div>
        </div>

        <p className="text-sm leading-6 text-ink-muted">{brand.description}</p>
        {brand.searchMatchReason ? (
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">
            {brand.searchMatchReason}
          </p>
        ) : null}

        <dl className="grid grid-cols-2 gap-3 border-t border-app-line pt-4 sm:grid-cols-3">
          <div className="metric-tile border-t-0 pt-0">
            <dt className="text-xs uppercase tracking-[0.16em] text-ink-muted">
              Tasks
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-ink">
              {brand.tasksCount}
            </dd>
          </div>
          <div className="metric-tile border-t-0 pt-0">
            <dt className="text-xs uppercase tracking-[0.16em] text-ink-muted">
              Assets
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-ink">
              {brand.assetsCount}
            </dd>
          </div>
          <div className="metric-tile col-span-2 border-t-0 pt-0 sm:col-span-1">
            <dt className="text-xs uppercase tracking-[0.16em] text-ink-muted">
              Urgent
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-ink">
              {brand.urgentTasks}
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          {brand.website ? (
            <a
              href={brand.website}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 break-all text-sm font-medium text-ink-muted hover:text-ink"
            >
              {brand.website.replace(/^https?:\/\//, "")}
            </a>
          ) : (
            <p className="text-sm text-ink-muted">No website added</p>
          )}
          <Link
            href={`/brands/${brand.slug}`}
            className="inline-flex w-full items-center justify-center rounded-full bg-app-sidebar px-4 py-2 text-sm font-medium text-white hover:bg-app-sidebar-muted sm:w-auto"
          >
            Open workspace
          </Link>
        </div>

        <BrandQuickActions
          brand={{
            id: brand.id,
            slug: brand.slug,
            name: brand.name,
            campaigns: brand.campaigns,
          }}
        />
      </div>
    </Card>
  );
}
