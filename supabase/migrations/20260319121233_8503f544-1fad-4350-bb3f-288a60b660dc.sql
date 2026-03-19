
CREATE TABLE public.customer_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  serial_number TEXT DEFAULT '',
  description TEXT DEFAULT '',
  amount_before_vat NUMERIC DEFAULT NULL,
  amount_with_vat NUMERIC DEFAULT NULL,
  company_name TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.customer_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can manage customer agreements"
  ON public.customer_agreements FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Users can view own company agreements"
  ON public.customer_agreements FOR SELECT TO authenticated
  USING (
    company_name = get_user_company(auth.uid())
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );
