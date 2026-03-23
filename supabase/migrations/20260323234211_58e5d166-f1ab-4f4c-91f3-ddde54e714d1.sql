
CREATE TABLE public.vehicle_companions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  companion_id UUID NOT NULL REFERENCES public.companions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  company_name TEXT DEFAULT ''::text,
  UNIQUE(vehicle_id, companion_id)
);

ALTER TABLE public.vehicle_companions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can manage vehicle companions"
ON public.vehicle_companions FOR ALL TO authenticated
USING (
  (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can view own company vehicle companions"
ON public.vehicle_companions FOR SELECT TO authenticated
USING (
  company_name = get_user_company(auth.uid())
  OR has_role(auth.uid(), 'super_admin'::app_role)
);
