import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string(),
  title: z.string().optional(),
  organization: z.string().optional(),
  email: z.string().optional(),
  channel: z.string().optional(),
  evidence: z.string().optional(),
});

const leadSchema = z
  .object({
    doc_id: z.string(),
    region: z.string(),
    project_name: z.string(),
    companies: z.array(z.record(z.string(), z.unknown())).default([]),
    contacts: z.array(contactSchema).default([]),
    vehicle_lines: z.array(z.record(z.string(), z.unknown())).default([]),
  })
  .passthrough();

const regionSchema = z
  .object({
    key: z.string(),
    label: z.string(),
    macro_lines: z.array(z.string()).default([]),
    market_notes: z.array(z.record(z.string(), z.unknown())).default([]),
    leads: z.array(leadSchema).default([]),
  })
  .passthrough();

const editionSchema = z
  .object({
    week_ending: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "week_ending must be YYYY-MM-DD"),
    generated_at: z.string(),
    stats: z.record(z.string(), z.unknown()).default({}),
    regions: z.array(regionSchema).min(1, "an edition must contain at least one region"),
  })
  .passthrough();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const timingSafeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

export const Route = createFileRoute("/api/public/editions/ingest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["GMTI_INGEST_TOKEN"];
        if (!expected) {
          return json({ error: "Ingest token is not configured on the server" }, 503);
        }

        const provided =
          request.headers.get("x-gmti-token") ??
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
          "";

        if (!provided || !timingSafeEqual(provided, expected)) {
          return json({ error: "Unauthorized" }, 401);
        }

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return json({ error: "Body must be valid JSON" }, 400);
        }

        const parsed = editionSchema.safeParse(raw);
        if (!parsed.success) {
          return json({ error: "Invalid edition payload", issues: parsed.error.issues }, 400);
        }

        const edition = parsed.data;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { error } = await supabaseAdmin.from("editions").upsert(
          {
            week_ending: edition.week_ending,
            generated_at: edition.generated_at,
            stats: edition.stats,
            payload: edition,
            received_at: new Date().toISOString(),
          },
          { onConflict: "week_ending" },
        );

        if (error) {
          console.error("Failed to store edition", error);
          return json({ error: "Failed to store edition" }, 500);
        }

        const leads = edition.regions.reduce((sum, region) => sum + region.leads.length, 0);
        return json({ ok: true, week_ending: edition.week_ending, regions: edition.regions.length, leads });
      },
    },
  },
});
