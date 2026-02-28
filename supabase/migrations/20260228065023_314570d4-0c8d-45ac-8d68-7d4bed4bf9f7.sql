
-- Customers table
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  customer_type text DEFAULT 'company',
  contact_person text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  address text DEFAULT '',
  notes text DEFAULT '',
  status text DEFAULT 'active',
  company_name text DEFAULT '',
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company customers" ON public.customers
  FOR SELECT TO authenticated
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Managers can manage own company customers" ON public.customers
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Routes table
CREATE TABLE public.routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  origin text DEFAULT '',
  destination text DEFAULT '',
  stops text[] DEFAULT '{}',
  distance_km numeric DEFAULT 0,
  start_time text DEFAULT '',
  end_time text DEFAULT '',
  days_of_week text[] DEFAULT '{}',
  service_type text DEFAULT '',
  customer_name text DEFAULT '',
  driver_name text DEFAULT '',
  vehicle_plate text DEFAULT '',
  status text DEFAULT 'active',
  notes text DEFAULT '',
  company_name text DEFAULT '',
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company routes" ON public.routes
  FOR SELECT TO authenticated
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Managers can manage own company routes" ON public.routes
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );
