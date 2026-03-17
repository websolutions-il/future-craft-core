
-- Add new columns to suppliers table
ALTER TABLE public.suppliers 
  ADD COLUMN IF NOT EXISTS supplier_number text DEFAULT '',
  ADD COLUMN IF NOT EXISTS supplier_kind text NOT NULL DEFAULT 'permanent',
  ADD COLUMN IF NOT EXISTS business_id text DEFAULT '',
  ADD COLUMN IF NOT EXISTS entity_type text DEFAULT '';

-- Create sequence for supplier numbers
CREATE SEQUENCE IF NOT EXISTS supplier_number_seq START 1001;

-- Create function to auto-generate supplier number
CREATE OR REPLACE FUNCTION public.set_supplier_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.supplier_number IS NULL OR NEW.supplier_number = '' THEN
    NEW.supplier_number := 'SUP-' || LPAD(nextval('supplier_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for auto supplier number
DROP TRIGGER IF EXISTS trg_set_supplier_number ON public.suppliers;
CREATE TRIGGER trg_set_supplier_number
  BEFORE INSERT ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_supplier_number();

-- Create supplier_work_orders table
CREATE TABLE public.supplier_work_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text DEFAULT '',
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  supplier_name text DEFAULT '',
  supplier_number text DEFAULT '',
  description text DEFAULT '',
  work_type text DEFAULT '',
  approved_amount numeric DEFAULT 0,
  execution_date date,
  status text NOT NULL DEFAULT 'open',
  ordering_user text DEFAULT '',
  ordering_user_id uuid,
  company_name text NOT NULL DEFAULT '',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  notes text DEFAULT '',
  expense_id uuid
);

-- Create sequence for work order numbers
CREATE SEQUENCE IF NOT EXISTS work_order_number_seq START 1001;

-- Create function to auto-generate work order number
CREATE OR REPLACE FUNCTION public.set_work_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'WO-' || LPAD(nextval('work_order_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_work_order_number ON public.supplier_work_orders;
CREATE TRIGGER trg_set_work_order_number
  BEFORE INSERT ON public.supplier_work_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_work_order_number();

-- Enable RLS
ALTER TABLE public.supplier_work_orders ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own company work orders"
  ON public.supplier_work_orders FOR SELECT TO authenticated
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Managers can manage work orders"
  ON public.supplier_work_orders FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );
