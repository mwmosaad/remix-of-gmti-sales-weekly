import {
  bandColor,
  formatCapex,
  formatUnits,
  stageLabel,
  type Lead,
} from "@/lib/edition";

export function LeadCard({ lead }: { lead: Lead }) {
  const capex = formatCapex(lead.investment);
  const buyer = lead.companies.find((company) => company.role !== "financier");
  const modelled = lead.vehicle_lines.some((line) => line.basis === "modelled");

  return (
    <article className="border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-widest text-primary-foreground"
          style={{ backgroundColor: bandColor(lead.band) }}
        >
          BAND {lead.band ?? "—"}
        </span>
        <span className="label-mono">{lead.country ?? "Region-wide"}</span>
        <span className="label-mono">· {lead.project_type_label ?? "Unclassified"}</span>
        <span className="label-mono">· {stageLabel(lead.stage)}</span>
        {lead.published ? <span className="label-mono">· {lead.published}</span> : null}
      </div>

      <h3 className="mt-3 font-display text-base leading-snug font-semibold text-ink">
        {lead.source_title ?? lead.project_name}
      </h3>

      {lead.source_title ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{lead.project_name}</p>
      ) : null}

      <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
        <div>
          <dt className="label-mono">Capex</dt>
          <dd className="font-display text-lg font-semibold text-ink">{capex ?? "Not disclosed"}</dd>
        </div>
        <div>
          <dt className="label-mono">Units now {modelled ? "(est.)" : ""}</dt>
          <dd className="font-display text-lg font-semibold text-ink">
            {formatUnits(lead.units_now)}
          </dd>
        </div>
        <div>
          <dt className="label-mono">Units 12m {modelled ? "(est.)" : ""}</dt>
          <dd className="font-display text-lg font-semibold text-ink">
            {formatUnits(lead.units_next_12m)}
          </dd>
        </div>
        <div>
          <dt className="label-mono">Counterparty</dt>
          <dd className="text-sm font-medium text-ink">
            {buyer?.name ?? lead.primary_company ?? "Not named in source"}
          </dd>
        </div>
      </dl>

      {lead.vehicle_lines.length > 0 ? (
        <div className="mt-4">
          <p className="label-mono mb-2">Indicative fleet requirement</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {lead.vehicle_lines.map((line) => (
              <li key={line.vehicle_class} className="flex justify-between gap-4">
                <span>{line.label}</span>
                <span className="shrink-0 font-mono text-xs text-ink">
                  {formatUnits(line.units_now)} now · {formatUnits(line.units_next_12m)} 12m
                  {line.basis === "modelled" ? " est." : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {lead.contacts.length > 0 ? (
        <div className="mt-4 border-t border-border pt-4">
          <p className="label-mono mb-2">Named contacts</p>
          <ul className="space-y-1 text-sm">
            {lead.contacts.map((contact, index) => (
              <li key={`${contact.name}-${index}`} className="text-ink">
                <span className="font-medium">{contact.name}</span>
                {contact.title ? (
                  <span className="text-muted-foreground"> — {contact.title}</span>
                ) : null}
                {contact.email ? (
                  <a
                    href={`mailto:${contact.email}`}
                    className="ml-2 text-signal underline underline-offset-2"
                  >
                    {contact.email}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3">
        {lead.investment?.financier ? (
          <span className="label-mono">
            Financier: {lead.investment.financier}
            {lead.investment.financing_type ? ` (${lead.investment.financing_type})` : ""}
          </span>
        ) : null}
        {lead.source_url ? (
          <a
            href={lead.source_url}
            target="_blank"
            rel="noreferrer"
            className="label-mono text-signal hover:underline"
          >
            Source ↗
          </a>
        ) : null}
      </div>
    </article>
  );
}
