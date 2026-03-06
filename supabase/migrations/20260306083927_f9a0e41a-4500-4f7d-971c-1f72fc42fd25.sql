
ALTER TABLE public.work_assignments
  ADD COLUMN IF NOT EXISTS manager_approved_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS manager_approved_by uuid DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS manager_approved_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS approval_source_driver text DEFAULT '',
  ADD COLUMN IF NOT EXISTS approval_source_manager text DEFAULT '';
