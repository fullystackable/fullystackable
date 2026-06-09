import type { ReactNode } from "react";

import { Card, EmptyState, SectionHeader } from "@/components/ui";
import type { BrandWorkspaceData } from "@/lib/workspace-view";

type BrandProfilePanelProps = {
  brand: BrandWorkspaceData;
};

type ProfileField = {
  label: string;
  value: string | null;
  preserveLines?: boolean;
  render?: (value: string) => ReactNode;
};

export function BrandProfilePanel({ brand }: BrandProfilePanelProps) {
  const fields: ProfileField[] = [
    {
      label: "Brand voice",
      value: brand.brandVoice,
      preserveLines: true,
    },
    {
      label: "Audience notes",
      value: brand.audienceNotes,
      preserveLines: true,
    },
    {
      label: "Common CTAs",
      value: brand.commonCtas,
      preserveLines: true,
    },
    {
      label: "Services / products",
      value: brand.servicesProducts,
      preserveLines: true,
    },
    {
      label: "Pricing notes",
      value: brand.pricingNotes,
      preserveLines: true,
    },
    {
      label: "Positioning notes",
      value: brand.positioningNotes,
      preserveLines: true,
    },
    {
      label: "Do / don't list",
      value: brand.doDontList,
      render: renderLineList,
    },
    {
      label: "Important links",
      value: brand.referenceLinks,
      render: renderReferenceLinks,
    },
    {
      label: "Brand notes",
      value: brand.brandNotes,
      preserveLines: true,
    },
  ];

  const visibleFields = fields.filter((field) => field.value?.trim());

  return (
    <Card>
      <SectionHeader
        eyebrow="Profile"
        title="Brand profile"
        description="Reference details that keep positioning, messaging, offers, and links close to the work."
      />
      <div className="mt-6">
        {visibleFields.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {visibleFields.map((field) => (
              <article
                key={field.label}
                className="rounded-2xl border border-app-line bg-app-soft px-4 py-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                  {field.label}
                </p>
                <div className="mt-3">
                  {renderFieldValue(field)}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No profile details yet"
            description="Add brand voice, audience, pricing, positioning, and reference links in Brand settings to make this workspace more useful."
          />
        )}
      </div>
    </Card>
  );
}

function renderFieldValue(field: ProfileField) {
  const value = field.value?.trim();

  if (!value) {
    return null;
  }

  if (field.render) {
    return field.render(value);
  }

  return (
    <p
      className={`text-sm leading-6 text-ink ${
        field.preserveLines ? "whitespace-pre-wrap" : ""
      }`}
    >
      {value}
    </p>
  );
}

function renderLineList(value: string) {
  const lines = splitLines(value);

  if (lines.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-2 text-sm leading-6 text-ink">
      {lines.map((line) => (
        <li key={line} className="flex gap-2">
          <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function renderReferenceLinks(value: string) {
  const lines = splitLines(value);

  if (lines.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {lines.map((line) => {
        const href = normalizeLink(line);

        if (!href) {
          return (
            <p key={line} className="text-sm leading-6 text-ink">
              {line}
            </p>
          );
        }

        return (
          <a
            key={line}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="block text-sm font-medium leading-6 text-accent hover:text-app-sidebar"
          >
            {line}
          </a>
        );
      })}
    </div>
  );
}

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeLink(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(value)) {
    return `https://${value}`;
  }

  return null;
}
