import { describe, it, expect } from "vitest";
import { parseAnalysisResponse, DEVIATION_LEVELS } from "@/lib/claude";

const BASE_LAYERS = {
  recentHistory: { score: "Within Norms", summary: "Common in recent history.", detail: "Details here." },
  broadHistory:  { score: "Unusual",       summary: "Rare in broad history.",   detail: "Details here." },
  humanNature:   { score: "Historical Outlier", summary: "Unusual human behavior.", detail: "Details here." },
};

const NON_POLITICAL = JSON.stringify({
  ...BASE_LAYERS,
  isPolitical: false,
  politicianName: null,
  partyName: null,
  campaignRhetoric: null,
  partyValues: null,
});

const POLITICAL = JSON.stringify({
  ...BASE_LAYERS,
  isPolitical: true,
  politicianName: "Joe Biden",
  partyName: "Democratic Party",
  campaignRhetoric: {
    score: "Within Norms",
    summary: "Consistent with campaign promises.",
    detail: "Biden pledged this during the 2020 campaign.",
  },
  partyValues: {
    score: "Unusual",
    summary: "Somewhat at odds with party platform.",
    detail: "The Democratic platform has historically opposed this.",
  },
});

describe("parseAnalysisResponse — non-political", () => {
  it("parses standard three layers", () => {
    const result = parseAnalysisResponse(NON_POLITICAL);
    expect(result.recentHistory.score).toBe("Within Norms");
    expect(result.broadHistory.score).toBe("Unusual");
    expect(result.humanNature.score).toBe("Historical Outlier");
  });

  it("sets isPolitical to false and political fields to null", () => {
    const result = parseAnalysisResponse(NON_POLITICAL);
    expect(result.isPolitical).toBe(false);
    expect(result.politicianName).toBeNull();
    expect(result.partyName).toBeNull();
    expect(result.campaignRhetoric).toBeNull();
    expect(result.partyValues).toBeNull();
  });
});

describe("parseAnalysisResponse — political", () => {
  it("parses all five layers", () => {
    const result = parseAnalysisResponse(POLITICAL);
    expect(result.isPolitical).toBe(true);
    expect(result.politicianName).toBe("Joe Biden");
    expect(result.partyName).toBe("Democratic Party");
    expect(result.campaignRhetoric?.score).toBe("Within Norms");
    expect(result.partyValues?.score).toBe("Unusual");
  });

  it("preserves political layer detail text", () => {
    const result = parseAnalysisResponse(POLITICAL);
    expect(result.campaignRhetoric?.summary).toBe("Consistent with campaign promises.");
    expect(result.partyValues?.detail).toBe("The Democratic platform has historically opposed this.");
  });

  it("throws when isPolitical is true but political layers are missing", () => {
    const bad = JSON.stringify({
      ...BASE_LAYERS,
      isPolitical: true,
      politicianName: "Someone",
      partyName: "Some Party",
      campaignRhetoric: null,
      partyValues: null,
    });
    expect(() => parseAnalysisResponse(bad)).toThrow("Political headline missing");
  });
});

describe("parseAnalysisResponse — general", () => {
  it("extracts JSON embedded in surrounding prose", () => {
    const result = parseAnalysisResponse(`Here is my analysis:\n\n${NON_POLITICAL}\n\nDone.`);
    expect(result.recentHistory.score).toBe("Within Norms");
  });

  it("throws when response contains no JSON", () => {
    expect(() => parseAnalysisResponse("Sorry, I cannot analyze that.")).toThrow(
      "No JSON found in Claude response"
    );
  });

  it("throws when a deviation score is not a valid level", () => {
    const bad = JSON.stringify({
      ...BASE_LAYERS,
      recentHistory: { score: "Very Unusual", summary: "s", detail: "d" },
      isPolitical: false,
      politicianName: null,
      partyName: null,
      campaignRhetoric: null,
      partyValues: null,
    });
    expect(() => parseAnalysisResponse(bad)).toThrow("Invalid deviation level");
  });

  it("accepts all four valid deviation levels", () => {
    for (const level of DEVIATION_LEVELS) {
      const response = JSON.stringify({
        recentHistory: { score: level, summary: "s", detail: "d" },
        broadHistory:  { score: level, summary: "s", detail: "d" },
        humanNature:   { score: level, summary: "s", detail: "d" },
        isPolitical: false,
        politicianName: null,
        partyName: null,
        campaignRhetoric: null,
        partyValues: null,
      });
      expect(() => parseAnalysisResponse(response)).not.toThrow();
    }
  });
});
