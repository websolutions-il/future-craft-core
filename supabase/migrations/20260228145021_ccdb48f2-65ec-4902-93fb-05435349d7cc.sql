
CREATE TABLE public.temporary_drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL DEFAULT '',
  id_number text NOT NULL DEFAULT '',
  license_number text NOT NULL DEFAULT '',
  license_expiry date,
  phone text DEFAULT '',
  company_name text DEFAULT '',
  handover_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.temporary_drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert temp drivers" ON public.temporary_drivers
  FOR INSERT TO authenticated
  WITH CHECK (
    (company_name = get_user_company(auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Users can view own company temp drivers" ON public.temporary_drivers
  FOR SELECT TO authenticated
  USING (
    (company_name = get_user_company(auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role)
  );
