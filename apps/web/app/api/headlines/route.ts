import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { AnalyzedHeadline } from "@strata/shared";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") ?? yesterday();

  const rows = await prisma.headline.findMany({
    where: { forDate: date },
    orderBy: { analyzedAt: "asc" },
  });

  const headlines: AnalyzedHeadline[] = rows.map((r: typeof rows[number]) => ({
    id: r.id,
    headline: r.headline,
    source: r.source,
    url: r.url,
    publishedAt: r.publishedAt,
    category: r.category,
    recentHistory: { score: r.recentScore as never, summary: r.recentSummary, detail: r.recentDetail },
    broadHistory: { score: r.broadScore as never, summary: r.broadSummary, detail: r.broadDetail },
    humanNature: { score: r.humanScore as never, summary: r.humanSummary, detail: r.humanDetail },
    analyzedAt: r.analyzedAt.toISOString(),
  }));

  return NextResponse.json({ date, headlines });
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}
