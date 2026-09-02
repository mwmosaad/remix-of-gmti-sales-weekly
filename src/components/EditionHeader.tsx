import { Link } from "@tanstack/react-router";

import { SubscribeForm } from "@/components/SubscribeForm";

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
    <SubscribeForm />
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto max-w-5xl px-5 py-8 text-xs leading-relaxed text-muted-foreground">
        <p className="label-mono mb-2">GMTI Capital · Global Motor Trade International</p>
        <p>
          Unit counts marked <span className="font-mono not-italic">est.</span> are modelled from
          project capex using GMTI&apos;s sector coefficients, not stated by the source. Every
          company, contact and figure carries the source span it was extracted from; anything that
          could not be grounded in the source text was dropped before publication.
        </p>
        <p className="mt-3">
          Editions are rebuilt automatically each Monday from the fleet-intelligence pipeline.
        </p>
      </div>
    </footer>
    </>
  );
}
