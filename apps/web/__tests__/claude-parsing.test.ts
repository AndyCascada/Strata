import { describe, it, expect } from "vitest";
import { parseAnalysisResponse, DEVIATION_LEVELS } from "@/lib/claude";

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

describe("parseAnalysisResponse", () => {
  it("parses a well-formed response", () => {
    const result = parseAnalysisResponse(VALID_RESPONSE);
    expect(result.recentHistory.score).toBe("Within Norms");
    expect(result.broadHistory.score).toBe("Unusual");
    expect(result.humanNature.score).toBe("Historical Outlier");
  });

  it("extracts JSON embedded in surrounding prose", () => {
    const withProse = `Here is my analysis:\n\n${VALID_RESPONSE}\n\nI hope that helps.`;
    const result = parseAnalysisResponse(withProse);
    expect(result.recentHistory.score).toBe("Within Norms");
  });

  it("preserves summary and detail text", () => {
    const result = parseAnalysisResponse(VALID_RESPONSE);
    expect(result.recentHistory.summary).toBe("Presidents have done this before.");
    expect(result.broadHistory.detail).toBe("Similar events occurred in 1850 and 1923.");
  });

  it("throws when response contains no JSON", () => {
    expect(() => parseAnalysisResponse("Sorry, I cannot analyze that.")).toThrow(
      "No JSON found in Claude response"
    );
  });

  it("throws when a deviation score is not a valid level", () => {
    const bad = JSON.stringify({
      recentHistory: { score: "Very Unusual", summary: "s", detail: "d" },
      broadHistory: { score: "Within Norms", summary: "s", detail: "d" },
      humanNature: { score: "Within Norms", summary: "s", detail: "d" },
    });
    expect(() => parseAnalysisResponse(bad)).toThrow("Invalid deviation level: Very Unusual");
  });

  it("throws when JSON is structurally malformed", () => {
    expect(() => parseAnalysisResponse("{ not valid json }")).toThrow();
  });

  it("accepts all four valid deviation levels", () => {
    for (const level of DEVIATION_LEVELS) {
      const response = JSON.stringify({
        recentHistory: { score: level, summary: "s", detail: "d" },
        broadHistory: { score: level, summary: "s", detail: "d" },
        humanNature: { score: level, summary: "s", detail: "d" },
      });
      expect(() => parseAnalysisResponse(response)).not.toThrow();
    }
  });

  it("handles headlines with embedded double quotes", () => {
    const withQuotes = JSON.stringify({
      recentHistory: { score: "Within Norms", summary: 'Trump said "America First"', detail: "d" },
      broadHistory: { score: "Within Norms", summary: "s", detail: "d" },
      humanNature: { score: "Within Norms", summary: "s", detail: "d" },
    });
    const result = parseAnalysisResponse(withQuotes);
    expect(result.recentHistory.summary).toContain("America First");
  });
});
