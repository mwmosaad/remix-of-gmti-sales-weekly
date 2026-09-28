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

const SECRET_HEADERS = new Set(["x-gmti-token", "authorization", "cookie", "x-lovable-identity-token"]);

type LogEntry = {
  status_code: number;
  outcome: string;
  detail?: string;
  token_status: string;
  week_ending?: string;
  leads?: number;
};

async function logAttempt(request: Request, entry: LogEntry) {
  try {
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = SECRET_HEADERS.has(key.toLowerCase()) ? "[redacted]" : value.slice(0, 500);
    });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("ingest_log" as never).insert({
      ...entry,
      detail: entry.detail?.slice(0, 2000),
      source_ip:
        request.headers.get("cf-connecting-ip") ??
        request.headers.get("x-forwarded-for") ??
        request.headers.get("x-real-ip"),
      user_agent: request.headers.get("user-agent"),
      host: request.headers.get("host"),
      headers,
    } as never);
  } catch (error) {
    console.error("Failed to write ingest log", error);
  }
}

export const Route = createFileRoute("/api/public/editions/ingest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["GMTI_INGEST_TOKEN"];
        const provided =
          request.headers.get("x-gmti-token") ??
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
          "";
        const tokenStatus = !provided
          ? "missing"
          : !expected
            ? "server_unset"
            : timingSafeEqual(provided, expected)
              ? "valid"
              : "invalid";

        if (!expected) {
          await logAttempt(request, { status_code: 503, outcome: "rejected", detail: "token not configured on server", token_status: tokenStatus });
          return json({ error: "Ingest token is not configured on the server" }, 503);
        }
        if (tokenStatus !== "valid") {
          await logAttempt(request, { status_code: 401, outcome: "rejected", detail: "unauthorized", token_status: tokenStatus });
          return json({ error: "Unauthorized" }, 401);
        }

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          await logAttempt(request, { status_code: 400, outcome: "rejected", detail: "invalid JSON body", token_status: tokenStatus });
          return json({ error: "Body must be valid JSON" }, 400);
        }

        const parsed = editionSchema.safeParse(raw);
        if (!parsed.success) {
          await logAttempt(request, {
            status_code: 400,
            outcome: "rejected",
            detail: `invalid payload: ${JSON.stringify(parsed.error.issues.slice(0, 5))}`,
            token_status: tokenStatus,
          });
          return json({ error: "Invalid edition payload", issues: parsed.error.issues }, 400);
        }

        const edition = parsed.data;
        const leads = edition.regions.reduce((sum, region) => sum + region.leads.length, 0);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { error } = await supabaseAdmin.from("editions").upsert(
          {
            week_ending: edition.week_ending,
            generated_at: edition.generated_at,
            stats: edition.stats as unknown as never,
            payload: edition as unknown as never,
            received_at: new Date().toISOString(),
          },
          { onConflict: "week_ending" },
        );

        if (error) {
          console.error("Failed to store edition", error);
          await logAttempt(request, { status_code: 500, outcome: "failed", detail: `store error: ${error.message}`, token_status: tokenStatus, week_ending: edition.week_ending, leads });
          return json({ error: "Failed to store edition" }, 500);
        }

        await logAttempt(request, { status_code: 200, outcome: "published", token_status: tokenStatus, week_ending: edition.week_ending, leads });
        return json({ ok: true, week_ending: edition.week_ending, regions: edition.regions.length, leads });
      },
    },
  },
});
