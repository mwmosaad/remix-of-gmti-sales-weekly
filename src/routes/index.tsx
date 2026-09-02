import { createFileRoute, Link } from "@tanstack/react-router";

import { EditionView } from "@/components/EditionView";
import { SiteFooter, SiteHeader } from "@/components/EditionHeader";
import { supabase } from "@/integrations/supabase/client";
import type { EditionPayload } from "@/lib/edition";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GMTI Fleet Intelligence — This week's edition" },
      {
        name: "description",
        content:
          "This week's GMTI Fleet Intelligence brief: industrial project leads, named contacts, capex and indicative fleet requirement across nine regions.",
      },
      { property: "og:title", content: "GMTI Fleet Intelligence — This week's edition" },
      {
        property: "og:description",
        content:
          "Industrial project leads, named contacts, capex and indicative fleet requirement across nine regions.",
      },
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
    return { edition: (data?.payload as unknown as EditionPayload) ?? null };
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
