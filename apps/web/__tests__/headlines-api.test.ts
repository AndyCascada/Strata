import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma before importing the route handler
vi.mock("@/lib/prisma", () => ({
  prisma: {
    headline: {
      findMany: vi.fn(),
    },
  },
}));

import { GET } from "@/app/api/headlines/route";
import { prisma } from "@/lib/prisma";

const mockFindMany = vi.mocked(prisma.headline.findMany);

const SAMPLE_ROW = {
  id: "test-id-1",
  headline: "Senate passes historic climate bill",
  source: "Reuters",
  url: "https://reuters.com/climate-bill",
  publishedAt: "2026-05-26T10:00:00Z",
  category: "politics",
  recentScore: "Unusual",
  recentSummary: "The last comparable bill failed in 2022.",
  recentDetail: "The Inflation Reduction Act passed narrowly in 2022 via reconciliation.",
  broadScore: "Historical Outlier",
  broadSummary: "Major climate legislation is rare in US history.",
  broadDetail: "The Clean Air Act (1970) and this bill are among few major federal climate actions.",
  humanScore: "Within Norms",
  humanSummary: "Societies periodically respond to environmental crises with legislation.",
  humanDetail: "History shows collective action often follows sustained advocacy and visible harm.",
  isPolitical: false,
  politicianName: null,
  partyName: null,
  campaignScore: null,
  campaignSummary: null,
  campaignDetail: null,
  partyScore: null,
  partySummary: null,
  partyDetail: null,
  analyzedAt: new Date("2026-05-27T02:00:00Z"),
  forDate: "2026-05-26",
};

import { NextRequest } from "next/server";

function makeRequest(date?: string): NextRequest {
  const url = date
    ? `http://localhost/api/headlines?date=${date}`
    : "http://localhost/api/headlines";
  return new NextRequest(url);
}

describe("GET /api/headlines", () => {
  beforeEach(() => {
    mockFindMany.mockReset();
  });

  it("returns headlines shaped as AnalyzedHeadline for a given date", async () => {
    mockFindMany.mockResolvedValue([SAMPLE_ROW]);

    const res = await GET(makeRequest("2026-05-26"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.date).toBe("2026-05-26");
    expect(body.headlines).toHaveLength(1);

    const h = body.headlines[0];
    expect(h.id).toBe("test-id-1");
    expect(h.headline).toBe("Senate passes historic climate bill");
    expect(h.recentHistory.score).toBe("Unusual");
    expect(h.broadHistory.score).toBe("Historical Outlier");
    expect(h.humanNature.score).toBe("Within Norms");
  });

  it("returns an empty array when no headlines exist for the date", async () => {
    mockFindMany.mockResolvedValue([]);

    const res = await GET(makeRequest("2026-01-01"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.headlines).toEqual([]);
  });

  it("maps all three context layers with summary and detail", async () => {
    mockFindMany.mockResolvedValue([SAMPLE_ROW]);

    const res = await GET(makeRequest("2026-05-26"));
    const { headlines } = await res.json();
    const h = headlines[0];

    expect(h.recentHistory.summary).toBe("The last comparable bill failed in 2022.");
    expect(h.broadHistory.detail).toContain("Clean Air Act");
    expect(h.humanNature.summary).toBe("Societies periodically respond to environmental crises with legislation.");
  });

  it("queries the database with the correct date", async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeRequest("2026-03-15"));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { forDate: "2026-03-15" },
      })
    );
  });

  it("uses yesterday as the default date when none is provided", async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeRequest());

    const call = mockFindMany.mock.calls[0][0] as { where: { forDate: string } };
    const usedDate = call.where.forDate;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(usedDate).toBe(yesterday.toISOString().split("T")[0]);
  });
});
