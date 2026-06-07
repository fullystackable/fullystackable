import type { Contact } from "@/data/mockData";

type ContactListProps = {
  contacts: Contact[];
};

export function ContactList({ contacts }: ContactListProps) {
  return (
    <div className="space-y-3">
      {contacts.map((contact) => (
        <article
          key={contact.id}
          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-950">{contact.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{contact.role}</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
              {contact.channel}
            </span>
          </div>
          <a
            href={`mailto:${contact.email}`}
            className="mt-3 inline-flex text-sm font-medium text-blue-700 hover:text-blue-900"
          >
            {contact.email}
          </a>
        </article>
      ))}
    </div>
  );
}
