import { LeadCard } from "@/components/LeadCard";
import {
  editionTotals,
  formatUnits,
  formatUsdM,
  formatWeek,
  type EditionPayload,
} from "@/lib/edition";

function StatBlock({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div>
      <div
        className="font-display text-2xl font-semibold"
        style={{ color: accent ? "var(--signal)" : "var(--ink)" }}
      >
        {value}
      </div>
      <div className="label-mono mt-1">{label}</div>
    </div>
  );
}

export function EditionView({ edition }: { edition: EditionPayload }) {
  const totals = editionTotals(edition);
  const regions = edition.regions.filter(
    (region) => region.leads.length > 0 || region.macro_lines.length > 0,
  );

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <p className="label-mono">GMTI Capital · Global Motor Trade International</p>
      <h1 className="mt-3 font-display text-4xl font-bold text-ink sm:text-5xl">
        Fleet Intelligence
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Industrial project pipeline and the economics moving it, week ending{" "}
        {formatWeek(edition.week_ending)}
      </p>

      <div className="rule-heavy mt-6" />

      <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-5">
        <StatBlock value={String(totals.leads)} label="Leads carried" />
        <StatBlock value={String(totals.priority)} label="Worth a call" accent />
        <StatBlock value={formatUsdM(totals.capexUsdM)} label="Capex tracked" />
        <StatBlock value={formatUnits(totals.unitsNow)} label="Units now" />
        <StatBlock value={formatUnits(totals.unitsNext12m)} label="Units 12m" />
      </div>

      <p className="mt-6 border-l-2 border-signal pl-4 text-sm leading-relaxed text-muted-foreground">
        Counts marked <span className="font-mono">est.</span> are modelled from project capex using
        GMTI&apos;s sector coefficients — an ordering signal for the sales team, not a forecast.
        {edition.stats.extractor ? ` Extractor: ${edition.stats.extractor}.` : ""}
        {edition.stats.docs_ingested
          ? ` ${edition.stats.docs_ingested} documents ingested, ${edition.stats.docs_relevant ?? 0} relevant.`
          : ""}
      </p>

      {regions.map((region) => (
        <section key={region.key} className="mt-14 scroll-mt-20" id={region.key}>
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-ink pb-2">
            <h2 className="font-display text-2xl font-semibold text-ink">{region.label}</h2>
            <span className="label-mono">
              {region.leads.length} leads ·{" "}
              {formatUsdM(region.pipeline_usd_m ?? 0)} pipeline · {region.docs_scanned ?? 0} docs
              scanned
            </span>
          </div>

          {region.macro_lines.map((line, index) => (
            <p key={index} className="mt-4 text-sm leading-relaxed text-ink">
              {line}
            </p>
          ))}

          {region.market_notes.length > 0 ? (
            <ul className="mt-4 space-y-1">
              {region.market_notes.map((note, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {note.url ? (
                    <a
                      href={note.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-signal hover:underline"
                    >
                      {note.title} ↗
                    </a>
                  ) : (
                    note.title
                  )}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-6 space-y-4">
            {region.leads.map((lead) => (
              <LeadCard key={`${lead.doc_id}-${lead.project_name.slice(0, 24)}`} lead={lead} />
            ))}
            {region.leads.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No grounded project events this week — macro backdrop only.
              </p>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}
