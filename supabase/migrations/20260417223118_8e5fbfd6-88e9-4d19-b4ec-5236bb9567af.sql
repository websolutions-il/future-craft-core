
-- 1. call_logs
CREATE TABLE public.call_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid,
  vehicle_id uuid,
  customer_name text DEFAULT '',
  vehicle_plate text DEFAULT '',
  phone text DEFAULT '',
  direction text NOT NULL DEFAULT 'outbound' CHECK (direction IN ('outbound','inbound')),
  flow_type text NOT NULL DEFAULT 'pickup_ready' CHECK (flow_type IN ('pickup_ready','service_reminder','price_offer','inbound_general')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','no_answer','failed')),
  outcome text CHECK (outcome IN ('booked','declined','callback','unknown')),
  transcript text DEFAULT '',
  recording_url text DEFAULT '',
  duration_sec integer DEFAULT 0,
  twilio_call_sid text DEFAULT '',
  company_name text DEFAULT '',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own company call_logs" ON public.call_logs FOR SELECT TO authenticated
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(),'super_admin'));
CREATE POLICY "Managers manage call_logs" ON public.call_logs FOR ALL TO authenticated
  USING ((has_role(auth.uid(),'fleet_manager') AND company_name = get_user_company(auth.uid())) OR has_role(auth.uid(),'super_admin'))
  WITH CHECK ((has_role(auth.uid(),'fleet_manager') AND company_name = get_user_company(auth.uid())) OR has_role(auth.uid(),'super_admin'));

CREATE TRIGGER trg_call_logs_updated BEFORE UPDATE ON public.call_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. voice_campaigns
CREATE TABLE public.voice_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  flow_type text NOT NULL DEFAULT 'pickup_ready',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','running','completed','paused')),
  scheduled_at timestamptz,
  total_calls integer DEFAULT 0,
  completed_calls integer DEFAULT 0,
  booked_count integer DEFAULT 0,
  company_name text DEFAULT '',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.voice_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own company campaigns" ON public.voice_campaigns FOR SELECT TO authenticated
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(),'super_admin'));
CREATE POLICY "Managers manage campaigns" ON public.voice_campaigns FOR ALL TO authenticated
  USING ((has_role(auth.uid(),'fleet_manager') AND company_name = get_user_company(auth.uid())) OR has_role(auth.uid(),'super_admin'))
  WITH CHECK ((has_role(auth.uid(),'fleet_manager') AND company_name = get_user_company(auth.uid())) OR has_role(auth.uid(),'super_admin'));
CREATE TRIGGER trg_voice_campaigns_updated BEFORE UPDATE ON public.voice_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. campaign_customers
CREATE TABLE public.campaign_customers (
  campaign_id uuid NOT NULL REFERENCES public.voice_campaigns(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL,
  call_status text DEFAULT 'pending',
  PRIMARY KEY (campaign_id, customer_id)
);
ALTER TABLE public.campaign_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Managers manage campaign_customers" ON public.campaign_customers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.voice_campaigns vc WHERE vc.id = campaign_id AND
    ((has_role(auth.uid(),'fleet_manager') AND vc.company_name = get_user_company(auth.uid())) OR has_role(auth.uid(),'super_admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.voice_campaigns vc WHERE vc.id = campaign_id AND
    ((has_role(auth.uid(),'fleet_manager') AND vc.company_name = get_user_company(auth.uid())) OR has_role(auth.uid(),'super_admin'))));

-- 4. voice_prompts (global, super_admin manages, all read)
CREATE TABLE public.voice_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_type text UNIQUE NOT NULL,
  display_name text NOT NULL,
  system_prompt text NOT NULL,
  opener_text text NOT NULL,
  max_turns integer DEFAULT 5,
  fallback_sms boolean DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.voice_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All can read prompts" ON public.voice_prompts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can update prompts" ON public.voice_prompts FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'fleet_manager') OR has_role(auth.uid(),'super_admin'));
CREATE POLICY "Super admin insert prompts" ON public.voice_prompts FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'super_admin'));
CREATE TRIGGER trg_voice_prompts_updated BEFORE UPDATE ON public.voice_prompts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed prompts
INSERT INTO public.voice_prompts (flow_type, display_name, system_prompt, opener_text) VALUES
('pickup_ready', 'רכב מוכן לאיסוף',
 'You are a friendly Hebrew-speaking assistant for an auto garage. Notify the customer their vehicle is ready and schedule a pickup time. Be brief, warm, professional. Always speak Hebrew.',
 'שלום {{customer_name}}, אני מתקשר מ-{{garage_name}}. הרכב שלך {{vehicle_make}} {{vehicle_model}} מוכן לאיסוף. מתי נוח לך לבוא?'),
('service_reminder', 'תזכורת טיפול תקופתי',
 'You are a friendly Hebrew-speaking assistant for an auto garage. Remind the customer about their periodic service and offer to book.',
 'שלום {{customer_name}}, הגיע הזמן לטיפול תקופתי לרכב שלך. יש מקום ב-{{slot_1}} או {{slot_2}}. מה מתאים?'),
('price_offer', 'הצעת מחיר',
 'You are a friendly Hebrew-speaking sales assistant. Present a service offer professionally.',
 'שלום {{customer_name}}, יש לנו מבצע מיוחד החודש. תרצה לשמוע פרטים?'),
('inbound_general', 'שיחה נכנסת כללית',
 'You are the AI receptionist for {{garage_name}}. Help customers schedule, check status, or connect to staff.',
 'שלום, הגעת ל-{{garage_name}}. אני הסוכן הדיגיטלי. איך אוכל לעזור?');
