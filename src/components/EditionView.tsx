import { LeadCard } from "@/components/LeadCard";
import {
  allLeads,
  daysUntil,
  editionTotals,
  formatUnits,
  formatUsdM,
  formatWeek,
  nextPublication,
  type EditionPayload,
} from "@/lib/edition";


function ClosingSoon({ edition }: { edition: EditionPayload }) {
  const soon = allLeads(edition)
    .map((lead) => ({ lead, days: daysUntil(lead.offer_expires) }))
    .filter((x) => x.days !== null && x.days >= 0 && x.days <= 7)
    .sort((a, b) => (a.days ?? 0) - (b.days ?? 0));
  if (soon.length === 0) return null;
  return (
    <section className="mt-10 border-2 border-signal bg-card p-5" id="closing-soon">
      <h2 className="font-display text-xl font-semibold text-ink">
        Closing this week <span className="label-mono ml-2">{soon.length} tenders</span>
      </h2>
      <ul className="mt-3 divide-y divide-border">
        {soon.map(({ lead, days }, i) => {
          const buyer =
            lead.companies.find((c) => c.role !== "financier")?.name ?? lead.primary_company;
          return (
            <li
              key={`${lead.doc_id}-${i}`}
              className="grid grid-cols-[5.5rem_6rem_minmax(0,1fr)_auto] items-baseline gap-x-3 py-1.5 text-sm"
            >
              <span className="font-mono text-xs font-semibold text-signal">
                {days === 0 ? "TODAY" : `${days}D · ${lead.offer_expires?.slice(5)}`}
              </span>
              <span className="label-mono truncate">{lead.country}</span>
              <span className="min-w-0 line-clamp-2 text-ink" title={`${buyer} — ${lead.source_title ?? lead.project_name}`}>
                {lead.source_title ?? lead.project_name}
                <span className="text-muted-foreground"> · {buyer}</span>
              </span>
              {lead.source_url ? (
                <a href={lead.source_url} target="_blank" rel="noreferrer" className="label-mono text-signal">
                  Source ↗
                </a>
              ) : <span />}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

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
  // Only actionable content: drop closed tenders, then drop regions that
  // have neither live leads nor market news.
  const live: EditionPayload = {
    ...edition,
    regions: edition.regions.map((region) => ({
      ...region,
      leads: region.leads.filter((lead) => {
        const d = daysUntil(lead.offer_expires);
        return d === null || d >= 0;
      }),
    })),
  };
  const totals = editionTotals(live);
  const closingWeek = allLeads(live).filter((l) => {
    const d = daysUntil(l.offer_expires);
    return d !== null && d >= 0 && d <= 7;
  }).length;
  const regions = live.regions.filter(
    (region) => region.leads.length > 0 || region.market_notes.length > 0,
  );

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <p className="label-mono">GMTI Capital · Global Motor Trade International</p>
      <h1 className="mt-3 font-display text-4xl font-bold text-ink sm:text-5xl">
        Fleet Intelligence
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Open vehicle tenders and fleet market news, week ending{" "}
        {formatWeek(edition.week_ending)}
      </p>
      <p className="label-mono mt-2">
        Latest published edition · next run {nextPublication(edition.week_ending)}, 08:00 New York
      </p>

      <div className="rule-heavy mt-6" />


      <div className="mt-6 grid grid-cols-3 gap-6">
        <StatBlock value={String(totals.leads)} label="Open leads" />
        <StatBlock value={String(closingWeek)} label="Closing ≤7 days" accent />
        <StatBlock value={String(totals.priority)} label="Act now (≤21d)" />
      </div>



      <ClosingSoon edition={live} />

      {regions.map((region) => (
        <section key={region.key} className="mt-14 scroll-mt-20" id={region.key}>
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-ink pb-2">
            <h2 className="font-display text-2xl font-semibold text-ink">{region.label}</h2>
            <span className="label-mono">{region.leads.length} open leads</span>
          </div>


          {region.market_notes.length > 0 ? (
            <ul className="mt-4 space-y-1">
              <li className="label-mono mb-1">Market news</li>
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
            {(() => {
              const docCounts = new Map<string, number>();
              region.leads.forEach((lead) => {
                docCounts.set(lead.doc_id, (docCounts.get(lead.doc_id) ?? 0) + 1);
              });
              return region.leads.map((lead) => (
                <LeadCard
                  key={`${lead.doc_id}-${lead.project_name.slice(0, 24)}`}
                  lead={lead}
                  sharesSource={(docCounts.get(lead.doc_id) ?? 1) > 1}
                />
              ));
            })()}

          </div>
        </section>
      ))}
    </div>
  );
}
