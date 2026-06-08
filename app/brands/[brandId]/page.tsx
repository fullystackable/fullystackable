import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { deleteBrand } from "@/app/actions/workspace";
import { BrandWorkspace } from "@/components/BrandWorkspace";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Badge } from "@/components/ui";
import { getBrandWorkspaceBySlug } from "@/lib/brand-workspaces";
import { brandStatusTones } from "@/lib/design";

type BrandPageProps = {
  params: Promise<{ brandId: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: BrandPageProps): Promise<Metadata> {
  const { brandId } = await params;
  const brand = await getBrandWorkspaceBySlug(brandId);

  if (!brand) {
    return {
      title: "Brand not found | Fullystackable",
    };
  }

  return {
    title: `${brand.name} | Fullystackable`,
    description: brand.description,
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { brandId } = await params;
  const brand = await getBrandWorkspaceBySlug(brandId);

  if (!brand) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col">
      <DashboardHeader
        eyebrow="Workspace"
        title={brand.name}
        subtitle={brand.description}
        meta={<Badge tone={brandStatusTones[brand.status]}>{brand.status}</Badge>}
        action={
          <div className="flex flex-wrap gap-3">
            {brand.website ? (
              <a
                href={brand.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full bg-app-sidebar px-4 py-2 text-sm font-medium text-white hover:bg-app-sidebar-muted"
              >
                Visit website
              </a>
            ) : null}
            <form action={deleteBrand}>
              <input type="hidden" name="brandId" value={brand.id} />
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Delete brand
              </button>
            </form>
          </div>
        }
      />
      <BrandWorkspace brand={brand} />
    </div>
  );
}
