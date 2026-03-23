
-- Create sequence for deal numbers
CREATE SEQUENCE IF NOT EXISTS customer_deal_number_seq START 1;

-- Create customer_deals table
CREATE TABLE public.customer_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  deal_number TEXT DEFAULT '',
  customer_name TEXT DEFAULT '',
  work_type TEXT DEFAULT '',
  description TEXT DEFAULT '',
  amount NUMERIC DEFAULT 0,
  open_date DATE DEFAULT CURRENT_DATE,
  target_date DATE DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  company_name TEXT DEFAULT '',
  created_by UUID DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-generate deal number
CREATE OR REPLACE FUNCTION public.set_deal_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.deal_number IS NULL OR NEW.deal_number = '' THEN
    NEW.deal_number := 'DL-' || LPAD(nextval('customer_deal_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_deal_number_trigger
  BEFORE INSERT ON public.customer_deals
  FOR EACH ROW EXECUTE FUNCTION public.set_deal_number();

-- Enable RLS
ALTER TABLE public.customer_deals ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Managers can manage deals"
  ON public.customer_deals FOR ALL
  TO authenticated
  USING (
    (has_role(auth.uid(), 'fleet_manager') AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    (has_role(auth.uid(), 'fleet_manager') AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Users can view own company deals"
  ON public.customer_deals FOR SELECT
  TO authenticated
  USING (
    company_name = get_user_company(auth.uid())
    OR has_role(auth.uid(), 'super_admin')
  );
