
ALTER TABLE public.work_assignments
  ADD COLUMN IF NOT EXISTS customer_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS customer_id uuid DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS customer_approved_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS end_time text DEFAULT '',
  ADD COLUMN IF NOT EXISTS rejected_by text DEFAULT '',
  ADD COLUMN IF NOT EXISTS rejection_reason text DEFAULT '';
