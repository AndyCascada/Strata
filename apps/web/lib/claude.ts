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
  isPolitical: boolean;
  politicianName: string | null;
  partyName: string | null;
  campaignRhetoric: ContextLayer | null;
  partyValues: ContextLayer | null;
}

function validateLayer(layer: unknown, name: string): ContextLayer {
  const l = layer as ContextLayer;
  if (!DEVIATION_LEVELS.includes(l.score as never)) {
    throw new Error(`Invalid deviation level in ${name}: ${l.score}`);
  }
  return l;
}

export function parseAnalysisResponse(text: string): AnalysisResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in Claude response");

  const raw = JSON.parse(jsonMatch[0]) as AnalysisResult;

  const result: AnalysisResult = {
    recentHistory: validateLayer(raw.recentHistory, "recentHistory"),
    broadHistory: validateLayer(raw.broadHistory, "broadHistory"),
    humanNature: validateLayer(raw.humanNature, "humanNature"),
    isPolitical: raw.isPolitical === true,
    politicianName: raw.politicianName ?? null,
    partyName: raw.partyName ?? null,
    campaignRhetoric: raw.campaignRhetoric ? validateLayer(raw.campaignRhetoric, "campaignRhetoric") : null,
    partyValues: raw.partyValues ? validateLayer(raw.partyValues, "partyValues") : null,
  };

  if (result.isPolitical && (!result.campaignRhetoric || !result.partyValues)) {
    throw new Error("Political headline missing campaignRhetoric or partyValues layers");
  }

  return result;
}

export async function analyzeHeadline(headline: string): Promise<AnalysisResult> {
  const message = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1536,
    system: `You are a rigorous historian, political scientist, and social scientist. You analyze news headlines and provide honest, evidence-based context. You are not partisan — your job is to compare events against historical precedent and stated positions, not to editorialize. You always respond with valid JSON.`,
    messages: [
      {
        role: "user",
        content: `Analyze this news headline and return a JSON object:

Headline: "${headline.replace(/"/g, '\\"')}"

First, determine if this headline is about a specific US politician or political party taking an action or making a statement.

Return this exact JSON structure:

{
  "recentHistory": {
    "score": "<Within Norms | Unusual | Historical Outlier | Unprecedented>",
    "summary": "<one sentence: how does this compare to events of the last 20-30 years?>",
    "detail": "<2-3 sentences of specific historical comparisons>"
  },
  "broadHistory": {
    "score": "<Within Norms | Unusual | Historical Outlier | Unprecedented>",
    "summary": "<one sentence: how does this compare across all of recorded history?>",
    "detail": "<2-3 sentences of specific historical comparisons>"
  },
  "humanNature": {
    "score": "<Within Norms | Unusual | Historical Outlier | Unprecedented>",
    "summary": "<one sentence: how does this relate to recurring patterns in human behavior?>",
    "detail": "<2-3 sentences connecting to broader patterns of human psychology, sociology, or political behavior>"
  },
  "isPolitical": <true if this involves a specific US politician or political party acting or speaking, otherwise false>,
  "politicianName": "<full name of the primary politician, or null if not applicable>",
  "partyName": "<political party name, or null if not applicable>",
  "campaignRhetoric": <null if isPolitical is false, otherwise: {
    "score": "<Within Norms | Unusual | Historical Outlier | Unprecedented>",
    "summary": "<one sentence: how consistent is this with what the politician said they would do during their campaign?>",
    "detail": "<2-3 sentences citing specific campaign promises, speeches, or stated positions>"
  }>,
  "partyValues": <null if isPolitical is false, otherwise: {
    "score": "<Within Norms | Unusual | Historical Outlier | Unprecedented>",
    "summary": "<one sentence: how consistent is this with the stated platform and values of their party?>",
    "detail": "<2-3 sentences citing the party's official platform, historical positions, or stated principles>"
  }>
}

Scoring guide for all layers:
- "Within Norms": Consistent with established patterns or stated positions
- "Unusual": Somewhat inconsistent or uncommon, but not without precedent
- "Historical Outlier": A significant departure from the norm or stated positions
- "Unprecedented": No meaningful parallel or a direct contradiction of stated positions

Be honest and specific. Cite actual examples where possible.`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return parseAnalysisResponse(text);
}
