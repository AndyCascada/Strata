import Anthropic from "@anthropic-ai/sdk";
import { DEVIATION_ORDER, HEADLINE_CATEGORIES, type ContextLayer } from "@strata/shared";

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

export const DEVIATION_LEVELS = DEVIATION_ORDER;

export interface AnalysisResult {
  category: string;
  recentHistory: ContextLayer;
  broadHistory: ContextLayer;
  humanNature: ContextLayer;
  isPolitical: boolean;
  politicianName: string | null;
  partyName: string | null;
  campaignRhetoric: ContextLayer | null;
  partyValues: ContextLayer | null;
  techPrecedent: ContextLayer | null;
}

function validateLayer(layer: unknown, name: string): ContextLayer {
  const l = layer as ContextLayer;
  if (!DEVIATION_LEVELS.includes(l.score)) {
    throw new Error(`Invalid deviation level in ${name}: ${l.score}`);
  }
  return l;
}

export function parseAnalysisResponse(text: string): AnalysisResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in Claude response");

  const raw = JSON.parse(jsonMatch[0]) as AnalysisResult;

  const validCategories = HEADLINE_CATEGORIES as readonly string[];
  const category = validCategories.includes(raw.category) ? raw.category : "General";

  const result: AnalysisResult = {
    category,
    recentHistory: validateLayer(raw.recentHistory, "recentHistory"),
    broadHistory: validateLayer(raw.broadHistory, "broadHistory"),
    humanNature: validateLayer(raw.humanNature, "humanNature"),
    isPolitical: raw.isPolitical === true,
    politicianName: raw.politicianName ?? null,
    partyName: raw.partyName ?? null,
    campaignRhetoric: raw.campaignRhetoric ? validateLayer(raw.campaignRhetoric, "campaignRhetoric") : null,
    partyValues: raw.partyValues ? validateLayer(raw.partyValues, "partyValues") : null,
    techPrecedent: raw.techPrecedent ? validateLayer(raw.techPrecedent, "techPrecedent") : null,
  };

  if (result.isPolitical && (!result.campaignRhetoric || !result.partyValues)) {
    throw new Error("Political headline missing campaignRhetoric or partyValues layers");
  }

  if (category === "Technology" && !result.techPrecedent) {
    throw new Error("Technology headline missing techPrecedent layer");
  }

  return result;
}

export async function analyzeHeadline(headline: string): Promise<AnalysisResult> {
  const message = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1800,
    system: `You are a rigorous historian, political scientist, and social scientist. You analyze news headlines and provide honest, evidence-based context. You are not partisan — your job is to compare events against historical precedent and stated positions, not to editorialize. You always respond with valid JSON.`,
    messages: [
      {
        role: "user",
        content: `Analyze this news headline and return a JSON object:

Headline: "${headline.replace(/"/g, '\\"')}"

Step 1 — Assign a category. Choose exactly one from: Politics, Technology, Science, Economy, World, Climate, Health, General.

Step 2 — Determine if the headline is about a specific US politician or political party taking an action or making a statement (isPolitical).

Step 3 — Score each layer using the scoring guide below. Apply the category-specific guidance where relevant.

Return this exact JSON structure:

{
  "category": "<Politics | Technology | Science | Economy | World | Climate | Health | General>",
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
  "politicianName": "<full name of the primary politician, or null>",
  "partyName": "<political party name, or null>",
  "campaignRhetoric": <null if isPolitical is false, otherwise: {
    "score": "<Within Norms | Unusual | Historical Outlier | Unprecedented>",
    "summary": "<one sentence: how consistent is this with what the politician said they would do during their campaign?>",
    "detail": "<2-3 sentences citing specific campaign promises, speeches, or stated positions>"
  }>,
  "partyValues": <null if isPolitical is false, otherwise: {
    "score": "<Within Norms | Unusual | Historical Outlier | Unprecedented>",
    "summary": "<one sentence: how consistent is this with the stated platform and values of their party?>",
    "detail": "<2-3 sentences citing the party's official platform, historical positions, or stated principles>"
  }>,
  "techPrecedent": <null if category is not Technology, otherwise: {
    "score": "<Within Norms | Unusual | Historical Outlier | Unprecedented>",
    "summary": "<one sentence: how significant is this advance relative to the pace and trajectory of technological change?>",
    "detail": "<2-3 sentences assessing whether this represents an incremental step, a meaningful leap, or a paradigm shift — cite comparable technological milestones>"
  }>
}

---

SCORING GUIDE — applies to all layers:
- "Within Norms": Consistent with well-established patterns. Expected given recent trends.
- "Unusual": Somewhat inconsistent or uncommon, but not without precedent.
- "Historical Outlier": A significant departure from the norm — notable and relatively rare.
- "Unprecedented": No meaningful parallel in recorded history, or a direct contradiction of stated positions.

CATEGORY-SPECIFIC GUIDANCE:

Technology headlines — the bar for "Within Norms" is high. A new AI model, product launch, or tech acquisition is NOT automatically within norms just because similar things have occurred before. Ask: does this accelerate the pace of change, concentrate power in new ways, or displace human capability in a meaningfully new domain? If yes, score higher. Reserve "Within Norms" for genuinely incremental, expected updates with no structural implications.

Politics headlines — score against democratic norms, institutional precedent, and separation of powers, not just partisan expectation.

Economy headlines — consider systemic risk, inequality implications, and historical analogues to past financial cycles.

Climate headlines — score against scientific consensus trajectories and the historical pace of environmental change.

Be honest and specific. Cite actual examples where possible.`,
      },
    ],
  });

  const block = message.content[0];
  const text = block?.type === "text" ? block.text : "";
  return parseAnalysisResponse(text);
}
