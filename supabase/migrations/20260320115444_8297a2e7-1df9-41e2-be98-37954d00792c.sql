ALTER TABLE public.company_settings
ADD COLUMN require_insurance_docs boolean NOT NULL DEFAULT true,
ADD COLUMN require_no_claims boolean NOT NULL DEFAULT true;