import { Card } from "@/components/ui";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col">
      <header className="mb-6 border-b border-app-line pb-6">
        <div className="h-5 w-28 rounded-full bg-app-soft" />
        <div className="mt-4 h-10 w-full max-w-xl rounded-2xl bg-app-soft" />
        <div className="mt-3 h-5 w-full max-w-3xl rounded-full bg-app-soft" />
      </header>

      <section className="grid gap-5 xl:grid-cols-2">
        <Card className="space-y-4">
          <div className="h-6 w-40 rounded-full bg-app-soft" />
          <div className="space-y-3">
            <div className="h-24 rounded-2xl bg-app-soft" />
            <div className="h-24 rounded-2xl bg-app-soft" />
          </div>
        </Card>
        <Card className="space-y-4">
          <div className="h-6 w-36 rounded-full bg-app-soft" />
          <div className="space-y-3">
            <div className="h-24 rounded-2xl bg-app-soft" />
            <div className="h-24 rounded-2xl bg-app-soft" />
          </div>
        </Card>
      </section>
    </div>
  );
}
