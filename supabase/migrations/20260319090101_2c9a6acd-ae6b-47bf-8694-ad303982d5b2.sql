
-- Add new columns to vehicles table for management type
ALTER TABLE public.vehicles 
  ADD COLUMN IF NOT EXISTS management_type text DEFAULT 'operational_leasing',
  ADD COLUMN IF NOT EXISTS monthly_leasing_cost numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS vehicle_return_date date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS monthly_loan_payment numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS loan_end_date date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS planned_replacement_date date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS has_loan boolean DEFAULT false;

-- Create vehicle insurance history table (yearly)
CREATE TABLE public.vehicle_insurance_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  year integer NOT NULL,
  has_no_claims boolean DEFAULT false,
  insurer_name text DEFAULT '',
  mandatory_insurance_cost numeric DEFAULT 0,
  comprehensive_insurance_cost numeric DEFAULT 0,
  company_name text DEFAULT '',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(vehicle_id, year)
);

-- Enable RLS
ALTER TABLE public.vehicle_insurance_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for insurance history
CREATE POLICY "Users can view own company insurance history"
  ON public.vehicle_insurance_history
  FOR SELECT
  TO authenticated
  USING (
    company_name = get_user_company(auth.uid()) 
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Managers can manage insurance history"
  ON public.vehicle_insurance_history
  FOR ALL
  TO authenticated
  USING (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );
