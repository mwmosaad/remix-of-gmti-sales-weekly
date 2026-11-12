/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { closesThisWeek, lastAwardDetails, type Incumbent, type Lead } from "./edition";

const award: Incumbent = {
  source: "ted", match: "confirmed", buyer: "City", winners: ["Supplier"],
  winner_count: 1, value: 1_500_000, currency: "EUR", value_basis: "award_value",
  award_date: "2026-10-08", award_date_source: "notice", framework: null,
  title: "Vehicle purchase", url: "https://example.com/award", notice_id: "123",
};

describe("last award data", () => {
  test("null and older missing incumbents produce no details", () => {
    expect(lastAwardDetails(null)).toBeNull();
    expect(lastAwardDetails(undefined)).toBeNull();
  });
  test("winner count includes winners beyond the three published names", () => {
    expect(lastAwardDetails({ ...award, winners: ["First", "Second", "Third"], winner_count: 5 })?.summary.startsWith("First +4 ·")).toBe(true);
  });
  test("empty winners have a fallback", () => {
    expect(lastAwardDetails({ ...award, winners: [], winner_count: 0 })?.summary.startsWith("winner not published ·")).toBe(true);
  });
  test("currency amounts use the specified compact values", () => {
    expect(lastAwardDetails(award)?.summary).toContain("€1.5M");
    expect(lastAwardDetails({ ...award, value: 3_300_000, currency: "PLN" })?.summary).toContain("3.3M PLN");
    expect(lastAwardDetails({ ...award, value: 334_000_000, currency: "COP" })?.summary).toContain("334M COP");
  });
  test("null value omits the value segment even for notice totals", () => {
    expect(lastAwardDetails({ ...award, value: null, value_basis: "notice_total" })?.summary).toBe("Supplier · October 2026");
  });
  test("notice total values are labeled", () => {
    expect(lastAwardDetails({ ...award, value_basis: "notice_total" })?.summary).toContain("€1.5M (notice total)");
  });
  test("title is at most 60 characters", () => {
    expect(lastAwardDetails({ ...award, title: "a".repeat(80) })?.title).toBe(`${"a".repeat(59)}…`);
  });
  test("source URL and buyer-name match are preserved", () => {
    expect(lastAwardDetails({ ...award, match: "name_only" })).toMatchObject({ url: award.url, matchedByName: true });
    expect(lastAwardDetails(award)?.matchedByName).toBe(false);
  });
});

test("upcoming notices never qualify for closing this week", () => {
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const lead: Lead = { doc_id: "test", region: "western_europe", project_name: "Vehicles", companies: [], contacts: [], vehicle_lines: [], offer_expires: date };
  expect(closesThisWeek({ ...lead, stage: "procurement" })).toBe(true);
  expect(closesThisWeek({ ...lead, stage: "upcoming" })).toBe(false);
});