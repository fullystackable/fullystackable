import { BrandCreateForm } from "@/components/BrandCreateForm";
import { BrandCard } from "@/components/BrandCard";
import { BrandDirectoryFilters } from "@/components/BrandDirectoryFilters";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Badge, Card, EmptyState, SectionHeader } from "@/components/ui";
import { getBrandDirectoryPageData } from "@/lib/brand-workspaces";

export const dynamic = "force-dynamic";

type BrandsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

export default async function BrandsPage({ searchParams }: BrandsPageProps) {
  const resolvedSearchParams = await searchParams;
  const {
    brands,
    statusSummary,
    totalBrands,
    currentBrandsCount,
    filteredCount,
    activeFilters,
    hasFilters,
  } = await getBrandDirectoryPageData({
    query: resolvedSearchParams.q,
    status: resolvedSearchParams.status,
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col">
      <DashboardHeader
        eyebrow="Portfolio"
        title="All brands"
        subtitle="Browse every active account, quickly spot risk, and jump straight into the workspace that needs attention."
        meta={<Badge>{currentBrandsCount} current brands in portfolio</Badge>}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {statusSummary.map((item) => (
          <Card key={item.label} className="h-full">
            <p className="text-sm font-medium text-ink-muted">{item.label}</p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {item.count}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-muted">{item.helper}</p>
          </Card>
        ))}
      </section>

      <Card className="mt-6">
        <SectionHeader
          eyebrow="Create"
          title="Add a brand workspace"
          description="Start a new brand with a clean command center, then fill in tasks, assets, contacts, and notes over time."
        />
        <div className="mt-6">
          <BrandCreateForm />
        </div>
      </Card>

      <Card id="directory" className="mt-6">
        <SectionHeader
          title="Workspace directory"
          description="Each brand includes active tasks, creative assets, contacts, upcoming work, and notes so the whole operating picture stays visible."
          action={<Badge>{filteredCount} shown</Badge>}
        />

        <BrandDirectoryFilters
          query={activeFilters.query}
          status={activeFilters.status}
          filteredCount={filteredCount}
          totalBrands={totalBrands}
          currentBrandsCount={currentBrandsCount}
          hasFilters={hasFilters}
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {brands.length > 0 ? (
            brands.map((brand) => <BrandCard key={brand.id} brand={brand} />)
          ) : totalBrands > 0 ? (
            <EmptyState
              title="No brands match these filters"
              description="Try a broader search, switch the status filter, or clear the current filters."
              className="lg:col-span-2"
            />
          ) : (
            <EmptyState
              title="No brand workspaces yet"
              description="Once brands are added to Supabase, they will appear here as live workspaces."
              className="lg:col-span-2"
            />
          )}
        </div>
      </Card>
    </div>
  );
}
