"use client";

import { useState } from "react";

import { updateDatabaseFile } from "@/app/actions/workspace";
import { MarkdownFileDropzone } from "@/components/MarkdownFileDropzone";
import { SubmitButton } from "@/components/SubmitButton";
import type { WorkspaceDatabaseFile } from "@/lib/workspace-view";

const initialState = {
  success: false,
  message: "",
};

type DatabaseInfoEditFormProps = {
  file: WorkspaceDatabaseFile;
  brandSlug: string;
};

export function DatabaseInfoEditForm({
  file,
  brandSlug,
}: DatabaseInfoEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [wasSuccessful, setWasSuccessful] = useState(false);
  const [label, setLabel] = useState(file.label);
  const [fileName, setFileName] = useState(file.fileName);
  const [markdownContent, setMarkdownContent] = useState(file.content);

  if (!isEditing) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="inline-flex min-h-11 items-center rounded-full border border-app-line px-3 py-2 text-sm font-medium text-ink hover:bg-app-soft"
        >
          Edit
        </button>
        {wasSuccessful && message ? (
          <p className="order-last basis-full text-sm text-success" aria-live="polite">
            {message}
          </p>
        ) : null}
      </>
    );
  }

  async function handleSubmit(formData: FormData) {
    const result = await updateDatabaseFile(initialState, formData);
    setMessage(result.message);
    setWasSuccessful(result.success);

    if (result.success) {
      setIsEditing(false);
    }
  }

  return (
    <form
      action={handleSubmit}
      className="order-last mt-4 w-full basis-full space-y-4 rounded-2xl border border-app-line bg-app-surface p-4"
    >
      <input type="hidden" name="databaseFileId" value={file.id} />
      <input type="hidden" name="brandSlug" value={brandSlug} />

      <MarkdownFileDropzone
        fileName={fileName}
        onFileLoaded={({ fileName: nextFileName, content, suggestedLabel }) => {
          setFileName(nextFileName);
          setMarkdownContent(content);
          setLabel((current) => current || suggestedLabel);
        }}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Label</span>
          <input
            name="label"
            required
            value={label}
            onChange={(event) => setLabel(event.currentTarget.value)}
            className="app-input"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">File name</span>
          <input
            name="fileName"
            value={fileName}
            onChange={(event) => setFileName(event.currentTarget.value)}
            className="app-input"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Markdown content</span>
        <textarea
          name="markdownContent"
          required
          rows={12}
          value={markdownContent}
          onChange={(event) => setMarkdownContent(event.currentTarget.value)}
          className="app-input min-h-56 resize-y font-mono text-sm"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            setLabel(file.label);
            setFileName(file.fileName);
            setMarkdownContent(file.content);
            setIsEditing(false);
          }}
          className="inline-flex min-h-11 items-center rounded-full border border-app-line px-3 py-2 text-sm font-medium text-ink hover:bg-app-soft"
        >
          Cancel
        </button>
        <SubmitButton idleLabel="Save database info" pendingLabel="Saving..." />
      </div>

      {message && !wasSuccessful ? (
        <p className="text-sm text-danger" aria-live="polite">
          {message}
        </p>
      ) : null}
    </form>
  );
}
