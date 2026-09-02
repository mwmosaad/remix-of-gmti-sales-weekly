import seed from "@/data/seed-edition.json";
import type { EditionPayload, EditionStats } from "@/lib/edition";

/**
 * The most recent edition produced by the fleet-intelligence pipeline before the
 * app was wired up. It is only used when the database holds no edition for that
 * week yet — anything the pipeline posts always takes precedence.
 */
export const seedEdition = seed as unknown as EditionPayload;

export const seedSummary = {
  week_ending: seedEdition.week_ending,
  generated_at: seedEdition.generated_at,
  stats: seedEdition.stats as EditionStats,
};
