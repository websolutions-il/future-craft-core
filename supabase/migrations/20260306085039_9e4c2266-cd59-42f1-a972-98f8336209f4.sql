
-- System audit log table - immutable, super_admin only view
CREATE TABLE public.system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid,
  user_name text NOT NULL DEFAULT '',
  company_name text NOT NULL DEFAULT '',
  action_type text NOT NULL DEFAULT '',
  entity_type text NOT NULL DEFAULT '',
  entity_id text DEFAULT '',
  vehicle_plate text DEFAULT '',
  old_status text DEFAULT '',
  new_status text DEFAULT '',
  details text DEFAULT '',
  channel text DEFAULT 'system'
);

ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Only super_admin can view logs, no one can delete/update
CREATE POLICY "Super admins can view system logs"
  ON public.system_logs FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated can insert system logs"
  ON public.system_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Approval requests table
CREATE TABLE public.approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  company_name text NOT NULL DEFAULT '',
  entity_type text NOT NULL DEFAULT '',
  entity_id text DEFAULT '',
  action_type text NOT NULL DEFAULT '',
  vehicle_plate text DEFAULT '',
  description text DEFAULT '',
  requested_by uuid,
  requested_by_name text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  approved_by uuid,
  approved_by_name text DEFAULT '',
  approved_at timestamptz,
  rejection_reason text DEFAULT '',
  notification_sent boolean DEFAULT false,
  reminder_count integer DEFAULT 0,
  last_reminder_at timestamptz
);

ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own company approvals"
  ON public.approval_requests FOR SELECT
  TO authenticated
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated can insert approvals"
  ON public.approval_requests FOR INSERT
  TO authenticated
  WITH CHECK (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Managers can update approvals"
  ON public.approval_requests FOR UPDATE
  TO authenticated
  USING (
    (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Add reminder settings columns to company_settings
ALTER TABLE public.company_settings
  ADD COLUMN IF NOT EXISTS reminder_30_days boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS reminder_7_days boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS reminder_1_day boolean DEFAULT true;
