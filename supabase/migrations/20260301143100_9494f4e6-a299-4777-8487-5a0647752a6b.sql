
CREATE TABLE public.document_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path text NOT NULL,
  category text NOT NULL DEFAULT '',
  company_name text DEFAULT '',
  vehicle_plate text DEFAULT '',
  driver_name text DEFAULT '',
  manufacturer text DEFAULT '',
  model text DEFAULT '',
  original_name text DEFAULT '',
  uploaded_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.document_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company docs metadata"
  ON public.document_metadata FOR SELECT
  TO authenticated
  USING (
    (company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Managers can manage docs metadata"
  ON public.document_metadata FOR ALL
  TO authenticated
  USING (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );
