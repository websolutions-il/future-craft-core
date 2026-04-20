
-- Add exam_type to driving_exams
ALTER TABLE public.driving_exams 
ADD COLUMN IF NOT EXISTS exam_type text NOT NULL DEFAULT 'general';

-- Add manager signature
ALTER TABLE public.driving_exams 
ADD COLUMN IF NOT EXISTS manager_signature_url text DEFAULT '';

-- Add exam validity in months
ALTER TABLE public.driving_exams 
ADD COLUMN IF NOT EXISTS exam_validity_months integer DEFAULT 12;

-- Add last exam date and expiry to drivers
ALTER TABLE public.drivers 
ADD COLUMN IF NOT EXISTS last_exam_date date DEFAULT NULL;

ALTER TABLE public.drivers 
ADD COLUMN IF NOT EXISTS exam_expiry date DEFAULT NULL;
