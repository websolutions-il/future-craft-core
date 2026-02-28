
CREATE TABLE public.trip_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL,
  driver_id UUID NOT NULL,
  trip_date DATE NOT NULL DEFAULT CURRENT_DATE,
  started_at TIMESTAMPTZ DEFAULT NULL,
  ended_at TIMESTAMPTZ DEFAULT NULL,
  start_lat NUMERIC DEFAULT NULL,
  start_lng NUMERIC DEFAULT NULL,
  end_lat NUMERIC DEFAULT NULL,
  end_lng NUMERIC DEFAULT NULL,
  start_address TEXT DEFAULT '',
  end_address TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  company_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_logs ENABLE ROW LEVEL SECURITY;

-- Drivers can view their own trip logs
CREATE POLICY "Drivers can view own trip logs"
  ON public.trip_logs FOR SELECT
  USING (driver_id = auth.uid());

-- Drivers can insert their own trip logs
CREATE POLICY "Drivers can insert own trip logs"
  ON public.trip_logs FOR INSERT
  WITH CHECK (driver_id = auth.uid());

-- Drivers can update their own trip logs
CREATE POLICY "Drivers can update own trip logs"
  ON public.trip_logs FOR UPDATE
  USING (driver_id = auth.uid());

-- Managers can view company trip logs
CREATE POLICY "Managers can view company trip logs"
  ON public.trip_logs FOR SELECT
  USING (
    (company_name = get_user_company(auth.uid()) AND has_role(auth.uid(), 'fleet_manager'::app_role))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );
