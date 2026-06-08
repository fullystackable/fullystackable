import Link from "next/link";

import { Badge, Card } from "@/components/ui";
import { brandStatusTones } from "@/lib/design";
import type { BrandDirectoryItem } from "@/lib/workspace-view";

type BrandCardProps = {
  brand: BrandDirectoryItem;
};

export function BrandCard({ brand }: BrandCardProps) {
  return (
    <Card className="transition hover:-translate-y-0.5 hover:shadow-app-soft">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
              Brand
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              {brand.name}
            </h2>
          </div>
          <Badge tone={brandStatusTones[brand.status]}>{brand.status}</Badge>
        </div>

        <p className="text-sm leading-6 text-ink-muted">{brand.description}</p>

        <dl className="grid grid-cols-3 gap-3 border-t border-app-line pt-4">
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
          <div className="metric-tile border-t-0 pt-0">
            <dt className="text-xs uppercase tracking-[0.16em] text-ink-muted">
              Urgent
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-ink">
              {brand.urgentTasks}
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {brand.website ? (
            <a
              href={brand.website}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-ink-muted hover:text-ink"
            >
              {brand.website.replace(/^https?:\/\//, "")}
            </a>
          ) : (
            <p className="text-sm text-ink-muted">No website added</p>
          )}
          <Link
            href={`/brands/${brand.slug}`}
            className="inline-flex items-center rounded-full bg-app-sidebar px-4 py-2 text-sm font-medium text-white hover:bg-app-sidebar-muted"
          >
            Open workspace
          </Link>
        </div>
      </div>
    </Card>
  );
}
