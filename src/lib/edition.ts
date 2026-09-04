export interface Company {
  name: string;
  role: string;
  evidence?: string;
}

export interface Contact {
  name: string;
  title?: string;
  organization?: string;
  email?: string;
  channel?: string;
  evidence?: string;
}

export interface Investment {
  amount_original?: number | null;
  currency?: string | null;
  amount_usd?: number | null;
  financier?: string | null;
  financing_type?: string | null;
  evidence?: string | null;
}

export interface VehicleLine {
  vehicle_class: string;
  label: string;
  units_now: number;
  units_next_12m: number;
  units_beyond_12m: number;
  basis: string;
  evidence?: string;
}

export interface Lead {
  doc_id: string;
  region: string;
  country?: string;
  project_name: string;
  project_type?: string;
  project_type_label?: string;
  stage?: string;
  companies: Company[];
  contacts: Contact[];
  investment?: Investment | null;
  vehicle_lines: VehicleLine[];
  stated_vehicle_notes?: string[];
  source_url?: string;
  source_id?: string;
  source_title?: string;
  published?: string;
  counterparty_named?: boolean;
  evidence_window?: string;
  score?: number;
  rank_value?: number;
  band?: string;
  score_reasons?: string[];
  units_now?: number;
  units_next_12m?: number;
  units_beyond_12m?: number;
  primary_company?: string;
}

export interface MarketNote {
  title: string;
  url?: string;
}

export interface Region {
  key: string;
  label: string;
  docs_scanned?: number;
  macro_lines: string[];
  market_notes: MarketNote[];
  pipeline_usd_m?: number;
  leads: Lead[];
}

export interface EditionStats {
  docs_ingested?: number;
  docs_relevant?: number;
  docs_unassigned?: number;
  leads?: number;
  market_notes?: number;
  dropped_ungrounded?: number;
  extractor?: string;
  relevance_threshold?: number;
}

export interface EditionPayload {
  week_ending: string;
  generated_at: string;
  stats: EditionStats;
  regions: Region[];
}

export interface EditionRow {
  week_ending: string;
  generated_at: string;
  stats: EditionStats;
  payload: EditionPayload;
}

export const formatWeek = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export const formatShortWeek = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

/** The Monday 08:00 New York publication that follows a given week-ending date. */
export const nextPublication = (weekEndingIso: string) => {
  const base = new Date(`${weekEndingIso}T00:00:00Z`);
  const next = new Date(base);
  next.setUTCDate(base.getUTCDate() + ((8 - base.getUTCDay()) % 7 || 7));
  return next.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
};



export const formatUsdM = (usdMillions: number) => {
  if (usdMillions >= 1000) return `$${(usdMillions / 1000).toFixed(1)}bn`;
  return `$${Math.round(usdMillions).toLocaleString("en-GB")}m`;
};

export const formatCapex = (investment?: Investment | null) => {
  if (!investment?.amount_usd) return null;
  return formatUsdM(investment.amount_usd / 1_000_000);
};

export const formatUnits = (units?: number | null) =>
  units == null ? "—" : Math.round(units).toLocaleString("en-GB");

export const stageLabel = (stage?: string) =>
  (stage ?? "unknown").replace(/_/g, " ");

export const allLeads = (edition: EditionPayload) =>
  edition.regions.flatMap((region) => region.leads);

export const editionTotals = (edition: EditionPayload) => {
  const leads = allLeads(edition);
  const capexUsdM =
    leads.reduce((sum, lead) => sum + (lead.investment?.amount_usd ?? 0), 0) / 1_000_000;
  return {
    leads: leads.length,
    priority: leads.filter((lead) => lead.band === "A" || lead.band === "B").length,
    capexUsdM,
    unitsNow: leads.reduce((sum, lead) => sum + (lead.units_now ?? 0), 0),
    unitsNext12m: leads.reduce((sum, lead) => sum + (lead.units_next_12m ?? 0), 0),
    contacts: leads.reduce((sum, lead) => sum + lead.contacts.length, 0),
  };
};

export const bandColor = (band?: string) => {
  if (band === "A") return "var(--band-a)";
  if (band === "B") return "var(--band-b)";
  return "var(--band-c)";
};
