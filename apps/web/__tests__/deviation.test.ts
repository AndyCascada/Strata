import { describe, it, expect } from "vitest";
import { deviationColor, DEVIATION_ORDER, type DeviationLevel } from "@strata/shared";

describe("DEVIATION_ORDER", () => {
  it("is ordered from least to most severe", () => {
    expect(DEVIATION_ORDER).toEqual([
      "Within Norms",
      "Unusual",
      "Historical Outlier",
      "Unprecedented",
    ]);
  });

  it("contains exactly four levels", () => {
    expect(DEVIATION_ORDER).toHaveLength(4);
  });
});

describe("deviationColor", () => {
  it("returns green for Within Norms", () => {
    expect(deviationColor("Within Norms")).toBe("#22c55e");
  });

  it("returns yellow for Unusual", () => {
    expect(deviationColor("Unusual")).toBe("#eab308");
  });

  it("returns orange for Historical Outlier", () => {
    expect(deviationColor("Historical Outlier")).toBe("#f97316");
  });

  it("returns red for Unprecedented", () => {
    expect(deviationColor("Unprecedented")).toBe("#ef4444");
  });

  it("returns a distinct color for every level", () => {
    const colors = DEVIATION_ORDER.map(deviationColor);
    const unique = new Set(colors);
    expect(unique.size).toBe(DEVIATION_ORDER.length);
  });
});

// Mirrors the logic in HeadlineCard — extracted here for testability
function getHighestDeviation(scores: DeviationLevel[]): DeviationLevel {
  return scores.reduce((max, s) =>
    DEVIATION_ORDER.indexOf(s) > DEVIATION_ORDER.indexOf(max) ? s : max
  );
}

describe("getHighestDeviation", () => {
  it("returns the single score when given one", () => {
    expect(getHighestDeviation(["Within Norms"])).toBe("Within Norms");
  });

  it("returns the most severe score", () => {
    expect(
      getHighestDeviation(["Within Norms", "Historical Outlier", "Unusual"])
    ).toBe("Historical Outlier");
  });

  it("returns Unprecedented when present", () => {
    expect(
      getHighestDeviation(["Unusual", "Unprecedented", "Within Norms"])
    ).toBe("Unprecedented");
  });

  it("handles all identical scores", () => {
    expect(
      getHighestDeviation(["Unusual", "Unusual", "Unusual"])
    ).toBe("Unusual");
  });
});
