import type { WorkspaceQuickLink } from "@/lib/workspace-view";

import { EmptyState } from "@/components/ui";

type QuickLinksListProps = {
  links: WorkspaceQuickLink[];
  emptyTitle?: string;
  emptyDescription?: string;
  compact?: boolean;
};

export function QuickLinksList({
  links,
  emptyTitle = "No quick links yet",
  emptyDescription = "Flag your most-opened URLs as quick links so brand access stays one click away.",
  compact = false,
}: QuickLinksListProps) {
  if (links.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="block rounded-2xl border border-app-line bg-app-surface px-4 py-3 hover:border-app-line-strong hover:bg-app-surface-muted"
        >
          <p className="text-sm font-semibold text-ink">{link.title}</p>
          <p className="mt-1 text-sm text-ink-muted">
            {link.relatedCampaignTitle
              ? `Campaign: ${link.relatedCampaignTitle}`
              : link.type}
          </p>
        </a>
      ))}
    </div>
  );
}
