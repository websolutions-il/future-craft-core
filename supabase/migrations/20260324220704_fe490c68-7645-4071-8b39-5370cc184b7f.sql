
-- 1. Add internal_number to vehicles
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS internal_number text DEFAULT '';

-- 2. Add id_number to drivers
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS id_number text DEFAULT '';

-- 3. Add archived status support - no schema change needed, using existing status field

-- 4. Create vehicle_inspections table for periodic inspections
CREATE TABLE public.vehicle_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL,
  vehicle_plate text DEFAULT '',
  inspection_type text DEFAULT 'semi_annual',
  inspection_date date DEFAULT CURRENT_DATE,
  inspector_name text DEFAULT '',
  overall_status text DEFAULT 'passed',
  notes text DEFAULT '',
  company_name text DEFAULT '',
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.vehicle_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company inspections" ON public.vehicle_inspections
  FOR SELECT TO authenticated
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Managers can manage inspections" ON public.vehicle_inspections
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

-- 5. Create inspection_items table for checklist items
CREATE TABLE public.inspection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid REFERENCES public.vehicle_inspections(id) ON DELETE CASCADE NOT NULL,
  item_name text NOT NULL DEFAULT '',
  status text DEFAULT 'ok',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.inspection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view inspection items" ON public.inspection_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.vehicle_inspections vi 
    WHERE vi.id = inspection_id 
    AND (vi.company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))
  ));

CREATE POLICY "Managers can manage inspection items" ON public.inspection_items
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.vehicle_inspections vi 
    WHERE vi.id = inspection_id 
    AND (has_role(auth.uid(), 'fleet_manager'::app_role) AND vi.company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.vehicle_inspections vi 
    WHERE vi.id = inspection_id 
    AND (has_role(auth.uid(), 'fleet_manager'::app_role) AND vi.company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))
  ));

-- 6. Create follow-up tasks table for inspection defects
CREATE TABLE public.vehicle_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid,
  vehicle_plate text DEFAULT '',
  inspection_id uuid REFERENCES public.vehicle_inspections(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  status text DEFAULT 'open',
  resolved_at timestamptz,
  resolved_by uuid,
  resolved_by_name text DEFAULT '',
  company_name text DEFAULT '',
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.vehicle_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company tasks" ON public.vehicle_tasks
  FOR SELECT TO authenticated
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Managers can manage tasks" ON public.vehicle_tasks
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

-- 7. Create driver health declarations table
CREATE TABLE public.driver_health_declarations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid,
  driver_name text DEFAULT '',
  id_number text DEFAULT '',
  license_number text DEFAULT '',
  signature_url text DEFAULT '',
  license_image_url text DEFAULT '',
  declaration_date date DEFAULT CURRENT_DATE,
  company_name text DEFAULT '',
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.driver_health_declarations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company declarations" ON public.driver_health_declarations
  FOR SELECT TO authenticated
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated can insert declarations" ON public.driver_health_declarations
  FOR INSERT TO authenticated
  WITH CHECK (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Managers can manage declarations" ON public.driver_health_declarations
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));
