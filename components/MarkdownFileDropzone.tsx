"use client";

import { useRef, useState } from "react";

function toSuggestedLabel(fileName: string) {
  return fileName
    .replace(/\.(md|markdown)$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function isMarkdownLikeFile(file: File) {
  return (
    /\.md$/i.test(file.name) ||
    /\.markdown$/i.test(file.name) ||
    file.type === "text/markdown" ||
    file.type === "text/plain"
  );
}

type MarkdownFileDropzoneProps = {
  fileName: string;
  onFileLoaded: (input: {
    fileName: string;
    content: string;
    suggestedLabel: string;
  }) => void;
};

export function MarkdownFileDropzone({
  fileName,
  onFileLoaded,
}: MarkdownFileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState("");

  async function handleFiles(fileList: FileList | null) {
    const file = fileList?.[0];

    if (!file) {
      return;
    }

    if (!isMarkdownLikeFile(file)) {
      setMessage("Choose a .md file or a plain-text markdown source.");
      return;
    }

    const content = await file.text();
    setMessage(`Loaded ${file.name}`);
    onFileLoaded({
      fileName: file.name,
      content,
      suggestedLabel: toSuggestedLabel(file.name),
    });
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept=".md,.markdown,text/markdown,text/plain"
        className="hidden"
        onChange={(event) => {
          void handleFiles(event.currentTarget.files);
          event.currentTarget.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={() => setIsDragging(true)}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={`flex min-h-28 w-full flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-5 text-center ${
          isDragging
            ? "border-accent bg-accent-soft/60 text-ink"
            : "border-app-line bg-app-soft/80 text-ink-muted hover:bg-app-soft"
        }`}
      >
        <span className="text-sm font-semibold text-ink">
          Drop a markdown file here
        </span>
        <span className="mt-2 text-sm leading-6">
          or choose a `.md` file to load its contents into this workspace entry
        </span>
        <span className="mt-3 app-secondary-button">Choose markdown file</span>
      </button>
      <div className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
        <span>{fileName ? `Current file: ${fileName}` : "No file loaded yet"}</span>
        {message ? <span className="text-success">{message}</span> : null}
      </div>
    </div>
  );
}
