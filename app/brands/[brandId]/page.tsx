import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BrandWorkspace } from "@/components/BrandWorkspace";
import { DashboardHeader } from "@/components/DashboardHeader";
import { getBrandById, getBrands } from "@/lib/brands";

type BrandPageProps = {
  params: Promise<{ brandId: string }>;
};

export async function generateStaticParams() {
  return getBrands().map((brand) => ({ brandId: brand.id }));
}

export async function generateMetadata({
  params,
}: BrandPageProps): Promise<Metadata> {
  const { brandId } = await params;
  const brand = getBrandById(brandId);

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
  const brand = getBrandById(brandId);

  if (!brand) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <DashboardHeader
        active="brands"
        eyebrow="Workspace"
        title={brand.name}
        subtitle={brand.description}
      />
      <BrandWorkspace brand={brand} />
    </main>
  );
}
