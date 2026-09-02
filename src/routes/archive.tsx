import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/EditionHeader";
import { supabase } from "@/integrations/supabase/client";
import { formatWeek, type EditionStats } from "@/lib/edition";

interface ArchiveRow {
  week_ending: string;
  generated_at: string;
  stats: EditionStats;
}

export const Route = createFileRoute("/archive")({
  head: () => ({
    meta: [
      { title: "Edition archive — GMTI Fleet Intelligence" },
      {
        name: "description",
        content:
          "Every past weekly GMTI Fleet Intelligence edition, with lead counts and coverage stats for each week.",
      },
      { property: "og:title", content: "Edition archive — GMTI Fleet Intelligence" },
      {
        property: "og:description",
        content: "Every past weekly GMTI Fleet Intelligence edition, week by week.",
      },
    ],
  }),
  loader: async () => {
    const { data, error } = await supabase
      .from("editions")
      .select("week_ending, generated_at, stats")
      .order("week_ending", { ascending: false })
      .limit(200);

    if (error) throw new Error(error.message);
    return { editions: (data ?? []) as unknown as ArchiveRow[] };
  },
  component: Archive,
});

function Archive() {
  const { editions } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-5 py-10">
        <p className="label-mono">Archive</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-ink">Every edition</h1>
        <div className="rule-heavy mt-6" />

        <ul className="mt-6 divide-y divide-border">
          {editions.map((edition) => (
            <li key={edition.week_ending}>
              <Link
                to="/editions/$week"
                params={{ week: edition.week_ending }}
                className="flex flex-wrap items-baseline justify-between gap-2 py-4 transition-colors hover:text-signal"
              >
                <span className="font-display text-lg font-semibold text-ink">
                  Week ending {formatWeek(edition.week_ending)}
                </span>
                <span className="label-mono">
                  {edition.stats?.leads ?? 0} leads · {edition.stats?.docs_relevant ?? 0} relevant
                  documents · {edition.stats?.extractor ?? "rules"}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {editions.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">No editions published yet.</p>
        ) : null}
      </div>
      <SiteFooter />
    </div>
  );
}
