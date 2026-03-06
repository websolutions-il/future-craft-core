
-- Add new columns to vehicles table
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS insurance_start date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS comprehensive_insurance_start date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS next_service_date date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS last_service_date date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS needs_transport boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS license_doc_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS insurance_doc_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS comprehensive_insurance_doc_url text DEFAULT '';

-- Add alert settings to company_settings
ALTER TABLE public.company_settings
  ADD COLUMN IF NOT EXISTS vehicle_approval_required boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS alert_days_before integer DEFAULT 30;
