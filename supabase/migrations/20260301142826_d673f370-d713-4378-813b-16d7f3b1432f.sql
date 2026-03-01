
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS agreement_description TEXT,
ADD COLUMN IF NOT EXISTS agreement_amount_before_vat NUMERIC,
ADD COLUMN IF NOT EXISTS agreement_amount_with_vat NUMERIC,
ADD COLUMN IF NOT EXISTS agreement_serial_number TEXT;
