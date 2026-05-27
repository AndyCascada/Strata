import { HeadlineList } from "./components/HeadlineList";
import { prisma } from "@/lib/prisma";
import { yesterday } from "@/lib/dates";
import type { AnalyzedHeadline, DeviationLevel } from "@strata/shared";

async function getHeadlines(date: string): Promise<AnalyzedHeadline[]> {
  const rows = await prisma.headline.findMany({
    where: { forDate: date },
    orderBy: { analyzedAt: "asc" },
  });

  return rows.map((r) => ({
    id: r.id,
    headline: r.headline,
    source: r.source,
    url: r.url,
    publishedAt: r.publishedAt,
    category: r.category,
    recentHistory: { score: r.recentScore as DeviationLevel, summary: r.recentSummary, detail: r.recentDetail },
    broadHistory: { score: r.broadScore as DeviationLevel, summary: r.broadSummary, detail: r.broadDetail },
    humanNature: { score: r.humanScore as DeviationLevel, summary: r.humanSummary, detail: r.humanDetail },
    isPolitical: r.isPolitical,
    politicianName: r.politicianName,
    partyName: r.partyName,
    campaignRhetoric: r.campaignScore ? { score: r.campaignScore as DeviationLevel, summary: r.campaignSummary!, detail: r.campaignDetail! } : null,
    partyValues: r.partyScore ? { score: r.partyScore as DeviationLevel, summary: r.partySummary!, detail: r.partyDetail! } : null,
    analyzedAt: r.analyzedAt.toISOString(),
  }));
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
            {formatted} · News in historical context
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
