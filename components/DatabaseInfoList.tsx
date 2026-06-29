import { deleteDatabaseFile } from "@/app/actions/workspace";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { DatabaseInfoEditForm } from "@/components/DatabaseInfoEditForm";
import { Badge, EmptyState } from "@/components/ui";
import { formatShortDate } from "@/lib/date";
import type { WorkspaceDatabaseFile } from "@/lib/workspace-view";

function buildPreview(content: string, maxLines = 8) {
  const lines = content.split(/\r?\n/);
  const preview = lines.slice(0, maxLines).join("\n");
  return lines.length > maxLines ? `${preview}\n...` : preview;
}

type DatabaseInfoListProps = {
  files: WorkspaceDatabaseFile[];
  brandSlug?: string;
  allowDelete?: boolean;
};

export function DatabaseInfoList({
  files,
  brandSlug,
  allowDelete = false,
}: DatabaseInfoListProps) {
  if (files.length === 0) {
    return (
      <EmptyState
        title="No database info saved"
        description="Add markdown files here to keep your recurring AI source material inside the brand workspace."
      />
    );
  }

  return (
    <div className="data-list">
      {files.map((file) => (
        <article key={file.id} className="data-row">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-ink">{file.label}</h3>
              <p className="mt-1 text-sm text-ink-muted">
                Updated {formatShortDate(file.updatedAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>{file.fileName}</Badge>
              <Badge>Markdown</Badge>
            </div>
          </div>
          {allowDelete && brandSlug ? (
            <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
              <DatabaseInfoEditForm file={file} brandSlug={brandSlug} />
              <form action={deleteDatabaseFile}>
                <input type="hidden" name="databaseFileId" value={file.id} />
                <input type="hidden" name="brandSlug" value={brandSlug} />
                <ConfirmSubmitButton
                  idleLabel="Remove"
                  confirmLabel="Remove entry"
                  confirmPrompt="Remove this database info entry?"
                />
              </form>
            </div>
          ) : null}
          <details className="mt-3 rounded-2xl border border-app-line bg-app-soft/70">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
              Preview markdown
            </summary>
            <div className="border-t border-app-line px-4 py-3">
              <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-6 text-ink-muted">
                {buildPreview(file.content)}
              </pre>
            </div>
          </details>
        </article>
      ))}
    </div>
  );
}
