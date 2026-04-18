-- Voice automation triggers/scenarios
CREATE TABLE IF NOT EXISTS public.voice_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- 'fault_created', 'service_order_created', 'service_completed', 'license_expiring', 'test_expiring', 'manual'
  trigger_config JSONB DEFAULT '{}'::jsonb, -- e.g. {days_before: 7, urgency_min: 'urgent'}
  flow_type TEXT NOT NULL DEFAULT 'inbound_general', -- which voice_prompt to use
  target_audience TEXT NOT NULL DEFAULT 'driver', -- 'driver', 'customer', 'manager', 'custom'
  custom_phone TEXT,
  custom_message TEXT,
  is_active BOOLEAN DEFAULT true,
  delay_minutes INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.voice_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scenarios_select" ON public.voice_scenarios FOR SELECT
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR (public.has_role(auth.uid(), 'fleet_manager') AND company_name = public.get_user_company(auth.uid()))
  );

CREATE POLICY "scenarios_insert" ON public.voice_scenarios FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin')
    OR (public.has_role(auth.uid(), 'fleet_manager') AND company_name = public.get_user_company(auth.uid()))
  );

CREATE POLICY "scenarios_update" ON public.voice_scenarios FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR (public.has_role(auth.uid(), 'fleet_manager') AND company_name = public.get_user_company(auth.uid()))
  );

CREATE POLICY "scenarios_delete" ON public.voice_scenarios FOR DELETE
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR (public.has_role(auth.uid(), 'fleet_manager') AND company_name = public.get_user_company(auth.uid()))
  );

CREATE TRIGGER update_voice_scenarios_updated_at
  BEFORE UPDATE ON public.voice_scenarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Log of scenario executions (queue)
CREATE TABLE IF NOT EXISTS public.voice_scenario_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID REFERENCES public.voice_scenarios(id) ON DELETE CASCADE,
  company_name TEXT,
  trigger_entity_type TEXT, -- 'fault', 'service_order', etc.
  trigger_entity_id UUID,
  target_phone TEXT,
  target_name TEXT,
  context JSONB DEFAULT '{}'::jsonb,
  scheduled_at TIMESTAMPTZ DEFAULT now(),
  executed_at TIMESTAMPTZ,
  call_log_id UUID,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, executed, failed, skipped
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.voice_scenario_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "runs_select" ON public.voice_scenario_runs FOR SELECT
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR (public.has_role(auth.uid(), 'fleet_manager') AND company_name = public.get_user_company(auth.uid()))
  );

CREATE POLICY "runs_insert" ON public.voice_scenario_runs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "runs_update" ON public.voice_scenario_runs FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR (public.has_role(auth.uid(), 'fleet_manager') AND company_name = public.get_user_company(auth.uid()))
  );

-- Trigger function: when fault created, queue scenarios
CREATE OR REPLACE FUNCTION public.queue_voice_scenarios_on_fault()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  s RECORD;
  driver_phone TEXT;
BEGIN
  -- Look up driver phone
  SELECT phone INTO driver_phone FROM public.drivers WHERE full_name = NEW.driver_name AND company_name = NEW.company_name LIMIT 1;
  
  FOR s IN
    SELECT * FROM public.voice_scenarios
    WHERE is_active = true
      AND trigger_type = 'fault_created'
      AND (company_name = NEW.company_name OR company_name IS NULL)
  LOOP
    INSERT INTO public.voice_scenario_runs (scenario_id, company_name, trigger_entity_type, trigger_entity_id, target_phone, target_name, context, scheduled_at)
    VALUES (
      s.id, NEW.company_name, 'fault', NEW.id,
      COALESCE(s.custom_phone, driver_phone),
      NEW.driver_name,
      jsonb_build_object('vehicle_plate', NEW.vehicle_plate, 'description', NEW.description, 'urgency', NEW.urgency),
      now() + (s.delay_minutes || ' minutes')::interval
    );
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_voice_scenarios_fault ON public.faults;
CREATE TRIGGER trg_voice_scenarios_fault
  AFTER INSERT ON public.faults
  FOR EACH ROW EXECUTE FUNCTION public.queue_voice_scenarios_on_fault();

-- Trigger function: when service order created
CREATE OR REPLACE FUNCTION public.queue_voice_scenarios_on_service_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  s RECORD;
BEGIN
  FOR s IN
    SELECT * FROM public.voice_scenarios
    WHERE is_active = true
      AND trigger_type IN ('service_order_created', 'service_completed')
      AND (company_name = NEW.company_name OR company_name IS NULL)
  LOOP
    -- service_completed only when treatment_status changes to completed
    IF s.trigger_type = 'service_completed' AND NEW.treatment_status != 'completed' THEN
      CONTINUE;
    END IF;
    IF s.trigger_type = 'service_order_created' AND TG_OP != 'INSERT' THEN
      CONTINUE;
    END IF;

    INSERT INTO public.voice_scenario_runs (scenario_id, company_name, trigger_entity_type, trigger_entity_id, target_phone, target_name, context, scheduled_at)
    VALUES (
      s.id, NEW.company_name, 'service_order', NEW.id,
      COALESCE(s.custom_phone, NEW.driver_phone),
      NEW.driver_name,
      jsonb_build_object('vehicle_plate', NEW.vehicle_plate, 'description', NEW.description, 'service_date', NEW.service_date),
      now() + (s.delay_minutes || ' minutes')::interval
    );
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_voice_scenarios_service_order_ins ON public.service_orders;
CREATE TRIGGER trg_voice_scenarios_service_order_ins
  AFTER INSERT ON public.service_orders
  FOR EACH ROW EXECUTE FUNCTION public.queue_voice_scenarios_on_service_order();

DROP TRIGGER IF EXISTS trg_voice_scenarios_service_order_upd ON public.service_orders;
CREATE TRIGGER trg_voice_scenarios_service_order_upd
  AFTER UPDATE OF treatment_status ON public.service_orders
  FOR EACH ROW EXECUTE FUNCTION public.queue_voice_scenarios_on_service_order();

CREATE INDEX IF NOT EXISTS idx_scenario_runs_pending ON public.voice_scenario_runs(status, scheduled_at) WHERE status = 'pending';