"use client";

import { useActionState, useEffect, useRef } from "react";

import { createContact } from "@/app/actions/workspace";

import { SubmitButton } from "@/components/SubmitButton";

const initialState = {
  success: false,
  message: "",
};

type ContactCreateFormProps = {
  brandId: string;
  brandSlug: string;
};

export function ContactCreateForm({
  brandId,
  brandSlug,
}: ContactCreateFormProps) {
  const [state, formAction] = useActionState(createContact, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="brandId" value={brandId} />
      <input type="hidden" name="brandSlug" value={brandSlug} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Name</span>
          <input name="name" required className="app-input" placeholder="Avery Stone" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Contact type</span>
          <select name="contactType" defaultValue="other" className="app-input">
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
          <input name="role" className="app-input" placeholder="Founder" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Company</span>
          <input name="company" className="app-input" placeholder="Fun Slides" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Email</span>
          <input
            name="email"
            type="email"
            className="app-input"
            placeholder="avery@example.com"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Phone</span>
          <input name="phone" className="app-input" placeholder="555-0142" />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Notes</span>
        <textarea
          name="notes"
          rows={3}
          className="app-input min-h-24 resize-y"
          placeholder="Optional relationship context, responsibilities, or follow-up notes."
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          Add the people and partners you need to reach quickly during execution.
        </p>
        <SubmitButton idleLabel="Add contact" pendingLabel="Adding..." />
      </div>

      {state.message ? (
        <p
          className={`text-sm ${state.success ? "text-success" : "text-danger"}`}
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
