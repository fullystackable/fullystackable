import { deletePrompt } from "@/app/actions/workspace";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { PromptEditForm } from "@/components/PromptEditForm";
import { Badge, EmptyState } from "@/components/ui";
import { formatShortDate } from "@/lib/date";
import type { WorkspacePrompt } from "@/lib/workspace-view";

type PromptListProps = {
  prompts: WorkspacePrompt[];
  brandSlug?: string;
  allowDelete?: boolean;
};

export function PromptList({
  prompts,
  brandSlug,
  allowDelete = false,
}: PromptListProps) {
  if (prompts.length === 0) {
    return (
      <EmptyState
        title="No prompts saved"
        description="Add labeled prompts here so your repeat AI workflows stay close to the brand."
      />
    );
  }

  return (
    <div className="data-list">
      {prompts.map((prompt) => (
        <article key={prompt.id} className="data-row">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-ink">{prompt.label}</h3>
              <p className="mt-1 text-sm text-ink-muted">
                Updated {formatShortDate(prompt.updatedAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>Prompt</Badge>
            </div>
          </div>
          {allowDelete && brandSlug ? (
            <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
              <PromptEditForm prompt={prompt} brandSlug={brandSlug} />
              <form action={deletePrompt}>
                <input type="hidden" name="promptId" value={prompt.id} />
                <input type="hidden" name="brandSlug" value={brandSlug} />
                <ConfirmSubmitButton
                  idleLabel="Remove"
                  confirmLabel="Remove prompt"
                  confirmPrompt="Remove this prompt?"
                />
              </form>
            </div>
          ) : null}
          <div className="mt-3 max-h-80 overflow-auto rounded-2xl border border-app-line bg-app-soft/80 px-4 py-3">
            <p className="whitespace-pre-wrap text-sm leading-6 text-ink-muted">
              {prompt.prompt}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
