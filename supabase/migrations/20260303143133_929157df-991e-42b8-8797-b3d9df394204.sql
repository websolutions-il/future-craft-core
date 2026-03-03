
-- Internal chat between users
CREATE TABLE public.internal_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  sender_name text NOT NULL DEFAULT '',
  recipient_id uuid NOT NULL,
  message text NOT NULL DEFAULT '',
  is_read boolean DEFAULT false,
  company_name text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.internal_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON public.internal_messages FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "Users can insert messages" ON public.internal_messages FOR INSERT WITH CHECK (sender_id = auth.uid() AND (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role)));
CREATE POLICY "Users can update own received" ON public.internal_messages FOR UPDATE USING (recipient_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE public.internal_messages;

-- Company subscriptions
CREATE TABLE public.company_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL UNIQUE,
  plan_name text DEFAULT 'בסיסי',
  monthly_price numeric DEFAULT 0,
  billing_day integer DEFAULT 1,
  status text DEFAULT 'active',
  payment_method text DEFAULT '',
  last_payment_date timestamptz,
  next_payment_date timestamptz,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.company_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage subscriptions" ON public.company_subscriptions FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Users view own subscription" ON public.company_subscriptions FOR SELECT USING (company_name = get_user_company(auth.uid()));

-- Promotions table
CREATE TABLE public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  image_url text DEFAULT '',
  target_companies text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  start_date date,
  end_date date,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage promotions" ON public.promotions FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Users view relevant promotions" ON public.promotions FOR SELECT USING (
  is_active = true AND (
    target_companies = '{}' OR 
    get_user_company(auth.uid()) = ANY(target_companies) OR
    has_role(auth.uid(), 'super_admin'::app_role)
  )
);
