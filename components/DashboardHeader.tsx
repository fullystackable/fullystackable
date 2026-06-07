import Link from "next/link";

type DashboardHeaderProps = {
  active: "dashboard" | "brands";
  eyebrow: string;
  title: string;
  subtitle: string;
};

const navItems = [
  { href: "/", label: "Dashboard", key: "dashboard" },
  { href: "/brands", label: "Brands", key: "brands" },
] as const;

export function DashboardHeader({
  active,
  eyebrow,
  title,
  subtitle,
}: DashboardHeaderProps) {
  return (
    <header className="mb-8 rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
            {eyebrow}
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            {subtitle}
          </p>
        </div>

        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const isActive = item.key === active;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-slate-950 text-white shadow-[0_8px_20px_rgba(15,23,42,0.18)]"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
