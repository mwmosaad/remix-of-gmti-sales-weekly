import { createFileRoute, notFound } from "@tanstack/react-router";

import { EditionView } from "@/components/EditionView";
import { SiteFooter, SiteHeader } from "@/components/EditionHeader";
import { supabase } from "@/integrations/supabase/client";
import { formatWeek, type EditionPayload } from "@/lib/edition";
import { seedEdition } from "@/lib/seed-edition";

export const Route = createFileRoute("/editions/$week")({
  head: ({ params }) => ({
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
  const { edition } = Route.useLoaderData() as { edition: EditionPayload };

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
