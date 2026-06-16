import type { BrandReadiness } from "@/lib/brand-readiness";

import { Badge } from "@/components/ui";

type BrandReadinessSummaryProps = {
  readiness: BrandReadiness;
  compact?: boolean;
};

export function BrandReadinessSummary({
  readiness,
  compact = false,
}: BrandReadinessSummaryProps) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={readiness.isReady ? "success" : "warning"}>
          {readiness.completedCount}/{readiness.totalCount} ready
        </Badge>
        {readiness.isReady ? (
          <p className="text-sm text-ink-muted">This workspace has the core daily-use setup.</p>
        ) : null}
      </div>
      {!readiness.isReady ? (
        <p className="text-sm leading-6 text-ink-muted">
          Missing: {readiness.missingLabels.join(", ")}.
        </p>
      ) : null}
    </div>
  );
}
