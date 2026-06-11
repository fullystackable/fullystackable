"use client";

import { useState } from "react";

import { updateContact } from "@/app/actions/workspace";
import { SubmitButton } from "@/components/SubmitButton";
import type { WorkspaceContact } from "@/lib/workspace-view";

const initialState = {
  success: false,
  message: "",
};

type ContactEditFormProps = {
  contact: WorkspaceContact;
  brandSlug: string;
};

export function ContactEditForm({ contact, brandSlug }: ContactEditFormProps) {
  const [isEditing, setIsEditing] = useState(true);
  const [message, setMessage] = useState("");
  const [wasSuccessful, setWasSuccessful] = useState(false);

  if (!isEditing) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-sm font-medium text-ink-muted hover:text-ink"
        >
          Edit
        </button>
        {wasSuccessful && message ? (
          <p
            className="order-last basis-full text-sm text-success"
            aria-live="polite"
          >
            {message}
          </p>
        ) : null}
      </>
    );
  }

  async function handleSubmit(formData: FormData) {
    const result = await updateContact(initialState, formData);
    setMessage(result.message);
    setWasSuccessful(result.success);

    if (result.success) {
      setIsEditing(false);
    }
  }

  return (
    <form
      action={handleSubmit}
      className="order-last mt-4 w-full basis-full space-y-4 rounded-2xl border border-app-line bg-white/90 p-4"
    >
      <input type="hidden" name="contactId" value={contact.id} />
      <input type="hidden" name="brandSlug" value={brandSlug} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Name</span>
          <input
            name="name"
            required
            defaultValue={contact.name}
            className="app-input"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Contact type</span>
          <select
            name="contactType"
            defaultValue={contact.contactTypeValue}
            className="app-input"
          >
            <option value="owner">Owner</option>
            <option value="vendor">Vendor</option>
            <option value="staff">Staff</option>
            <option value="ad_rep">Ad rep</option>
            <option value="designer">Designer</option>
            <option value="photographer">Photographer</option>
            <option value="web">Web</option>
            <option value="agency">Agency</option>
            <option value="other">Other</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Role</span>
          <input
            name="role"
            defaultValue={contact.role ?? ""}
            className="app-input"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Company</span>
          <input
            name="company"
            defaultValue={contact.company ?? ""}
            className="app-input"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Email</span>
          <input
            name="email"
            type="email"
            defaultValue={contact.email ?? ""}
            className="app-input"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Phone</span>
          <input
            name="phone"
            defaultValue={contact.phone ?? ""}
            className="app-input"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Notes</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={contact.notes ?? ""}
          className="app-input min-h-24 resize-y"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="text-sm font-medium text-ink-muted hover:text-ink"
        >
          Cancel
        </button>
        <SubmitButton idleLabel="Save contact" pendingLabel="Saving..." />
      </div>

      {message && !wasSuccessful ? (
        <p
          className="text-sm text-danger"
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
