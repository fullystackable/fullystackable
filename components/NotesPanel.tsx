import type { ReactNode } from "react";
import Link from "next/link";

import { deleteNote, toggleNotePinned } from "@/app/actions/workspace";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { NoteEditForm } from "@/components/NoteEditForm";
import { Badge, Card, EmptyState, SectionHeader } from "@/components/ui";
import { formatShortDate } from "@/lib/date";
import { brandStatusTones } from "@/lib/design";
import type { WorkspaceNote } from "@/lib/workspace-view";

type NoteItem = {
  id: string;
  title?: string | null;
  text: string;
  createdAt: string;
  category?: string;
  categoryValue?: WorkspaceNote["categoryValue"];
  pinned?: boolean;
  brandId?: string;
  brandSlug?: string;
  brandName?: string;
  brandStatus?: keyof typeof brandStatusTones;
};

type NotesPanelProps = {
  id?: string;
  title: string;
  description: string;
  notes: NoteItem[];
  showBrandLink?: boolean;
  brandSlug?: string;
  allowDelete?: boolean;
  beforeList?: ReactNode;
};

export function NotesPanel({
  id,
  title,
  description,
  notes,
  showBrandLink = false,
  brandSlug,
  allowDelete = false,
  beforeList,
}: NotesPanelProps) {
  const pinnedNotes = notes.filter((note) => note.pinned);
  const recentNotes = notes.filter((note) => !note.pinned);

  return (
    <Card id={id}>
      <SectionHeader eyebrow="Notes" title={title} description={description} />
      <div className="mt-5">
        {beforeList ? <div className="mb-6">{beforeList}</div> : null}
        {notes.length > 0 ? (
          <div className="space-y-6">
            {pinnedNotes.length > 0 ? (
              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">Pinned notes</p>
                    <p className="mt-1 text-sm text-ink-muted">
                      The context you want to keep closest to the work.
                    </p>
                  </div>
                  <Badge tone="accent">{pinnedNotes.length}</Badge>
                </div>
                <div className="data-list">
                  {pinnedNotes.map((note) => (
                    <NoteRow
                      key={note.id}
                      note={note}
                      showBrandLink={showBrandLink}
                      brandSlug={brandSlug}
                      allowDelete={allowDelete}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {recentNotes.length > 0 ? (
              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">Recent notes</p>
                    <p className="mt-1 text-sm text-ink-muted">
                      The latest reminders, context, and working decisions.
                    </p>
                  </div>
                  <Badge>{recentNotes.length}</Badge>
                </div>
                <div className="data-list">
                  {recentNotes.map((note) => (
                    <NoteRow
                      key={note.id}
                      note={note}
                      showBrandLink={showBrandLink}
                      brandSlug={brandSlug}
                      allowDelete={allowDelete}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <EmptyState
            title="No notes yet"
            description="Add quick operating notes here to keep the latest brand context visible."
          />
        )}
      </div>
    </Card>
  );
}

function NoteRow({
  note,
  showBrandLink,
  brandSlug,
  allowDelete,
}: {
  note: NoteItem;
  showBrandLink: boolean;
  brandSlug?: string;
  allowDelete: boolean;
}) {
  return (
    <article className="data-row">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {showBrandLink && note.brandId && note.brandName ? (
          <Link
            href={`/brands/${note.brandSlug ?? note.brandId}`}
            className="text-sm font-semibold text-ink hover:text-accent"
          >
            {note.brandName}
          </Link>
        ) : (
          <p className="text-sm font-semibold text-ink">
            {note.title ?? "Working note"}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {note.pinned ? <Badge tone="accent">Pinned</Badge> : null}
          {note.category ? <Badge>{note.category}</Badge> : null}
          {showBrandLink && note.brandStatus ? (
            <Badge tone={brandStatusTones[note.brandStatus]}>{note.brandStatus}</Badge>
          ) : null}
          <Badge>{formatShortDate(note.createdAt)}</Badge>
        </div>
      </div>
      {allowDelete && brandSlug ? (
        <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
          <form action={toggleNotePinned}>
            <input type="hidden" name="noteId" value={note.id} />
            <input type="hidden" name="brandSlug" value={brandSlug} />
            <input type="hidden" name="isPinned" value={note.pinned ? "true" : "false"} />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center rounded-full border border-app-line px-3 py-2 text-sm font-medium text-ink hover:bg-app-soft"
            >
              {note.pinned ? "Unpin" : "Pin"}
            </button>
          </form>
          <NoteEditForm
            note={{
              id: note.id,
              title: note.title ?? null,
              text: note.text,
              createdAt: note.createdAt,
              category: note.category ?? "Random",
              categoryValue: note.categoryValue,
              pinned: note.pinned ?? false,
            }}
            brandSlug={brandSlug}
          />
          <form action={deleteNote}>
            <input type="hidden" name="noteId" value={note.id} />
            <input type="hidden" name="brandSlug" value={brandSlug} />
            <ConfirmSubmitButton
              idleLabel="Remove"
              confirmLabel="Remove note"
              confirmPrompt="Remove this note?"
            />
          </form>
        </div>
      ) : null}
      {note.title ? (
        <p className="mt-3 text-sm font-semibold text-ink">{note.title}</p>
      ) : null}
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink-muted">
        {note.text}
      </p>
    </article>
  );
}
