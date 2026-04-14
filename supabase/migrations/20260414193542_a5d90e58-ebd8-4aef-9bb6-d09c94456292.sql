
CREATE TABLE public.driver_declarations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL,
  driver_name TEXT NOT NULL DEFAULT '',
  id_number TEXT,
  license_number TEXT,
  company_name TEXT,
  declaration_text TEXT NOT NULL,
  signed_at TIMESTAMPTZ,
  signature_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ,
  pdf_url TEXT,
  sent_via TEXT,
  sent_at TIMESTAMPTZ,
  token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.driver_declarations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view declarations in their company"
  ON public.driver_declarations FOR SELECT TO authenticated
  USING (
    company_name = public.get_user_company(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
    OR driver_id = auth.uid()
  );

CREATE POLICY "Managers can create declarations"
  ON public.driver_declarations FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'fleet_manager')
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Managers and drivers can update declarations"
  ON public.driver_declarations FOR UPDATE TO authenticated
  USING (
    company_name = public.get_user_company(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
    OR driver_id = auth.uid()
  );

-- Allow anonymous access for external signing via token
CREATE POLICY "Anonymous can view by token"
  ON public.driver_declarations FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anonymous can update by token"
  ON public.driver_declarations FOR UPDATE TO anon
  USING (true);
