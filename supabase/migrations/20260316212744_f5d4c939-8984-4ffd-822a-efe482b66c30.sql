
-- Custom alerts table for dashboard alert creation
CREATE TABLE public.custom_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_name text,
  alert_type text NOT NULL DEFAULT 'other',
  title text NOT NULL,
  description text,
  alert_date timestamptz NOT NULL,
  recurrence text DEFAULT 'none',
  recurrence_interval integer,
  is_active boolean DEFAULT true,
  next_trigger_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.custom_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own alerts" ON public.custom_alerts
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admins can view all alerts" ON public.custom_alerts
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Vehicle new fields: leasing, insurance cost, no-claims
ALTER TABLE public.vehicles 
  ADD COLUMN IF NOT EXISTS is_leasing boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS leasing_end_date text,
  ADD COLUMN IF NOT EXISTS insurance_cost numeric,
  ADD COLUMN IF NOT EXISTS has_no_claims boolean DEFAULT false;
