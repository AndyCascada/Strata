import { HeadlineList } from "./components/HeadlineList";
import { prisma } from "@/lib/prisma";
import { yesterday } from "@/lib/dates";
import { mapRowToHeadline } from "@/lib/headlines";
import type { AnalyzedHeadline } from "@strata/shared";

// The homepage reads yesterday's freshly-analyzed headlines from the DB, so it
// must render per-request. Without this, Next.js prerenders it as static HTML
// at build time (when the DB is empty) and never reflects new analysis.
export const dynamic = "force-dynamic";

async function getHeadlines(date: string): Promise<AnalyzedHeadline[]> {
  const rows = await prisma.headline.findMany({
    where: { forDate: date },
    orderBy: { analyzedAt: "asc" },
  });

  return rows.map(mapRowToHeadline);
}

export default async function Home() {
  const date = yesterday();
  const headlines = await getHeadlines(date);

  const formatted = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-5">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight">Strata</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Headlines from {formatted} · News in historical context
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {headlines.length === 0 ? (
          <div className="text-center py-24 text-zinc-500">
            <p className="text-lg">No headlines analyzed for {date} yet.</p>
            <p className="text-sm mt-2">Check back after the nightly analysis runs.</p>
          </div>
        ) : (
          <HeadlineList headlines={headlines} />
        )}
      </div>
    </main>
  );
}
