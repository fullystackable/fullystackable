import type { ReactNode } from "react";
import Link from "next/link";

import { deleteNote } from "@/app/actions/workspace";
import { NoteEditForm } from "@/components/NoteEditForm";
import { Badge, Card, EmptyState, SectionHeader } from "@/components/ui";
import { formatShortDate } from "@/lib/date";
import { brandStatusTones } from "@/lib/design";

type NoteItem = {
  id: string;
  title?: string | null;
  text: string;
  createdAt: string;
  category?: string;
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
  return (
    <Card id={id}>
      <SectionHeader eyebrow="Notes" title={title} description={description} />
      <div className="mt-5">
        {beforeList ? <div className="mb-6">{beforeList}</div> : null}
        {notes.length > 0 ? (
          <div className="data-list">
            {notes.map((note) => (
              <article key={note.id} className="data-row">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {showBrandLink && note.brandId && note.brandName ? (
                    <Link
                      href={`/brands/${note.brandSlug ?? note.brandId}`}
                      className="text-sm font-semibold text-ink hover:text-accent"
                    >
                      {note.brandName}
                    </Link>
                  ) : (
                    <p className="text-sm font-semibold text-ink">Working note</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {showBrandLink && note.brandStatus ? (
                      <Badge tone={brandStatusTones[note.brandStatus]}>
                        {note.brandStatus}
                      </Badge>
                    ) : null}
                    <Badge>{formatShortDate(note.createdAt)}</Badge>
                    {allowDelete && brandSlug ? (
                      <>
                        <NoteEditForm
                          note={{
                            id: note.id,
                            title: note.title ?? null,
                            text: note.text,
                            createdAt: note.createdAt,
                            category: note.category ?? "Random",
                            pinned: note.pinned ?? false,
                          }}
                          brandSlug={brandSlug}
                        />
                        <form action={deleteNote}>
                          <input type="hidden" name="noteId" value={note.id} />
                          <input type="hidden" name="brandSlug" value={brandSlug} />
                          <button
                            type="submit"
                            className="text-sm font-medium text-danger hover:opacity-80"
                          >
                            Remove
                          </button>
                        </form>
                      </>
                    ) : null}
                  </div>
                </div>
                {note.title ? (
                  <p className="mt-3 text-sm font-semibold text-ink">{note.title}</p>
                ) : null}
                <p className="mt-3 text-sm leading-6 text-ink-muted">{note.text}</p>
              </article>
            ))}
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
