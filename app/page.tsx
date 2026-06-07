import Link from "next/link";

import { BrandCard } from "@/components/BrandCard";
import { DashboardHeader } from "@/components/DashboardHeader";
import { UpcomingList } from "@/components/UpcomingList";
import { getBrands, getDashboardStats, getUpcomingAcrossBrands } from "@/lib/brands";

const statCards = [
  {
    label: "Active brands",
    key: "activeBrands",
    helper: "All programs in one operating view",
  },
  {
    label: "Open tasks",
    key: "openTasks",
    helper: "Prioritized work across active teams",
  },
  {
    label: "Upcoming deadlines",
    key: "upcomingItems",
    helper: "Launches, meetings, and approvals ahead",
  },
] as const;

export default function Home() {
  const brands = getBrands();
  const stats = getDashboardStats();
  const upcoming = getUpcomingAcrossBrands().slice(0, 6);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <DashboardHeader
        active="dashboard"
        eyebrow="Operations"
        title="Brand command center"
        subtitle="Track campaigns, creative, contacts, and launches across every client from one clean operating dashboard."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {statCards.map((card) => (
          <article
            key={card.key}
            className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur"
          >
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              {stats[card.key]}
            </p>
            <p className="mt-2 text-sm text-slate-600">{card.helper}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-700">
                Portfolio
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Brand overview
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Each workspace centralizes strategy, production, and people so marketers can move from review to action without context switching.
              </p>
            </div>
            <Link
              href="/brands"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            >
              View all brands
            </Link>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {brands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </div>

        <aside className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-200 pb-5">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-700">
              This week
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Upcoming moments
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              A quick scan of launches, approvals, meetings, and deadlines that need attention next.
            </p>
          </div>
          <div className="mt-6">
            <UpcomingList items={upcoming} showBrand />
          </div>
        </aside>
      </section>
    </main>
  );
}
