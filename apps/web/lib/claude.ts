import Anthropic from "@anthropic-ai/sdk";
import type { ContextLayer } from "@strata/shared";

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

export const DEVIATION_LEVELS = ["Within Norms", "Unusual", "Historical Outlier", "Unprecedented"] as const;

export interface AnalysisResult {
  recentHistory: ContextLayer;
  broadHistory: ContextLayer;
  humanNature: ContextLayer;
}

export function parseAnalysisResponse(text: string): AnalysisResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in Claude response");

  const result = JSON.parse(jsonMatch[0]) as AnalysisResult;

  for (const layer of [result.recentHistory, result.broadHistory, result.humanNature]) {
    if (!DEVIATION_LEVELS.includes(layer.score as never)) {
      throw new Error(`Invalid deviation level: ${layer.score}`);
    }
  }

  return result;
}

export async function analyzeHeadline(headline: string): Promise<AnalysisResult> {
  const message = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `You are a rigorous historian and social scientist. You analyze news headlines and provide honest, evidence-based context across three dimensions. You are not partisan — your job is to compare events against historical precedent, not to editorialize politically. You always respond with valid JSON.`,
    messages: [
      {
        role: "user",
        content: `Analyze this news headline across three dimensions and return a JSON object:

Headline: "${headline.replace(/"/g, '\\"')}"

Return this exact JSON structure:
{
  "recentHistory": {
    "score": "<one of: Within Norms, Unusual, Historical Outlier, Unprecedented>",
    "summary": "<one sentence: how does this compare to events of the last 20-30 years?>",
    "detail": "<2-3 sentences of specific historical comparisons>"
  },
  "broadHistory": {
    "score": "<one of: Within Norms, Unusual, Historical Outlier, Unprecedented>",
    "summary": "<one sentence: how does this compare across all of recorded history?>",
    "detail": "<2-3 sentences of specific historical comparisons>"
  },
  "humanNature": {
    "score": "<one of: Within Norms, Unusual, Historical Outlier, Unprecedented>",
    "summary": "<one sentence: how does this relate to recurring patterns in human behavior?>",
    "detail": "<2-3 sentences connecting to broader patterns of human psychology, sociology, or political behavior>"
  }
}

Scoring guide:
- "Within Norms": This has happened many times and follows established patterns
- "Unusual": This is uncommon but not without precedent
- "Historical Outlier": This is rare and represents a significant departure from the norm
- "Unprecedented": There is no meaningful historical parallel

Be honest and specific. Cite actual examples where possible.`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return parseAnalysisResponse(text);
}
