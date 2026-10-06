import { createFileRoute, Link } from "@tanstack/react-router";

import { EditionView } from "@/components/EditionView";
import { SiteFooter, SiteHeader } from "@/components/EditionHeader";
import { supabase } from "@/integrations/supabase/client";
import type { EditionPayload } from "@/lib/edition";
import { seedEdition } from "@/lib/seed-edition";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GMTI Fleet Intelligence" },
      { name: "description", content: "Open public vehicle tenders with buyer contacts and bid deadlines, plus regional fleet market news. Updated every Monday." },
      { property: "og:title", content: "GMTI Fleet Intelligence" },
      { property: "og:description", content: "Open public vehicle tenders with buyer contacts and bid deadlines, plus regional fleet market news. Updated every Monday." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "GMTI Fleet Intelligence" },
      { name: "twitter:description", content: "Open public vehicle tenders with buyer contacts and bid deadlines, plus regional fleet market news. Updated every Monday." },
    ],
  }),
  loader: async () => {
    const { data, error } = await supabase
      .from("editions")
      .select("week_ending, payload")
      .order("week_ending", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    const edition = (data?.payload as unknown as EditionPayload) ?? null;
    if (edition) return { edition };
    return { edition: seedEdition as EditionPayload | null };
  },
  component: Index,
});

function Index() {
  const { edition } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      {edition ? (
        <EditionView edition={edition} />
      ) : (
        <div className="mx-auto max-w-2xl px-5 py-24 text-center">
          <p className="label-mono">No edition published yet</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-ink">
            Waiting on the first weekly run
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The pipeline posts each Monday edition automatically. Past editions appear in the{" "}
            <Link to="/archive" className="text-signal underline underline-offset-2">
              archive
            </Link>
            .
          </p>
        </div>
      )}
      <SiteFooter />
    </div>
  );
}
