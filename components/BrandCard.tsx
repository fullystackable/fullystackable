import Link from "next/link";

import type { Brand } from "@/data/mockData";

type BrandCardProps = {
  brand: Brand;
};

const statusStyles: Record<Brand["status"], string> = {
  "On track": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  "Needs attention": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  "Launching soon": "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
};

export function BrandCard({ brand }: BrandCardProps) {
  const urgentTasks = brand.tasks.filter(
    (task) => task.status !== "Done" && task.priority !== "Low",
  ).length;

  return (
    <article className="group rounded-3xl border border-slate-200 bg-slate-50/70 p-5 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-[0_18px_42px_rgba(15,23,42,0.1)]">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Brand
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {brand.name}
            </h2>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[brand.status]}`}>
            {brand.status}
          </span>
        </div>

        <p className="text-sm leading-6 text-slate-600">{brand.description}</p>

        <dl className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-slate-400">
              Tasks
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-slate-950">
              {brand.tasks.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-slate-400">
              Assets
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-slate-950">
              {brand.assets.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-slate-400">
              Urgent
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-slate-950">
              {urgentTasks}
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <a
            href={brand.website}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            {brand.website.replace(/^https?:\/\//, "")}
          </a>
          <Link
            href={`/brands/${brand.id}`}
            className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-[0_8px_20px_rgba(15,23,42,0.18)] hover:bg-slate-800"
          >
            Open workspace
          </Link>
        </div>
      </div>
    </article>
  );
}
