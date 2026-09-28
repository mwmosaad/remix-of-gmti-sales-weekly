CREATE TABLE public.ingest_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  received_at timestamptz NOT NULL DEFAULT now(),
  status_code int NOT NULL,
  outcome text NOT NULL,
  detail text,
  token_status text NOT NULL,
  source_ip text,
  user_agent text,
  host text,
  headers jsonb NOT NULL DEFAULT '{}'::jsonb,
  week_ending text,
  leads int
);
GRANT ALL ON public.ingest_log TO service_role;
ALTER TABLE public.ingest_log ENABLE ROW LEVEL SECURITY;