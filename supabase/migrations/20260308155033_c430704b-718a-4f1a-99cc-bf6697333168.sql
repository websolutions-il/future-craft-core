
-- Create suppliers table
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text DEFAULT '' NOT NULL,
  name text NOT NULL DEFAULT '',
  supplier_type text DEFAULT '' NOT NULL,
  phone text DEFAULT '',
  email text DEFAULT '',
  address text DEFAULT '',
  contact_person text DEFAULT '',
  notes text DEFAULT '',
  status text DEFAULT 'active' NOT NULL,
  created_by uuid,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Managers can manage suppliers"
ON public.suppliers FOR ALL TO authenticated
USING (
  (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can view own company suppliers"
ON public.suppliers FOR SELECT TO authenticated
USING (
  company_name = get_user_company(auth.uid())
  OR has_role(auth.uid(), 'super_admin'::app_role)
);
