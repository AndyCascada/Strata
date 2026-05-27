import { describe, it, expect } from "vitest";
import type { DeviationLevel } from "@strata/shared";

// The parsing logic extracted from lib/claude.ts for isolated testing
interface ContextLayer {
  score: DeviationLevel;
  summary: string;
  detail: string;
}

interface AnalysisResult {
  recentHistory: ContextLayer;
  broadHistory: ContextLayer;
  humanNature: ContextLayer;
}

const DEVIATION_LEVELS = [
  "Within Norms",
  "Unusual",
  "Historical Outlier",
  "Unprecedented",
] as const;

function parseClaudeResponse(text: string): AnalysisResult {
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

const VALID_RESPONSE = JSON.stringify({
  recentHistory: {
    score: "Within Norms",
    summary: "Presidents have done this before.",
    detail: "Historical examples include X, Y, and Z.",
  },
  broadHistory: {
    score: "Unusual",
    summary: "Rare but not unheard of in broader history.",
    detail: "Similar events occurred in 1850 and 1923.",
  },
  humanNature: {
    score: "Historical Outlier",
    summary: "Reflects a pattern of power consolidation.",
    detail: "Sociologists describe this as institutional capture.",
  },
});

describe("parseClaudeResponse", () => {
  it("parses a well-formed response", () => {
    const result = parseClaudeResponse(VALID_RESPONSE);
    expect(result.recentHistory.score).toBe("Within Norms");
    expect(result.broadHistory.score).toBe("Unusual");
    expect(result.humanNature.score).toBe("Historical Outlier");
  });

  it("extracts JSON embedded in surrounding prose", () => {
    const withProse = `Here is my analysis:\n\n${VALID_RESPONSE}\n\nI hope that helps.`;
    const result = parseClaudeResponse(withProse);
    expect(result.recentHistory.score).toBe("Within Norms");
  });

  it("preserves summary and detail text", () => {
    const result = parseClaudeResponse(VALID_RESPONSE);
    expect(result.recentHistory.summary).toBe("Presidents have done this before.");
    expect(result.broadHistory.detail).toBe("Similar events occurred in 1850 and 1923.");
  });

  it("throws when response contains no JSON", () => {
    expect(() => parseClaudeResponse("Sorry, I cannot analyze that.")).toThrow(
      "No JSON found in Claude response"
    );
  });

  it("throws when a deviation score is not a valid level", () => {
    const bad = JSON.stringify({
      recentHistory: { score: "Very Unusual", summary: "s", detail: "d" },
      broadHistory: { score: "Within Norms", summary: "s", detail: "d" },
      humanNature: { score: "Within Norms", summary: "s", detail: "d" },
    });
    expect(() => parseClaudeResponse(bad)).toThrow("Invalid deviation level: Very Unusual");
  });

  it("throws when JSON is structurally malformed", () => {
    expect(() => parseClaudeResponse("{ not valid json }")).toThrow();
  });

  it("accepts all four valid deviation levels", () => {
    for (const level of DEVIATION_LEVELS) {
      const response = JSON.stringify({
        recentHistory: { score: level, summary: "s", detail: "d" },
        broadHistory: { score: level, summary: "s", detail: "d" },
        humanNature: { score: level, summary: "s", detail: "d" },
      });
      expect(() => parseClaudeResponse(response)).not.toThrow();
    }
  });
});
