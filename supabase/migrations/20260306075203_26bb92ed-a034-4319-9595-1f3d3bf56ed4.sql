
-- Emergency categories per company
CREATE TABLE public.emergency_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  category_key text NOT NULL DEFAULT '',
  category_label text NOT NULL DEFAULT '',
  category_icon text NOT NULL DEFAULT '',
  target_type text NOT NULL DEFAULT 'whatsapp',
  target_value text NOT NULL DEFAULT '',
  auto_message_template text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.emergency_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage emergency categories"
  ON public.emergency_categories FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view own company emergency categories"
  ON public.emergency_categories FOR SELECT TO authenticated
  USING (company_name = get_user_company(auth.uid()));

-- Emergency event logs
CREATE TABLE public.emergency_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT '',
  user_id uuid NOT NULL,
  user_name text NOT NULL DEFAULT '',
  category_key text NOT NULL DEFAULT '',
  category_label text NOT NULL DEFAULT '',
  target_type text NOT NULL DEFAULT '',
  target_value text NOT NULL DEFAULT '',
  vehicle_plate text DEFAULT '',
  location text DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by text DEFAULT ''
);

ALTER TABLE public.emergency_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own emergency logs"
  ON public.emergency_logs FOR INSERT TO authenticated
  WITH CHECK (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view own company emergency logs"
  ON public.emergency_logs FOR SELECT TO authenticated
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Managers can update emergency logs"
  ON public.emergency_logs FOR UPDATE TO authenticated
  USING (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );
