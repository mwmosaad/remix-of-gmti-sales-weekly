import { Link } from "@tanstack/react-router";


export function SiteHeader() {
  return (
    <header className="border-b border-border bg-paper">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-lg font-bold tracking-tight text-ink">GMTI</span>
          <span className="label-mono">Fleet Intelligence</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link
            to="/"
            className="text-muted-foreground transition-colors hover:text-signal"
            activeProps={{ className: "text-ink font-semibold" }}
            activeOptions={{ exact: true }}
          >
            This week
          </Link>
          <Link
            to="/archive"
            className="text-muted-foreground transition-colors hover:text-signal"
            activeProps={{ className: "text-ink font-semibold" }}
          >
            Archive
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <>
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto max-w-5xl px-5 py-8 text-xs leading-relaxed text-muted-foreground">
        <p className="label-mono mb-2">GMTI Capital · Global Motor Trade International</p>
        <p>
          Leads are open public vehicle tenders from TED (EU) and World Bank procurement notices,
          with buyer contacts as published in each notice. Headlines are machine-translated to
          English; vehicle specs are taken only from what the notice states. Market news is
          screened for relevance to vehicle sales.
        </p>
        <p className="mt-3">
          Editions are rebuilt and published automatically every Monday at 08:00 New York time
          (EST/EDT) from the fleet-intelligence pipeline.
        </p>
      </div>
    </footer>
    </>
  );
}
