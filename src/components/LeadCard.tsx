import {
  bandColor,
  daysUntil,
  formatCapex,
  formatUnits,
  stageLabel,
  type Lead,
} from "@/lib/edition";

export function LeadCard({ lead, sharesSource = false }: { lead: Lead; sharesSource?: boolean }) {
  const capex = formatCapex(lead.investment);
  const buyer = lead.companies.find((company) => company.role !== "financier");
  const modelled = lead.vehicle_lines.some((line) => line.basis === "modelled");
  const counterpartyLabel = buyer?.name ?? lead.primary_company ?? "Unnamed counterparty";
  const daysLeft = daysUntil(lead.offer_expires);
  // For tenders the official category ('Fire engines', 'Electric buses') sits
  // between the dashes in the title; the pipeline's sector guess was wrong
  // ('Rail & corridor construction' on a city van tender).
  const titleParts = (lead.source_title_original || lead.source_title || "").split(" – ");
  const category =
    lead.stage === "procurement" && titleParts.length >= 3
      ? titleParts[1]
      : (lead.project_type_label ?? "Unclassified");
  const norm = (t?: string) => (t ?? "").replace(/\s+/g, " ").trim().toLowerCase();
  const redundantSubtitle =
    !lead.source_title ||
    norm(lead.source_title).includes(norm(lead.project_name).slice(0, 60)) ||
    norm(lead.source_title_original).includes(norm(lead.project_name).slice(0, 60));
  const model =
    lead.equipment_models && lead.equipment_models.length > 0
      ? lead.equipment_models.join(", ")
      : lead.vehicle_spec || "";
  const lead_contact = lead.contacts[0];
  const otherContacts = lead.contacts.slice(1);
  const hasCapex = Boolean(capex) && !/^\$0(\.0)?m$/i.test(capex ?? "");
  const unitsNow = lead.units_now ?? 0;
  const units12 = lead.units_next_12m ?? 0;
  const liveLines = lead.vehicle_lines.filter(
    (l) => (l.units_now ?? 0) > 0 || (l.units_next_12m ?? 0) > 0,
  );
  const urgent = daysLeft !== null && daysLeft <= 7;

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
        <span className="label-mono">· {category}</span>
        <span className="label-mono">· {stageLabel(lead.stage)}</span>
        {lead.published ? <span className="label-mono">· {lead.published}</span> : null}
        {lead.offer_expires ? (
          <span
            className={`ml-auto px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-widest ${
              urgent ? "text-primary-foreground" : "border border-border text-ink"
            }`}
            style={urgent ? { backgroundColor: bandColor("A") } : undefined}
          >
            {daysLeft !== null && daysLeft < 0
              ? `CLOSED ${lead.offer_expires}`
              : daysLeft === 0
                ? "CLOSES TODAY"
                : `CLOSES ${lead.offer_expires}${daysLeft !== null ? ` · ${daysLeft}D` : ""}`}
          </span>
        ) : null}
      </div>

      {sharesSource ? (
        <>
          <h3 className="mt-3 font-display text-base leading-snug font-semibold text-ink">
            {counterpartyLabel}
            {capex ? ` — ${capex}` : ""}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {lead.project_name}
          </p>
          {lead.source_title ? (
            <p className="mt-1 label-mono text-muted-foreground">
              From: {lead.source_title}
            </p>
          ) : null}
        </>
      ) : (
        <>
          <h3 className="mt-3 font-display text-base leading-snug font-semibold text-ink">
            {lead.source_title ?? lead.project_name}
          </h3>

          {!redundantSubtitle ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {lead.project_name}
            </p>
          ) : null}
        </>
      )}

      {lead_contact ? (
        <p className="mt-2 text-sm text-ink">
          <span className="label-mono mr-2">Contact</span>
          <span className="font-medium">{lead_contact.name}</span>
          {lead_contact.email ? (
            <>
              {" · "}
              <a
                href={`mailto:${lead_contact.email}`}
                className="text-signal underline underline-offset-2"
              >
                {lead_contact.email}
              </a>
            </>
          ) : null}
        </p>
      ) : null}

      <dl className="mt-4 flex flex-wrap gap-x-10 gap-y-3 border-t border-border pt-4">
        {hasCapex ? (
          <div>
            <dt className="label-mono">Value</dt>
            <dd className="font-display text-lg font-semibold text-ink">{capex}</dd>
          </div>
        ) : null}
        {model ? (
          <div>
            <dt className="label-mono">Model</dt>
            <dd className="text-sm font-medium text-ink">{model}</dd>
          </div>
        ) : null}
        {unitsNow > 0 ? (
          <div>
            <dt className="label-mono">Units now {modelled ? "(est.)" : ""}</dt>
            <dd className="font-display text-lg font-semibold text-ink">{formatUnits(unitsNow)}</dd>
          </div>
        ) : null}
        {units12 > 0 ? (
          <div>
            <dt className="label-mono">Units 12m {modelled ? "(est.)" : ""}</dt>
            <dd className="font-display text-lg font-semibold text-ink">{formatUnits(units12)}</dd>
          </div>
        ) : null}
        <div>
          <dt className="label-mono">Buyer</dt>
          <dd className="text-sm font-medium text-ink">
            {buyer?.name ?? lead.primary_company ?? "Not named in source"}
          </dd>
        </div>
      </dl>

      {liveLines.length > 0 ? (
        <div className="mt-4">
          <p className="label-mono mb-2">Indicative fleet requirement</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {liveLines.map((line) => (
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



      {otherContacts.length > 0 ? (
        <div className="mt-4 border-t border-border pt-4">
          <p className="label-mono mb-2">Other contacts</p>
          <ul className="space-y-1 text-sm">
            {otherContacts.map((contact, index) => (
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
