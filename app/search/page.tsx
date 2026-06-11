import Link from "next/link";

import { DashboardHeader } from "@/components/DashboardHeader";
import { GlobalSearchForm } from "@/components/GlobalSearchForm";
import { Badge, Card, EmptyState, SectionHeader } from "@/components/ui";
import {
  getUniversalSearchData,
  type SearchResultType,
  type UniversalSearchResult,
} from "@/lib/universal-search";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

const sectionToneLabels: Record<SearchResultType, string> = {
  brands: "Brands",
  tasks: "Tasks",
  assets: "Assets",
  contacts: "Contacts",
  notes: "Notes",
  campaigns: "Campaigns",
  upcoming: "Upcoming",
  links: "Links",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const data = await getUniversalSearchData(resolvedSearchParams.q);
  const hasQuery = data.query.trim().length > 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col">
      <DashboardHeader
        eyebrow="Search"
        title="Universal search"
        subtitle="Search every brand workspace from one place, including records, notes, campaigns, upcoming items, and external links."
        size="compact"
        meta={
          hasQuery ? (
            <>
              <Badge>{data.totalResults} results</Badge>
              {data.sections.map((section) => (
                <Badge key={section.type}>
                  {section.title}: {section.results.length}
                </Badge>
              ))}
            </>
          ) : (
            <Badge>Search across everything</Badge>
          )
        }
      />

      <Card>
        <SectionHeader
          title="Search the workspace"
          description="Find brands, tasks, assets, contacts, notes, campaigns, upcoming items, and links from one command center."
          compact
        />
        <div className="mt-5">
          <GlobalSearchForm />
        </div>
      </Card>

      {!hasQuery ? (
        <Card className="mt-5">
          <SectionHeader
            title="Search scope"
            description="Use one query to search every major workspace entity and every saved external link."
            compact
          />
          <div className="mt-5 flex flex-wrap gap-2">
            {Object.values(sectionToneLabels).map((label) => (
              <Badge key={label}>{label}</Badge>
            ))}
          </div>
        </Card>
      ) : data.totalResults === 0 ? (
        <Card className="mt-5">
          <EmptyState
            title="No matches found"
            description="Try a broader keyword, search by brand name, or search by URL, campaign title, note text, or contact details."
          />
        </Card>
      ) : (
        <div className="mt-5 grid gap-5">
          {data.sections.map((section) => (
            <Card key={section.type}>
              <SectionHeader
                title={section.title}
                description={`Showing ${section.results.length} ${
                  section.results.length === 1 ? "match" : "matches"
                } for "${data.query}".`}
                action={<Badge>{section.results.length}</Badge>}
                compact
              />
              <div className="mt-5 data-list">
                {section.results.map((result) => (
                  <SearchResultRow key={result.id} result={result} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchResultRow({ result }: { result: UniversalSearchResult }) {
  const title = result.externalHref ? (
    <a
      href={result.externalHref}
      target="_blank"
      rel="noreferrer"
      className="text-base font-semibold text-ink hover:text-accent"
    >
      {result.title}
    </a>
  ) : (
    <Link href={result.href} className="text-base font-semibold text-ink hover:text-accent">
      {result.title}
    </Link>
  );

  return (
    <article className="data-row">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {title}
          <p className="mt-2 text-sm text-ink-muted">{result.meta}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{result.badge}</Badge>
          {!result.externalHref ? (
            <Link
              href={result.href}
              className="inline-flex items-center rounded-full border border-app-line px-3 py-1 text-xs font-semibold text-ink-muted hover:bg-app-soft hover:text-ink"
            >
              Open
            </Link>
          ) : null}
          {result.workspaceHref ? (
            <Link
              href={result.workspaceHref}
              className="inline-flex items-center rounded-full border border-app-line px-3 py-1 text-xs font-semibold text-ink-muted hover:bg-app-soft hover:text-ink"
            >
              Open workspace
            </Link>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-ink-muted">{result.description}</p>
    </article>
  );
}
