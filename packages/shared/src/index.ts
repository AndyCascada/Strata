export const DEVIATION_ORDER = [
  "Within Norms",
  "Unusual",
  "Historical Outlier",
  "Unprecedented",
] as const;

export type DeviationLevel = (typeof DEVIATION_ORDER)[number];

export interface ContextLayer {
  score: DeviationLevel;
  summary: string;
  detail: string;
}

export const HEADLINE_CATEGORIES = [
  "Politics",
  "Technology",
  "Science",
  "Economy",
  "World",
  "Climate",
  "Health",
  "General",
] as const;

export type HeadlineCategory = (typeof HEADLINE_CATEGORIES)[number];

export interface AnalyzedHeadline {
  id: string;
  headline: string;
  source: string;
  url: string;
  publishedAt: string;
  category: HeadlineCategory;
  recentHistory: ContextLayer;
  broadHistory: ContextLayer;
  humanNature: ContextLayer;
  isPolitical: boolean;
  politicianName: string | null;
  partyName: string | null;
  campaignRhetoric: ContextLayer | null;
  partyValues: ContextLayer | null;
  techPrecedent: ContextLayer | null;
  analyzedAt: string;
}

export function deviationColor(level: DeviationLevel): string {
  switch (level) {
    case "Within Norms": return "#22c55e";
    case "Unusual": return "#eab308";
    case "Historical Outlier": return "#f97316";
    case "Unprecedented": return "#ef4444";
  }
}
