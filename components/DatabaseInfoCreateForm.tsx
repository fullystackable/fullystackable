"use client";

import { useActionState, useEffect, useState } from "react";

import { createDatabaseFile } from "@/app/actions/workspace";
import { MarkdownFileDropzone } from "@/components/MarkdownFileDropzone";
import { SubmitButton } from "@/components/SubmitButton";

const initialState = {
  success: false,
  message: "",
};

type DatabaseInfoCreateFormProps = {
  brandId: string;
  brandSlug: string;
};

export function DatabaseInfoCreateForm({
  brandId,
  brandSlug,
}: DatabaseInfoCreateFormProps) {
  const [state, formAction] = useActionState(createDatabaseFile, initialState);
  const [label, setLabel] = useState("");
  const [fileName, setFileName] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");

  useEffect(() => {
    if (state.success) {
      setLabel("");
      setFileName("");
      setMarkdownContent("");
    }
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="brandId" value={brandId} />
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
            placeholder="Blog Knowledge Base"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">File name</span>
          <input
            name="fileName"
            value={fileName}
            onChange={(event) => setFileName(event.currentTarget.value)}
            className="app-input"
            placeholder="blog-knowledge-base.md"
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
          placeholder={"# Source notes\n\nPaste markdown here or load a .md file."}
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          Load a `.md` file or paste markdown directly. The contents are stored inside the workspace record.
        </p>
        <SubmitButton idleLabel="Add database info" pendingLabel="Adding..." />
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
