import { BrandCard } from "@/components/BrandCard";
import { DashboardHeader } from "@/components/DashboardHeader";
import { getBrands, getStatusSummary } from "@/lib/brands";

export default function BrandsPage() {
  const brands = getBrands();
  const statusSummary = getStatusSummary();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <DashboardHeader
        active="brands"
        eyebrow="Portfolio"
        title="All brands"
        subtitle="Browse every active account, quickly spot risk, and jump straight into the workspace that needs attention."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {statusSummary.map((item) => (
          <article
            key={item.label}
            className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)]"
          >
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              {item.count}
            </p>
            <p className="mt-2 text-sm text-slate-600">{item.helper}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Workspace directory
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Every brand includes active tasks, creative assets, contacts, upcoming work, and notes so the whole operating picture stays visible.
            </p>
          </div>
          <p className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            {brands.length} brands in portfolio
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      </section>
    </main>
  );
}
