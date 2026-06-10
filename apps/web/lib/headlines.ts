import type { Headline } from "@/app/generated/prisma/client";
import type { AnalyzedHeadline, DeviationLevel, HeadlineCategory } from "@strata/shared";
import { HEADLINE_CATEGORIES } from "@strata/shared";

/**
 * Maps a persisted Headline row to the AnalyzedHeadline shape shared by the
 * web UI and the API. Political layers are present only when the headline was
 * flagged political at analysis time, hence the nullable columns.
 */
export function mapRowToHeadline(r: Headline): AnalyzedHeadline {
  return {
    id: r.id,
    headline: r.headline,
    source: r.source,
    url: r.url,
    publishedAt: r.publishedAt,
    category: (HEADLINE_CATEGORIES as readonly string[]).includes(r.category)
      ? r.category as HeadlineCategory
      : "General",
    recentHistory: { score: r.recentScore as DeviationLevel, summary: r.recentSummary, detail: r.recentDetail },
    broadHistory: { score: r.broadScore as DeviationLevel, summary: r.broadSummary, detail: r.broadDetail },
    humanNature: { score: r.humanScore as DeviationLevel, summary: r.humanSummary, detail: r.humanDetail },
    isPolitical: r.isPolitical,
    politicianName: r.politicianName,
    partyName: r.partyName,
    campaignRhetoric: r.campaignScore
      ? { score: r.campaignScore as DeviationLevel, summary: r.campaignSummary!, detail: r.campaignDetail! }
      : null,
    partyValues: r.partyScore
      ? { score: r.partyScore as DeviationLevel, summary: r.partySummary!, detail: r.partyDetail! }
      : null,
    techPrecedent: r.techScore
      ? { score: r.techScore as DeviationLevel, summary: r.techSummary!, detail: r.techDetail! }
      : null,
    analyzedAt: r.analyzedAt.toISOString(),
  };
}
