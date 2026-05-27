import { prisma } from "./prisma";
import { fetchTopHeadlines } from "./newsapi";
import { analyzeHeadline } from "./claude";

export async function runDailyAnalysis(date: string): Promise<number> {
  const articles = await fetchTopHeadlines(date);
  let analyzed = 0;

  for (const article of articles) {
    const exists = await prisma.headline.findUnique({ where: { url: article.url } });
    if (exists) continue;

    try {
      const analysis = await analyzeHeadline(article.title);

      await prisma.headline.create({
        data: {
          headline: article.title,
          source: article.source.name,
          url: article.url,
          publishedAt: article.publishedAt,
          forDate: date,
          recentScore: analysis.recentHistory.score,
          recentSummary: analysis.recentHistory.summary,
          recentDetail: analysis.recentHistory.detail,
          broadScore: analysis.broadHistory.score,
          broadSummary: analysis.broadHistory.summary,
          broadDetail: analysis.broadHistory.detail,
          humanScore: analysis.humanNature.score,
          humanSummary: analysis.humanNature.summary,
          humanDetail: analysis.humanNature.detail,
          isPolitical: analysis.isPolitical,
          politicianName: analysis.politicianName,
          partyName: analysis.partyName,
          campaignScore: analysis.campaignRhetoric?.score ?? null,
          campaignSummary: analysis.campaignRhetoric?.summary ?? null,
          campaignDetail: analysis.campaignRhetoric?.detail ?? null,
          partyScore: analysis.partyValues?.score ?? null,
          partySummary: analysis.partyValues?.summary ?? null,
          partyDetail: analysis.partyValues?.detail ?? null,
        },
      });

      analyzed++;
    } catch (err) {
      console.error(`Failed to analyze: ${article.title}`, err);
    }
  }

  return analyzed;
}
