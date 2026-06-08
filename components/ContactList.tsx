import { deleteContact } from "@/app/actions/workspace";
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
            <div>
              <h3 className="text-base font-semibold text-ink">{contact.name}</h3>
              <p className="mt-1 text-sm text-ink-muted">
                {[contact.role, contact.company].filter(Boolean).join(" | ") || "No role added"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>{contact.contactType}</Badge>
              {allowDelete && brandSlug ? (
                <>
                  <ContactEditForm contact={contact} brandSlug={brandSlug} />
                  <form action={deleteContact}>
                    <input type="hidden" name="contactId" value={contact.id} />
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
          {contact.email ? (
            <a
              href={`mailto:${contact.email}`}
              className="mt-3 inline-flex text-sm font-medium text-accent hover:text-app-sidebar"
            >
              {contact.email}
            </a>
          ) : contact.phone ? (
            <p className="mt-3 text-sm font-medium text-ink-muted">{contact.phone}</p>
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
