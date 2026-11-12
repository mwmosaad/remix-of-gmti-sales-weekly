import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { closesThisWeek, lastAwardDetails, type Incumbent, type Lead } from "./edition";

const award: Incumbent = {
  source: "ted", match: "confirmed", buyer: "City", winners: ["Supplier"],
  winner_count: 1, value: 1_500_000, currency: "EUR", value_basis: "award_value",
  award_date: "2026-10-08", award_date_source: "notice", framework: null,
  title: "Vehicle purchase", url: "https://example.com/award", notice_id: "123",
};

describe("last award data", () => {
  test("null and older missing incumbents produce no details", () => {
    assert.equal(lastAwardDetails(null), null);
    assert.equal(lastAwardDetails(undefined), null);
  });
  test("winner count includes winners beyond the three published names", () => {
    assert.equal(lastAwardDetails({ ...award, winners: ["First", "Second", "Third"], winner_count: 5 })?.summary.startsWith("First +4 ·"), true);
  });
  test("empty winners have a fallback", () => {
    assert.equal(lastAwardDetails({ ...award, winners: [], winner_count: 0 })?.summary.startsWith("winner not published ·"), true);
  });
  test("currency amounts use the specified compact values", () => {
    assert.ok(lastAwardDetails(award)?.summary?.includes("€1.5M"));
    assert.ok(lastAwardDetails({ ...award, value: 3_300_000, currency: "PLN" })?.summary?.includes("3.3M PLN"));
    assert.ok(lastAwardDetails({ ...award, value: 334_000_000, currency: "COP" })?.summary?.includes("334M COP"));
  });
  test("null value omits the value segment even for notice totals", () => {
    assert.equal(lastAwardDetails({ ...award, value: null, value_basis: "notice_total" })?.summary, "Supplier · October 2026");
  });
  test("notice total values are labeled", () => {
    assert.ok(lastAwardDetails({ ...award, value_basis: "notice_total" })?.summary?.includes("€1.5M (notice total)"));
  });
  test("title is at most 60 characters", () => {
    assert.equal(lastAwardDetails({ ...award, title: "a".repeat(80) })?.title, `${"a".repeat(59)}…`);
  });
  test("source URL and buyer-name match are preserved", () => {
    assert.equal(lastAwardDetails({ ...award, match: "name_only" })?.url, award.url);
    assert.equal(lastAwardDetails({ ...award, match: "name_only" })?.matchedByName, true);
    assert.equal(lastAwardDetails(award)?.matchedByName, false);
  });
});

test("upcoming notices never qualify for closing this week", () => {
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const lead: Lead = { doc_id: "test", region: "western_europe", project_name: "Vehicles", companies: [], contacts: [], vehicle_lines: [], offer_expires: date };
  assert.equal(closesThisWeek({ ...lead, stage: "procurement" }), true);
  assert.equal(closesThisWeek({ ...lead, stage: "upcoming" }), false);
});