
-- 1. company_settings - WhatsApp config per company
CREATE TABLE public.company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL UNIQUE,
  whatsapp_phone text DEFAULT '',
  whatsapp_enabled boolean DEFAULT true,
  whatsapp_button_color text DEFAULT '#25D366',
  whatsapp_button_text text DEFAULT 'וואטסאפ למוקד',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins can manage company_settings" ON public.company_settings FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Users can view own company settings" ON public.company_settings FOR SELECT USING (company_name = get_user_company(auth.uid()));

-- 2. fault_messages - Internal chat per fault
CREATE TABLE public.fault_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fault_id uuid NOT NULL REFERENCES public.faults(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_name text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  company_name text DEFAULT ''
);
ALTER TABLE public.fault_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own company fault messages" ON public.fault_messages FOR SELECT USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Authenticated can insert fault messages" ON public.fault_messages FOR INSERT WITH CHECK (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

-- 3. fault_status_log - Audit trail for status changes
CREATE TABLE public.fault_status_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fault_id uuid NOT NULL REFERENCES public.faults(id) ON DELETE CASCADE,
  old_status text DEFAULT '',
  new_status text NOT NULL DEFAULT '',
  changed_by uuid,
  changed_by_name text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  company_name text DEFAULT ''
);
ALTER TABLE public.fault_status_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own company status log" ON public.fault_status_log FOR SELECT USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Authenticated can insert status log" ON public.fault_status_log FOR INSERT WITH CHECK (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

-- 4. fault_referrals - Service provider referrals with approval workflow
CREATE TABLE public.fault_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fault_id uuid NOT NULL REFERENCES public.faults(id) ON DELETE CASCADE,
  provider_name text NOT NULL DEFAULT '',
  provider_type text DEFAULT '',
  provider_phone text DEFAULT '',
  status text NOT NULL DEFAULT 'pending_approval',
  requested_by uuid,
  requested_by_name text DEFAULT '',
  approved_by uuid,
  approved_by_name text DEFAULT '',
  approved_at timestamptz,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  company_name text DEFAULT ''
);
ALTER TABLE public.fault_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own company referrals" ON public.fault_referrals FOR SELECT USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Managers can manage referrals" ON public.fault_referrals FOR ALL USING ((has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Authenticated can insert referrals" ON public.fault_referrals FOR INSERT WITH CHECK (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

-- 5. Add towing columns to faults
ALTER TABLE public.faults ADD COLUMN IF NOT EXISTS towing_required boolean DEFAULT false;
ALTER TABLE public.faults ADD COLUMN IF NOT EXISTS towing_approved boolean;
ALTER TABLE public.faults ADD COLUMN IF NOT EXISTS towing_approved_by text DEFAULT '';
ALTER TABLE public.faults ADD COLUMN IF NOT EXISTS towing_approved_at timestamptz;
ALTER TABLE public.faults ADD COLUMN IF NOT EXISTS towing_completed boolean;
ALTER TABLE public.faults ADD COLUMN IF NOT EXISTS towing_completed_at timestamptz;

-- 6. Enable realtime for fault_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.fault_messages;
