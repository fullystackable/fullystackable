import { deleteContact } from "@/app/actions/workspace";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { ContactEditForm } from "@/components/ContactEditForm";
import { Badge, EmptyState } from "@/components/ui";
import type { WorkspaceContact } from "@/lib/workspace-view";

type ContactListProps = {
  contacts: WorkspaceContact[];
  brandSlug?: string;
  allowDelete?: boolean;
};

export function ContactList({
  contacts,
  brandSlug,
  allowDelete = false,
}: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <EmptyState
        title="No contacts added"
        description="Key client and partner contacts will appear here once the workspace is populated."
      />
    );
  }

  return (
    <div className="data-list">
      {contacts.map((contact) => (
        <article key={contact.id} className="data-row">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-ink">{contact.name}</h3>
              <p className="mt-1 text-sm text-ink-muted">
                {[contact.role, contact.company].filter(Boolean).join(" | ") || "No role added"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>{contact.contactType}</Badge>
            </div>
          </div>
          {allowDelete && brandSlug ? (
            <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
              <ContactEditForm contact={contact} brandSlug={brandSlug} />
              <form action={deleteContact}>
                <input type="hidden" name="contactId" value={contact.id} />
                <input type="hidden" name="brandSlug" value={brandSlug} />
                <ConfirmSubmitButton
                  idleLabel="Remove"
                  confirmLabel="Remove contact"
                  confirmPrompt="Remove this contact?"
                />
              </form>
            </div>
          ) : null}
          {contact.email ? (
            <a
              href={`mailto:${contact.email}`}
              className="mt-3 inline-flex min-w-0 break-all text-sm font-medium text-accent hover:text-app-sidebar"
            >
              {contact.email}
            </a>
          ) : contact.phone ? (
            <a
              href={`tel:${contact.phone}`}
              className="mt-3 inline-flex text-sm font-medium text-accent hover:text-app-sidebar"
            >
              {contact.phone}
            </a>
          ) : (
            <p className="mt-3 text-sm font-medium text-ink-muted">
              No direct contact info added
            </p>
          )}
          {contact.notes ? (
            <p className="mt-3 text-sm leading-6 text-ink-muted">{contact.notes}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
