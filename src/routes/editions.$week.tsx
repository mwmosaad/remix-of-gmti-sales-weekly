import { createFileRoute, notFound } from "@tanstack/react-router";

import { EditionView } from "@/components/EditionView";
import { SiteFooter, SiteHeader } from "@/components/EditionHeader";
import { supabase } from "@/integrations/supabase/client";
import { formatWeek, type EditionPayload } from "@/lib/edition";
import { seedEdition } from "@/lib/seed-edition";

export const Route = createFileRoute("/editions/$week")({
  head: ({ params }) => ({
    meta: [
      { title: `Week ending ${params.week} — GMTI Fleet Intelligence` },
      {
        name: "description",
        content: `GMTI Fleet Intelligence edition for the week ending ${params.week}: project leads, contacts, capex and fleet requirement by region.`,
      },
      { property: "og:title", content: `Week ending ${params.week} — GMTI Fleet Intelligence` },
      {
        property: "og:description",
        content: `Project leads, contacts, capex and fleet requirement by region for the week ending ${params.week}.`,
      },
    ],
  }),
  loader: async ({ params }): Promise<{ edition: EditionPayload }> => {
    const { data, error } = await supabase
      .from("editions")
      .select("week_ending, payload")
      .eq("week_ending", params.week)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (data) return { edition: data.payload as unknown as EditionPayload };
    if (params.week === seedEdition.week_ending) return { edition: seedEdition };
    throw notFound();
  },
  component: EditionPage,
});

function EditionPage() {
  const { edition } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-5 pt-8">
        <p className="label-mono">Archived edition · {formatWeek(edition.week_ending)}</p>
      </div>
      <EditionView edition={edition} />
      <SiteFooter />
    </div>
  );
}
