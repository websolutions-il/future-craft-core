
-- Vehicles table
CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_plate text NOT NULL,
  manufacturer text DEFAULT '',
  model text DEFAULT '',
  year integer,
  vehicle_type text DEFAULT '',
  odometer integer DEFAULT 0,
  company_name text DEFAULT '',
  assigned_driver_id uuid,
  test_expiry date,
  insurance_expiry date,
  comprehensive_insurance_expiry date,
  notes text DEFAULT '',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company vehicles" ON public.vehicles
  FOR SELECT TO authenticated
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Managers can manage own company vehicles" ON public.vehicles
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Drivers table
CREATE TABLE public.drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL DEFAULT '',
  license_number text DEFAULT '',
  license_expiry date,
  license_types text[] DEFAULT '{}',
  email text DEFAULT '',
  phone text DEFAULT '',
  city text DEFAULT '',
  street text DEFAULT '',
  notes text DEFAULT '',
  status text DEFAULT 'active',
  company_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company drivers" ON public.drivers
  FOR SELECT TO authenticated
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Managers can manage own company drivers" ON public.drivers
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Faults table
CREATE TABLE public.faults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_id text DEFAULT '',
  date timestamptz DEFAULT now(),
  driver_name text DEFAULT '',
  vehicle_plate text DEFAULT '',
  fault_type text DEFAULT '',
  description text DEFAULT '',
  urgency text DEFAULT 'normal',
  status text DEFAULT 'new',
  notes text DEFAULT '',
  company_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  created_by uuid
);

ALTER TABLE public.faults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company faults" ON public.faults
  FOR SELECT TO authenticated
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can insert faults" ON public.faults
  FOR INSERT TO authenticated
  WITH CHECK (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Managers can update faults" ON public.faults
  FOR UPDATE TO authenticated
  USING (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR created_by = auth.uid()
  );

-- Accidents table
CREATE TABLE public.accidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date timestamptz DEFAULT now(),
  vehicle_plate text DEFAULT '',
  driver_name text DEFAULT '',
  location text DEFAULT '',
  description text DEFAULT '',
  has_insurance boolean DEFAULT false,
  third_party boolean DEFAULT false,
  estimated_cost numeric DEFAULT 0,
  images text DEFAULT '',
  status text DEFAULT 'open',
  notes text DEFAULT '',
  company_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  created_by uuid
);

ALTER TABLE public.accidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company accidents" ON public.accidents
  FOR SELECT TO authenticated
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can insert accidents" ON public.accidents
  FOR INSERT TO authenticated
  WITH CHECK (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Managers can update accidents" ON public.accidents
  FOR UPDATE TO authenticated
  USING (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR created_by = auth.uid()
  );

-- Expenses table
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date timestamptz DEFAULT now(),
  driver_name text DEFAULT '',
  vehicle_plate text DEFAULT '',
  category text DEFAULT '',
  vendor text DEFAULT '',
  invoice_number text DEFAULT '',
  invoice_date date,
  amount numeric DEFAULT 0,
  odometer integer DEFAULT 0,
  image_url text DEFAULT '',
  notes text DEFAULT '',
  company_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  created_by uuid
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company expenses" ON public.expenses
  FOR SELECT TO authenticated
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can insert expenses" ON public.expenses
  FOR INSERT TO authenticated
  WITH CHECK (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Vehicle handovers table
CREATE TABLE public.vehicle_handovers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_time timestamptz DEFAULT now(),
  action_type text DEFAULT '',
  vehicle_plate text DEFAULT '',
  vehicle_type text DEFAULT '',
  manufacturer text DEFAULT '',
  model text DEFAULT '',
  odometer integer DEFAULT 0,
  vehicle_notes text DEFAULT '',
  giving_driver_name text DEFAULT '',
  giving_driver_phone text DEFAULT '',
  receiving_driver_name text DEFAULT '',
  receiving_driver_phone text DEFAULT '',
  pickup_date date,
  pickup_time text DEFAULT '',
  location_name text DEFAULT '',
  location_address text DEFAULT '',
  lat numeric,
  lng numeric,
  damage_summary text DEFAULT '',
  condition_checklist jsonb DEFAULT '[]',
  reference_number text DEFAULT '',
  company_name text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  created_by uuid
);

ALTER TABLE public.vehicle_handovers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company handovers" ON public.vehicle_handovers
  FOR SELECT TO authenticated
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can insert handovers" ON public.vehicle_handovers
  FOR INSERT TO authenticated
  WITH CHECK (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Service orders table
CREATE TABLE public.service_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_time timestamptz DEFAULT now(),
  ordering_user text DEFAULT '',
  driver_name text DEFAULT '',
  driver_phone text DEFAULT '',
  vehicle_plate text DEFAULT '',
  vehicle_type text DEFAULT '',
  manufacturer text DEFAULT '',
  model text DEFAULT '',
  odometer integer DEFAULT 0,
  vehicle_notes text DEFAULT '',
  vendor_name text DEFAULT '',
  vendor_phone text DEFAULT '',
  service_category text DEFAULT '',
  service_date date,
  service_time text DEFAULT '',
  description text DEFAULT '',
  manager_approval text DEFAULT '',
  treatment_status text DEFAULT 'new',
  reference_number text DEFAULT '',
  company_name text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  created_by uuid
);

ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company service orders" ON public.service_orders
  FOR SELECT TO authenticated
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Managers can manage service orders" ON public.service_orders
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );
