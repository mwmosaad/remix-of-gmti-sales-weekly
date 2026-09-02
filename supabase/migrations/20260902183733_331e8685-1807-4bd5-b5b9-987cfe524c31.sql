CREATE TABLE public.editions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_ending date NOT NULL UNIQUE,
  generated_at timestamptz NOT NULL DEFAULT now(),
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  payload jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX editions_week_ending_idx ON public.editions (week_ending DESC);

GRANT SELECT ON public.editions TO anon;
GRANT SELECT ON public.editions TO authenticated;
GRANT ALL ON public.editions TO service_role;

ALTER TABLE public.editions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editions are publicly readable"
  ON public.editions FOR SELECT
  TO anon, authenticated
  USING (true);