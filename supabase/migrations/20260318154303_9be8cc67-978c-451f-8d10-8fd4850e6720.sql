
CREATE TABLE public.prediction_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  rows_analyzed INTEGER NOT NULL DEFAULT 0,
  overall_risk INTEGER NOT NULL DEFAULT 0,
  cost_savings_estimate TEXT,
  summary TEXT NOT NULL,
  critical_alerts JSONB NOT NULL DEFAULT '[]'::jsonb,
  patterns JSONB NOT NULL DEFAULT '[]'::jsonb,
  machines JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prediction_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert prediction results"
  ON public.prediction_results FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read prediction results"
  ON public.prediction_results FOR SELECT
  USING (true);
