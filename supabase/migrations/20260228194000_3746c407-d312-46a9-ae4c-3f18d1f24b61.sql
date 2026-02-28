
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS customer_number text DEFAULT '',
  ADD COLUMN IF NOT EXISTS business_id text DEFAULT '',
  ADD COLUMN IF NOT EXISTS fax text DEFAULT '';
