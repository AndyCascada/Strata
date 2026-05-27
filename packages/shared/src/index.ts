export type DeviationLevel = "Within Norms" | "Unusual" | "Historical Outlier" | "Unprecedented";

export interface ContextLayer {
  score: DeviationLevel;
  summary: string;
  detail: string;
}

export interface AnalyzedHeadline {
  id: string;
  headline: string;
  source: string;
  url: string;
  publishedAt: string;
  category: string;
  recentHistory: ContextLayer;    // Layer 1: recent historical context
  broadHistory: ContextLayer;     // Layer 2: broader historical context
  humanNature: ContextLayer;      // Layer 3: human nature context
  analyzedAt: string;
}

export const DEVIATION_ORDER: DeviationLevel[] = [
  "Within Norms",
  "Unusual",
  "Historical Outlier",
  "Unprecedented",
];

export function deviationColor(level: DeviationLevel): string {
  switch (level) {
    case "Within Norms": return "#22c55e";
    case "Unusual": return "#eab308";
    case "Historical Outlier": return "#f97316";
    case "Unprecedented": return "#ef4444";
  }
}
