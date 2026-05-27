import { describe, it, expect } from "vitest";
import { yesterday, isValidDate } from "@/lib/dates";

describe("yesterday", () => {
  it("returns a YYYY-MM-DD string", () => {
    expect(yesterday()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns a date one day before today", () => {
    const result = new Date(yesterday() + "T12:00:00");
    const expected = new Date();
    expected.setDate(expected.getDate() - 1);
    expect(result.toDateString()).toBe(expected.toDateString());
  });
});

describe("isValidDate", () => {
  it("accepts a valid YYYY-MM-DD date", () => {
    expect(isValidDate("2026-05-26")).toBe(true);
  });

  it("rejects a date with wrong format", () => {
    expect(isValidDate("26-05-2026")).toBe(false);
    expect(isValidDate("2026/05/26")).toBe(false);
    expect(isValidDate("May 26 2026")).toBe(false);
  });

  it("rejects an impossible date", () => {
    expect(isValidDate("2026-13-01")).toBe(false);
    expect(isValidDate("2026-00-15")).toBe(false);
  });

  it("rejects empty string and arbitrary text", () => {
    expect(isValidDate("")).toBe(false);
    expect(isValidDate("not-a-date")).toBe(false);
    expect(isValidDate("'; DROP TABLE Headline; --")).toBe(false);
  });
});
