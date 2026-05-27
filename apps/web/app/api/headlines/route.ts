import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { yesterday, isValidDate } from "@/lib/dates";
import type { AnalyzedHeadline, DeviationLevel } from "@strata/shared";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date") ?? yesterday();

  if (!isValidDate(dateParam)) {
    return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
  }

  const rows = await prisma.headline.findMany({
    where: { forDate: dateParam },
    orderBy: { analyzedAt: "asc" },
  });

  const headlines: AnalyzedHeadline[] = rows.map((r: typeof rows[number]) => ({
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

  return NextResponse.json({ date: dateParam, headlines });
}
